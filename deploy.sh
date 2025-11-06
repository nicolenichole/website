#!/bin/bash

# AWS Deployment Script
# This script builds and deploys the website to AWS S3 and optionally invalidates CloudFront cache

set -e  # Exit on error

# Configuration
BUCKET_NAME="${AWS_S3_BUCKET:-your-bucket-name}"
CLOUDFRONT_DISTRIBUTION_ID="${AWS_CLOUDFRONT_ID:-}"
AWS_REGION="${AWS_REGION:-us-east-1}"
BUILD_DIR="${BUILD_DIR:-dist}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting AWS deployment...${NC}"

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}Error: AWS CLI is not installed. Please install it first.${NC}"
    echo "Visit: https://aws.amazon.com/cli/"
    exit 1
fi

# Check if AWS credentials are configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}Error: AWS credentials are not configured.${NC}"
    echo "Run: aws configure"
    exit 1
fi

# Check if bucket name is set
if [ "$BUCKET_NAME" == "your-bucket-name" ]; then
    echo -e "${YELLOW}Warning: BUCKET_NAME not set. Using default.${NC}"
    echo "Set AWS_S3_BUCKET environment variable or update the script."
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Build the project
echo -e "${GREEN}Building project...${NC}"
export VITE_BASE_PATH=""
export VITE_OUT_DIR="$BUILD_DIR"
npm run build

if [ ! -d "$BUILD_DIR" ]; then
    echo -e "${RED}Error: Build directory '$BUILD_DIR' not found. Build failed.${NC}"
    exit 1
fi

# Check if bucket exists, create if it doesn't
echo -e "${GREEN}Checking S3 bucket...${NC}"
if ! aws s3 ls "s3://$BUCKET_NAME" 2>&1 | grep -q 'NoSuchBucket'; then
    echo -e "${GREEN}Bucket exists.${NC}"
else
    echo -e "${YELLOW}Bucket does not exist. Creating bucket...${NC}"
    if aws s3 mb "s3://$BUCKET_NAME" --region "$AWS_REGION"; then
        echo -e "${GREEN}Bucket created successfully.${NC}"
    else
        echo -e "${RED}Error: Failed to create bucket.${NC}"
        exit 1
    fi
fi

# Enable static website hosting
echo -e "${GREEN}Configuring static website hosting...${NC}"
aws s3 website "s3://$BUCKET_NAME" \
    --index-document index.html \
    --error-document index.html

# Set bucket policy for public read access
echo -e "${GREEN}Setting bucket policy...${NC}"
cat > /tmp/bucket-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::$BUCKET_NAME/*"
    }
  ]
}
EOF

aws s3api put-bucket-policy \
    --bucket "$BUCKET_NAME" \
    --policy file:///tmp/bucket-policy.json

# Upload files to S3
echo -e "${GREEN}Uploading files to S3...${NC}"
aws s3 sync "$BUILD_DIR" "s3://$BUCKET_NAME" \
    --delete \
    --cache-control "public, max-age=31536000, immutable" \
    --exclude "*.html" \
    --exclude "*.json"

# Upload HTML files with shorter cache
aws s3 sync "$BUILD_DIR" "s3://$BUCKET_NAME" \
    --delete \
    --cache-control "public, max-age=0, must-revalidate" \
    --include "*.html" \
    --include "*.json"

# Set content types for specific file types
aws s3 cp "$BUILD_DIR" "s3://$BUCKET_NAME" \
    --recursive \
    --exclude "*" \
    --include "*.glb" \
    --content-type "model/gltf-binary" \
    --cache-control "public, max-age=31536000, immutable"

aws s3 cp "$BUILD_DIR" "s3://$BUCKET_NAME" \
    --recursive \
    --exclude "*" \
    --include "*.gltf" \
    --content-type "model/gltf+json" \
    --cache-control "public, max-age=31536000, immutable"

# Invalidate CloudFront cache if distribution ID is provided
if [ -n "$CLOUDFRONT_DISTRIBUTION_ID" ]; then
    echo -e "${GREEN}Invalidating CloudFront cache...${NC}"
    INVALIDATION_ID=$(aws cloudfront create-invalidation \
        --distribution-id "$CLOUDFRONT_DISTRIBUTION_ID" \
        --paths "/*" \
        --query 'Invalidation.Id' \
        --output text)
    echo -e "${GREEN}CloudFront invalidation created: $INVALIDATION_ID${NC}"
    echo "You can check the status with: aws cloudfront get-invalidation --distribution-id $CLOUDFRONT_DISTRIBUTION_ID --id $INVALIDATION_ID"
else
    echo -e "${YELLOW}No CloudFront distribution ID provided. Skipping cache invalidation.${NC}"
    echo "Set AWS_CLOUDFRONT_ID environment variable to enable CloudFront invalidation."
fi

# Get bucket website endpoint
WEBSITE_URL=$(aws s3api get-bucket-website \
    --bucket "$BUCKET_NAME" \
    --query 'WebsiteConfiguration.RedirectAllRequestsTo' \
    2>/dev/null || echo "")

if [ -z "$WEBSITE_URL" ]; then
    WEBSITE_URL="http://$BUCKET_NAME.s3-website-$AWS_REGION.amazonaws.com"
fi

echo -e "${GREEN}Deployment completed successfully!${NC}"
echo -e "${GREEN}Website URL: ${WEBSITE_URL}${NC}"

if [ -n "$CLOUDFRONT_DISTRIBUTION_ID" ]; then
    CLOUDFRONT_URL=$(aws cloudfront get-distribution \
        --id "$CLOUDFRONT_DISTRIBUTION_ID" \
        --query 'Distribution.DomainName' \
        --output text)
    echo -e "${GREEN}CloudFront URL: https://${CLOUDFRONT_URL}${NC}"
fi

# Cleanup
rm -f /tmp/bucket-policy.json

echo -e "${GREEN}Done!${NC}"

