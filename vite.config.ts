import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import type { Plugin } from 'vite'
import type { IncomingMessage, ServerResponse } from 'http'
import { spawn } from 'child_process'
import fs from 'fs'
import path from 'path'

interface GridSettings {
  dotSize: number
  dotColor: string
  dotSpacing: number
  snapToGrid: boolean
  canvasBackground: string
  canvasBorderRadius: number
  dotGridBackground: string
}

interface ProjectComponent {
  id?: string
  type?: string
  y?: number
  height?: number
  width?: number
  x?: number
  [key: string]: any
}

interface ProjectData {
  components: ProjectComponent[]
  gridSettings: GridSettings
  canvasWidth?: number
  title?: string
}

async function buildExportApp(): Promise<void> {
  const exportOutDir = path.join(process.cwd(), 'dist-export')
  if (!fs.existsSync(exportOutDir)) {
    fs.mkdirSync(exportOutDir, { recursive: true })
  }

  await new Promise<void>((resolve, reject) => {
    const buildProcess = spawn('npx', ['vite', 'build', '--config', 'vite.export.config.ts'], {
      shell: true,
      cwd: process.cwd(),
      stdio: 'pipe'
    })

    let stderr = ''
    buildProcess.stderr.on('data', (data) => { stderr += data.toString() })
    buildProcess.stdout.on('data', (data) => { stderr += data.toString() })

    buildProcess.on('close', (code) => {
      if (code !== 0) {
        console.error('Build failed:', stderr)
        reject(new Error('导出构建失败'))
      } else {
        resolve()
      }
    })

    buildProcess.on('error', (err) => {
      console.error('Build process error:', err)
      reject(err)
    })
  })
}

function generateInteractiveHTML(projectData: ProjectData): string {
  const title = projectData.title || '我的网页'
  const projectDataJson = JSON.stringify(projectData)

  const assetsDir = path.join(process.cwd(), 'dist-export', 'assets')
  const jsFiles = fs.readdirSync(assetsDir).filter(f => f.endsWith('.js'))
  const cssFiles = fs.readdirSync(assetsDir).filter(f => f.endsWith('.css'))

  if (jsFiles.length === 0) {
    throw new Error('JS 构建产物不存在')
  }

  const jsContent = fs.readFileSync(path.join(assetsDir, jsFiles[0]), 'utf-8')
  const cssContent = cssFiles.length > 0 
    ? fs.readFileSync(path.join(assetsDir, cssFiles[0]), 'utf-8')
    : ''

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    * { box-sizing: border-box; }
    body { 
      margin: 0; 
      min-height: 100vh; 
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    }
    .page-container { 
      position: relative; 
      margin: 0 auto; 
    }
  </style>
  <style>
${cssContent}
  </style>
</head>
<body>
  <div id="root"></div>
  <script>
    window.__PROJECT_DATA__ = ${projectDataJson};
  </script>
  <script src="https://unpkg.com/react@18/umd/react.production.min.js" crossorigin></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js" crossorigin></script>
  <script>
${jsContent}
  </script>
</body>
</html>`
}

function exportPlugin(): Plugin {
  return {
    name: 'vite-plugin-export',
    configureServer(server) {
      const base = server.config.base || '/'
      server.middlewares.use(base + 'api/export', async (req: IncomingMessage, res: ServerResponse) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Method Not Allowed' }))
          return
        }

        let body = ''
        req.on('data', (chunk: Buffer) => { body += chunk.toString() })
        req.on('end', async () => {
          try {
            const { projectData, type } = JSON.parse(body) as { projectData: ProjectData; type: string }
            
            await buildExportApp()
            const html = generateInteractiveHTML(projectData)

            const filename = type === 'github' ? 'github-pages.html' : 'my-page-interactive.html'
            res.setHeader('Content-Type', 'text/html')
            res.setHeader('Content-Disposition', 'attachment; filename="' + filename + '"')
            res.end(html)
          } catch (error) {
            console.error('Export error:', error)
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: (error as Error).message || String(error) }))
          }
        })
      })
    }
  }
}

export default defineConfig({
  plugins: [react(), exportPlugin()],
  base: '/CodeMyPage/'
})
