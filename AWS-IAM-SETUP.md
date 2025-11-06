# AWS IAM Setup Guide

Based on your deployment method, here's exactly what you need:

## Option 1: Deploying from Your Laptop (Local Machine)

### Create IAM User with Programmatic Access

**Step 1: Create IAM User**
1. Go to AWS Console → IAM → Users → Create User
2. Username: `website-deployer` (or any name you like)
3. Click "Next"

**Step 2: Attach Minimal Policy**
Don't give full admin access! Use this minimal policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket",
        "s3:PutBucketWebsite",
        "s3:PutBucketPolicy",
        "s3:GetBucketLocation",
        "s3:GetBucketWebsite"
      ],
      "Resource": [
        "arn:aws:s3:::YOUR-BUCKET-NAME",
        "arn:aws:s3:::YOUR-BUCKET-NAME/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:CreateBucket",
        "s3:ListAllMyBuckets"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "cloudfront:CreateInvalidation",
        "cloudfront:GetInvalidation",
        "cloudfront:GetDistribution"
      ],
      "Resource": "*",
      "Condition": {
        "StringEquals": {
          "cloudfront:DistributionId": "YOUR-DISTRIBUTION-ID"
        }
      }
    }
  ]
}
```

**Or use these AWS managed policies (simpler but broader):**
- `AmazonS3FullAccess` (if only using S3)
- `CloudFrontFullAccess` (if using CloudFront)

**Step 3: Create Access Key**
1. Click on the user → "Security credentials" tab
2. Scroll to "Access keys" → "Create access key"
3. Choose "Command Line Interface (CLI)"
4. Click "Create access key"
5. **IMPORTANT**: Copy both:
   - **Access key ID**
   - **Secret access key** (you can only see this once!)

**Step 4: Configure AWS CLI**
```bash
aws configure
# Enter:
# - AWS Access Key ID: [paste your access key ID]
# - AWS Secret Access Key: [paste your secret key]
# - Default region: us-east-1
# - Default output format: json
```

**That's it!** You can now deploy with `npm run deploy`

---

## Option 2: GitHub Actions (Recommended - No Long-Lived Secrets!)

### Use OIDC (OpenID Connect) - More Secure

Instead of storing access keys in GitHub secrets, use OIDC to let GitHub authenticate directly to AWS.

**Step 1: Create IAM OIDC Identity Provider**

1. Go to AWS Console → IAM → Identity providers → Add provider
2. Provider type: **OpenID Connect**
3. Provider URL: `https://token.actions.githubusercontent.com`
4. Audience: `sts.amazonaws.com`
5. Click "Add provider"

**Step 2: Create IAM Role for GitHub Actions**

1. Go to IAM → Roles → Create role
2. Trusted entity: **Web identity**
3. Identity provider: `token.actions.githubusercontent.com`
4. Audience: `sts.amazonaws.com`
5. Click "Next"

**Step 3: Add Conditions (Restrict to Your Repo)**

Add these conditions to restrict access to only your repository:

```json
{
  "StringEquals": {
    "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
  },
  "StringLike": {
    "token.actions.githubusercontent.com:sub": "repo:YOUR-USERNAME/YOUR-REPO:*"
  }
}
```

Replace `YOUR-USERNAME/YOUR-REPO` with your GitHub username and repo name.

**Step 4: Attach Permissions**

Attach the same minimal policy as above, or use:
- `AmazonS3FullAccess`
- `CloudFrontFullAccess`

**Step 5: Update GitHub Actions Workflow**

The workflow file I created needs to be updated to use OIDC. Here's the updated version:

```yaml
name: Deploy to AWS

on:
  push:
    branches:
      - main
      - master
  workflow_dispatch:

permissions:
  id-token: write   # Required for OIDC
  contents: read   # Required to checkout code

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build project
        run: |
          export VITE_BASE_PATH=""
          export VITE_OUT_DIR="dist"
          npm run build

      - name: Configure AWS credentials (OIDC)
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::YOUR-ACCOUNT-ID:role/GitHubActionsRole
          aws-region: us-east-1

      # ... rest of deployment steps
```

**Only secrets you need:**
- `AWS_ROLE_ARN`: The ARN of the IAM role you created (e.g., `arn:aws:iam::123456789012:role/GitHubActionsRole`)
- `AWS_REGION`: Your AWS region (e.g., `us-east-1`)
- `AWS_S3_BUCKET`: Your bucket name
- `AWS_CLOUDFRONT_ID`: Optional, your CloudFront distribution ID

**No access keys needed!** 🎉

---

## Quick Comparison

| Method | Security | Best For |
|--------|----------|----------|
| **IAM User + Access Key** | ⚠️ Long-lived secret | Local deployment, testing |
| **OIDC (GitHub Actions)** | ✅ No secrets, temporary tokens | CI/CD, production |

---

## Recommendation

1. **For local deployment**: Use IAM User with programmatic access (Option 1)
2. **For GitHub Actions**: Use OIDC (Option 2) - more secure, no long-lived secrets

You can use both! Have an IAM user for local testing and OIDC for automated deployments.

---

## Security Best Practices

✅ **DO:**
- Use minimal IAM policies (only what's needed)
- Use OIDC for CI/CD (no long-lived secrets)
- Set up MFA for your AWS root account
- Rotate access keys regularly
- Use different IAM users/roles for different purposes

❌ **DON'T:**
- Use root account credentials
- Give full admin access when not needed
- Commit access keys to git
- Share access keys

---

## Minimal Policy (Copy-Paste Ready)

Replace `YOUR-BUCKET-NAME` and `YOUR-DISTRIBUTION-ID` with your actual values:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket",
        "s3:PutBucketWebsite",
        "s3:PutBucketPolicy",
        "s3:GetBucketLocation",
        "s3:GetBucketWebsite"
      ],
      "Resource": [
        "arn:aws:s3:::YOUR-BUCKET-NAME",
        "arn:aws:s3:::YOUR-BUCKET-NAME/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:CreateBucket",
        "s3:ListAllMyBuckets"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "cloudfront:CreateInvalidation",
        "cloudfront:GetInvalidation",
        "cloudfront:GetDistribution"
      ],
      "Resource": "*"
    }
  ]
}
```

