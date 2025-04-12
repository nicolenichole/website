import { defineConfig } from 'vite'

export default defineConfig({
  base: '/website/',  // Replace with your repository name
  build: {
    outDir: 'docs'  // or 'dist' if you're deploying that folder, but adjust your GitHub Pages settings accordingly.
  }
})

