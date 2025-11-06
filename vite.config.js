import { defineConfig } from 'vite'
import { copyFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Plugin to copy HTML files to build output
const copyHtmlFiles = () => {
  return {
    name: 'copy-html-files',
    writeBundle() {
      const outDir = process.env.VITE_OUT_DIR || 'docs'
      const htmlFiles = ['projects.html', 'welcome.html', 'credits.html']
      
      htmlFiles.forEach(file => {
        const srcPath = resolve(__dirname, file)
        const destPath = resolve(__dirname, outDir, file)
        
        if (existsSync(srcPath)) {
          copyFileSync(srcPath, destPath)
          console.log(`Copied ${file} to ${outDir}/`)
        }
      })
    }
  }
}

export default defineConfig({
  // Use base path for GitHub Pages, empty for AWS S3/CloudFront
  base: process.env.VITE_BASE_PATH || '/website/',
  build: {
    outDir: process.env.VITE_OUT_DIR || 'docs',
    emptyOutDir: true
  },
  publicDir: 'public',
  plugins: [copyHtmlFiles()]
})

