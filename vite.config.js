import { defineConfig } from 'vite'

export default defineConfig({
  // Use base path for GitHub Pages, empty for AWS S3/CloudFront
  base: process.env.VITE_BASE_PATH || '/website/',
  build: {
    outDir: process.env.VITE_OUT_DIR || 'docs',
    emptyOutDir: true
  },
  publicDir: 'public'
})

