# Debugging Empty Website

If your website is still empty after deployment, check these:

## 1. Check GitHub Actions Workflow

1. Go to your GitHub repository
2. Click on the **Actions** tab
3. Check the latest workflow run
4. Look for errors or warnings in the "Build project" or "Deploy to S3" steps

## 2. Check Build Output

The workflow now includes a "List build output" step that shows what files are in the `dist/` folder.

Look for:
- `index.html` (should be there - Vite processes it)
- `assets/` folder with bundled JavaScript
- `images/` folder
- `styles.css`
- `projects.html`, `welcome.html`, `credits.html`
- `models/` folder (from public/)

## 3. Check S3 Bucket Contents

If you have AWS CLI access, check what's actually in your S3 bucket:

```bash
aws s3 ls s3://YOUR-BUCKET-NAME --recursive
```

## 4. Common Issues

### Issue: Files not in build output
- Check if the plugin ran correctly
- Look for "Copied..." messages in the build log
- Verify source files exist (images/, styles.css, etc.)

### Issue: Wrong paths
- Check if CloudFront is configured correctly
- Verify S3 static website hosting is enabled
- Check if you're accessing the right URL

### Issue: Cache
- Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)
- Check CloudFront cache invalidation ran
- Try incognito/private browsing mode

## 5. Verify Deployment

After pushing, check:
1. GitHub Actions workflow completed successfully
2. Files were uploaded to S3 (check the workflow logs)
3. CloudFront cache was invalidated (if using CloudFront)
4. You're accessing the correct URL

## 6. Manual Test

To test locally before pushing:

```bash
npm run build:aws
ls -la dist/
```

This should show all files that will be deployed.

