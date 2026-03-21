import { spawn } from 'child_process'
import fs from 'fs'
import path from 'path'

const distDir = path.join(process.cwd(), 'dist')
const exportDistDir = path.join(process.cwd(), 'dist-export')

async function buildExport() {
  console.log('Building export assets...')
  
  await new Promise((resolve, reject) => {
    const buildProcess = spawn('npx', ['vite', 'build', '--config', 'vite.export.config.ts'], {
      shell: true,
      cwd: process.cwd(),
      stdio: 'inherit'
    })

    buildProcess.on('close', (code) => {
      if (code !== 0) {
        reject(new Error('Export build failed'))
      } else {
        resolve()
      }
    })

    buildProcess.on('error', (err) => {
      reject(err)
    })
  })

  if (!fs.existsSync(exportDistDir)) {
    fs.mkdirSync(exportDistDir, { recursive: true })
  }

  const exportAssetsDir = path.join(exportDistDir, 'assets')
  const mainAssetsDir = path.join(distDir, 'assets')

  if (fs.existsSync(exportAssetsDir)) {
    const files = fs.readdirSync(exportAssetsDir)
    
    for (const file of files) {
      const src = path.join(exportAssetsDir, file)
      const dest = path.join(mainAssetsDir, file)
      fs.copyFileSync(src, dest)
      console.log('Copied: ' + file)
    }
  }

  const indexHtml = path.join(exportDistDir, 'export-entry.html')
  if (fs.existsSync(indexHtml)) {
    const destIndexHtml = path.join(distDir, 'export-entry.html')
    fs.copyFileSync(indexHtml, destIndexHtml)
    console.log('Copied: export-entry.html')
  }

  console.log('Export assets built and copied to dist folder')
}

buildExport().catch(err => {
  console.error('Build failed:', err)
  process.exit(1)
})
