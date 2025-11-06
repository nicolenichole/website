# How to Test Locally

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Build the Project (Same as GitHub Actions)

This builds the project exactly like the GitHub Actions workflow will:

```bash
npm run build:aws
```

This will:
- Build to `dist/` folder (same as deployment)
- Copy all HTML files
- Copy `images/` folder
- Copy `styles.css`
- Process and bundle JavaScript

## Step 3: Check What Was Built

```bash
# List all files in dist/
ls -la dist/

# Or see the full structure
find dist -type f | sort
```

You should see:
- `index.html`
- `projects.html`, `welcome.html`, `credits.html`
- `styles.css`
- `images/` folder with all images
- `assets/` folder with bundled JavaScript
- `models/` folder (from public/)

## Step 4: Preview the Built Site

```bash
npm run preview
```

This starts a local server (usually at `http://localhost:4173`) where you can:
- See exactly what will be deployed
- Test all pages
- Check if images load
- Verify styles work

## Step 5: Test Development Server (Optional)

To test the development version (with hot reload):

```bash
npm run dev
```

This starts a dev server at `http://localhost:5173` (or similar).

## Quick Test Script

```bash
# Install (if needed)
npm install

# Build for AWS
npm run build:aws

# Check what was built
echo "=== Build Output ==="
ls -la dist/
echo ""
echo "=== Files in dist ==="
find dist -type f | head -20

# Preview
npm run preview
```

## Troubleshooting

### "npm: command not found"
You need to install npm first:
```bash
sudo pacman -S npm
```

### "Cannot find module"
Run `npm install` to install dependencies.

### Build errors
Check the error messages. Common issues:
- Missing dependencies (run `npm install`)
- Syntax errors in code
- Missing files referenced in code

### Files missing in dist/
Check the build output for "Copied..." messages. If you don't see them, the plugin might not be running. Check `vite.config.js`.

