import { defineConfig } from 'vite'
import { copyFileSync, existsSync, mkdirSync, cpSync, readdirSync, writeFileSync } from 'fs'
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
      
      console.log(`\n[copy-static-files] Starting copy to ${outDir}/`)
      
      // Copy HTML files
      const htmlFiles = ['projects.html', 'welcome.html', 'credits.html']
      htmlFiles.forEach(file => {
        const srcPath = resolve(__dirname, file)
        const destPath = resolve(outPath, file)
        
        if (existsSync(srcPath)) {
          copyFileSync(srcPath, destPath)
          console.log(`✅ Copied ${file} to ${outDir}/`)
        } else {
          console.log(`❌ ${file} not found at ${srcPath}`)
        }
      })
      
      // Copy styles.css
      const stylesPath = resolve(__dirname, 'styles.css')
      if (existsSync(stylesPath)) {
        copyFileSync(stylesPath, resolve(outPath, 'styles.css'))
        console.log(`✅ Copied styles.css to ${outDir}/`)
      } else {
        console.log(`❌ styles.css not found at ${stylesPath}`)
      }
      
      // Copy images folder
      const imagesSrc = resolve(__dirname, 'images')
      const imagesDest = resolve(outPath, 'images')
      if (existsSync(imagesSrc)) {
        mkdirSync(imagesDest, { recursive: true })
        cpSync(imagesSrc, imagesDest, { recursive: true })
        const imageCount = readdirSync(imagesDest).length
        console.log(`✅ Copied images/ to ${outDir}/images/ (${imageCount} files)`)
      } else {
        console.log(`❌ images/ folder not found at ${imagesSrc}`)
      }
      
      // Copy scripts.js (HTML files reference it as script.js)
      const scriptsPath = resolve(__dirname, 'scripts.js')
      if (existsSync(scriptsPath)) {
        copyFileSync(scriptsPath, resolve(outPath, 'script.js'))
        console.log(`✅ Copied scripts.js to ${outDir}/script.js`)
      } else {
        console.log(`❌ scripts.js not found at ${scriptsPath}`)
      }
      
      // Create .nojekyll file to disable Jekyll processing on GitHub Pages
      const nojekyllPath = resolve(outPath, '.nojekyll')
      writeFileSync(nojekyllPath, '')
      console.log(`✅ Created .nojekyll file in ${outDir}/`)
      
      console.log(`[copy-static-files] Finished copying files\n`)
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

