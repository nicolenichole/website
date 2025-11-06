# How to Set GitHub Secrets

This guide will help you set up the required secrets in your GitHub repository for AWS deployment.

## Step-by-Step Instructions

### Step 1: Navigate to Repository Settings

1. Go to your GitHub repository
2. Click on the **Settings** tab (at the top of the repository)
3. In the left sidebar, click **Secrets and variables** → **Actions**

### Step 2: Add Secrets

Click the **"New repository secret"** button for each secret you need to add.

#### Required Secrets:

**1. AWS_ROLE_ARN**
- **Name**: `AWS_ROLE_ARN`
- **Value**: Your IAM role ARN (e.g., `arn:aws:iam::123456789012:role/GitHubActionsRole`)
- **How to find it**: 
  - Go to AWS Console → IAM → Roles
  - Click on your GitHub Actions role
  - Copy the **Role ARN** from the top of the page

**2. AWS_S3_BUCKET**
- **Name**: `AWS_S3_BUCKET`
- **Value**: Your S3 bucket name (e.g., `nicolelu-website-2024`)
- **Note**: This should be the bucket name you created or plan to create

#### Optional Secrets:

**3. AWS_REGION**
- **Name**: `AWS_REGION`
- **Value**: Your AWS region (e.g., `us-east-1`)
- **Default**: If not set, defaults to `us-east-1`
- **Common regions**: `us-east-1`, `us-west-2`, `eu-west-1`, etc.

**4. AWS_CLOUDFRONT_ID**
- **Name**: `AWS_CLOUDFRONT_ID`
- **Value**: Your CloudFront distribution ID (e.g., `E1234567890ABC`)
- **How to find it**:
  - Go to AWS Console → CloudFront → Distributions
  - Click on your distribution
  - Copy the **Distribution ID**
- **Note**: Only needed if you're using CloudFront

## Example Secret Values

Here's what your secrets might look like:

```
AWS_ROLE_ARN: arn:aws:iam::123456789012:role/GitHubActionsRole
AWS_S3_BUCKET: nicolelu-website-2024
AWS_REGION: us-east-1
AWS_CLOUDFRONT_ID: E1234567890ABC
```

## Verifying Secrets

After adding secrets:

1. Go back to **Secrets and variables** → **Actions**
2. You should see all your secrets listed (values are hidden for security)
3. Make sure the names match exactly:
   - `AWS_ROLE_ARN` (not `AWS_ROLE_ARN_` or `aws_role_arn`)
   - `AWS_S3_BUCKET` (not `AWS_S3_BUCKET_NAME`)

## Testing Your Setup

Once secrets are set:

1. Push a commit to your `main` or `master` branch
2. Go to **Actions** tab in your repository
3. You should see the "Deploy to AWS" workflow running
4. Check the logs to verify it's working

## Troubleshooting

### "Secret not found" error
- Make sure the secret name matches exactly (case-sensitive)
- Ensure you're adding secrets to the correct repository

### "Access denied" error
- Verify your IAM role has the correct permissions
- Check that the role ARN is correct
- Ensure the OIDC trust relationship is set up correctly

### "Bucket not found" error
- Verify the bucket name is correct
- Make sure the bucket exists in the specified region
- Check that your IAM role has permission to create buckets (if it should create it)

## Security Notes

✅ **DO:**
- Keep secrets private (they're automatically hidden in GitHub)
- Use separate secrets for different environments if needed
- Rotate secrets regularly if using access keys (not needed with OIDC!)

❌ **DON'T:**
- Commit secrets to your code
- Share secrets in issues or pull requests
- Use the same secrets for multiple repositories if they have different access needs

## Quick Reference

**Required:**
- `AWS_ROLE_ARN` - IAM role ARN for OIDC authentication
- `AWS_S3_BUCKET` - S3 bucket name for deployment

**Optional:**
- `AWS_REGION` - AWS region (defaults to `us-east-1`)
- `AWS_CLOUDFRONT_ID` - CloudFront distribution ID (only if using CloudFront)

That's it! Once these are set, your GitHub Actions workflow will automatically deploy on push to `main` or `master`.

