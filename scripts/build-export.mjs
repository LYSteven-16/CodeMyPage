import { build } from 'vite'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

async function buildExport() {
  console.log('开始构建导出文件...')

  const exportOutDir = path.join(rootDir, 'dist-export')

  if (!fs.existsSync(exportOutDir)) {
    fs.mkdirSync(exportOutDir, { recursive: true })
  }

  const viteConfigPath = path.join(rootDir, 'vite.export.config.ts')

  if (!fs.existsSync(viteConfigPath)) {
    throw new Error('vite.export.config.ts 不存在')
  }

  console.log('运行 Vite 构建...')
  await build({
    configFile: viteConfigPath,
    mode: 'production'
  })

  const assetsDir = path.join(exportOutDir, 'assets')
  if (!fs.existsSync(assetsDir)) {
    throw new Error('构建失败：assets 目录不存在')
  }

  const jsFiles = fs.readdirSync(assetsDir).filter(f => f.endsWith('.js'))
  const cssFiles = fs.readdirSync(assetsDir).filter(f => f.endsWith('.css'))

  if (jsFiles.length === 0) {
    throw new Error('构建失败：没有生成 JS 文件')
  }

  console.log(`构建完成！生成了 ${jsFiles.length} 个 JS 文件`)

  return {
    jsFile: jsFiles[0],
    cssFile: cssFiles[0] || null,
    assetsDir
  }
}

export { buildExport, rootDir }

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  buildExport()
    .then(() => console.log('构建成功！'))
    .catch(err => { console.error('构建失败:', err); process.exit(1) })
}
