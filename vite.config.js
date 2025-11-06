import { defineConfig } from 'vite'
import { copyFileSync, existsSync, mkdirSync, cpSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Plugin to copy HTML files, images, and styles to build output
const copyStaticFiles = () => {
  return {
    name: 'copy-static-files',
    writeBundle() {
      const outDir = process.env.VITE_OUT_DIR || 'docs'
      const outPath = resolve(__dirname, outDir)
      
      // Copy HTML files
      const htmlFiles = ['projects.html', 'welcome.html', 'credits.html']
      htmlFiles.forEach(file => {
        const srcPath = resolve(__dirname, file)
        const destPath = resolve(outPath, file)
        
        if (existsSync(srcPath)) {
          copyFileSync(srcPath, destPath)
          console.log(`Copied ${file} to ${outDir}/`)
        }
      })
      
      // Copy styles.css
      const stylesPath = resolve(__dirname, 'styles.css')
      if (existsSync(stylesPath)) {
        copyFileSync(stylesPath, resolve(outPath, 'styles.css'))
        console.log(`Copied styles.css to ${outDir}/`)
      }
      
      // Copy images folder
      const imagesSrc = resolve(__dirname, 'images')
      const imagesDest = resolve(outPath, 'images')
      if (existsSync(imagesSrc)) {
        mkdirSync(imagesDest, { recursive: true })
        cpSync(imagesSrc, imagesDest, { recursive: true })
        console.log(`Copied images/ to ${outDir}/images/`)
      }
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
  plugins: [copyStaticFiles()]
})

