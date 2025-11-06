# Quick Deployment Guide

## Step 1: Install AWS CLI

```bash
# On Arch Linux:
sudo pacman -S aws-cli

# Or using pip:
pip install awscli

# Verify:
aws --version
```

## Step 2: Configure AWS Credentials

### For Local Deployment (IAM User with Programmatic Access)

**Create IAM User:**
1. Go to AWS Console → IAM → Users → Create User
2. Username: `website-deployer` (or any name)
3. Attach policy: `AmazonS3FullAccess` (or create minimal policy - see `AWS-IAM-SETUP.md`)
4. Create access key: Security credentials tab → Create access key → CLI
5. **Copy both keys** (you can only see the secret once!)

**Configure AWS CLI:**
```bash
aws configure
```

You'll need:
- **AWS Access Key ID**: From step above
- **AWS Secret Access Key**: From step above
- **Default region**: e.g., `us-east-1`
- **Default output format**: `json`

**Or** set environment variables:
```bash
export AWS_ACCESS_KEY_ID=your-access-key
export AWS_SECRET_ACCESS_KEY=your-secret-key
export AWS_REGION=us-east-1
```

📖 **Detailed IAM setup**: See `AWS-IAM-SETUP.md` for minimal policies and OIDC setup

## Step 3: Choose Your S3 Bucket Name

Your bucket name must be **globally unique** across all AWS accounts. Examples:
- `nicolelu-portfolio-website`
- `nicolelu-personal-website-2024`
- `your-unique-name-here`

## Step 4: Deploy!

### Option A: Automatic (Recommended)
```bash
# Set your bucket name
export AWS_S3_BUCKET=your-bucket-name
export AWS_REGION=us-east-1

# Deploy (the script will create the bucket if it doesn't exist)
npm run deploy
```

### Option B: Manual Step-by-Step
```bash
# 1. Build the project
npm run build:aws

# 2. Create S3 bucket (if it doesn't exist)
aws s3 mb s3://your-bucket-name --region us-east-1

# 3. Configure static website hosting
aws s3 website s3://your-bucket-name \
  --index-document index.html \
  --error-document index.html

# 4. Set bucket policy for public access
cat > /tmp/bucket-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-bucket-name/*"
    }
  ]
}
EOF

aws s3api put-bucket-policy \
  --bucket your-bucket-name \
  --policy file:///tmp/bucket-policy.json

# 5. Upload files
aws s3 sync dist s3://your-bucket-name --delete

# 6. Get your website URL
echo "Your website: http://your-bucket-name.s3-website-us-east-1.amazonaws.com"
```

## Step 5: Access Your Website

After deployment, your website will be available at:
```
http://YOUR-BUCKET-NAME.s3-website-REGION.amazonaws.com
```

For example:
```
http://nicolelu-portfolio-website.s3-website-us-east-1.amazonaws.com
```

## Optional: Set Up CloudFront (HTTPS + Custom Domain)

1. Go to AWS Console → CloudFront → Create Distribution
2. Set Origin Domain to: `YOUR-BUCKET-NAME.s3-website-us-east-1.amazonaws.com`
3. Set Viewer Protocol Policy: Redirect HTTP to HTTPS
4. Create distribution
5. Copy the Distribution ID
6. Add to your deployment:
   ```bash
   export AWS_CLOUDFRONT_ID=your-distribution-id
   npm run deploy
   ```

## Troubleshooting

### "Access Denied" errors
- Make sure your IAM user has `s3:*` permissions, OR
- Make sure bucket policy is set correctly (the deploy script does this automatically)

### "Bucket already exists" error
- Choose a different, globally unique bucket name

### "Invalid credentials"
- Run `aws configure` again
- Or check your environment variables

## AWS Free Tier: Will This Cost Money?

**Yes, you can use AWS Free Tier!** Here's what's included:

### S3 Free Tier (First 12 Months)
- ✅ **5 GB storage** - Plenty for your website
- ✅ **20,000 GET requests/month** - Fine for personal sites
- ✅ **2,000 PUT requests/month** - Enough for deployments

### CloudFront Free Tier (First 12 Months)  
- ✅ **50 GB data transfer/month** - Great for CDN
- ✅ **2,000,000 HTTP/HTTPS requests/month** - More than enough

### After 12 Months
Even after the free tier expires, costs are **very low**:
- **S3**: ~$0.023 per GB/month (so ~$0.12/month for 5GB)
- **S3 Data Transfer**: First 1 GB free, then ~$0.09 per GB
- **CloudFront**: First 1 TB free, then ~$0.085 per GB
- **Total**: Typically **$0-5/month** for a small personal website

### Cost Estimate for Your Site
- Your website is probably **< 100 MB** (models, images, HTML/JS)
- With moderate traffic: **$0-2/month** after free tier
- You can set up **billing alerts** in AWS to avoid surprises

**Bottom line**: Yes, use the free tier! It's perfect for your website. 🎉

## Next: Automated Deployment with GitHub Actions

Once you've deployed manually, set up GitHub Actions for automatic deployment.

### Option A: Access Keys (Simple, but less secure)

1. Go to your GitHub repo → Settings → Secrets and variables → Actions
2. Add these secrets:
   - `AWS_ACCESS_KEY_ID` - Your IAM user's access key
   - `AWS_SECRET_ACCESS_KEY` - Your IAM user's secret key
   - `AWS_S3_BUCKET` - Your bucket name
   - `AWS_REGION` - Your AWS region (e.g., `us-east-1`)
   - `AWS_CLOUDFRONT_ID` - Optional, your CloudFront distribution ID

3. Use `deploy.yml` workflow (already configured)
4. Push to `main` branch → automatic deployment! 🚀

### Option B: OIDC (Recommended - No long-lived secrets!)

**More secure** - uses temporary tokens instead of long-lived access keys.

1. Set up OIDC in AWS (see `AWS-IAM-SETUP.md` for detailed steps)
2. Go to your GitHub repo → Settings → Secrets and variables → Actions
3. Add these secrets:
   - `AWS_ROLE_ARN` - The ARN of your IAM role (e.g., `arn:aws:iam::123456789012:role/GitHubActionsRole`)
   - `AWS_S3_BUCKET` - Your bucket name
   - `AWS_REGION` - Your AWS region (e.g., `us-east-1`)
   - `AWS_CLOUDFRONT_ID` - Optional, your CloudFront distribution ID

4. **Rename** `deploy-oidc.yml` to `deploy.yml` (or keep both)
5. Push to `main` branch → automatic deployment! 🚀

📖 **Full OIDC setup guide**: See `AWS-IAM-SETUP.md`

