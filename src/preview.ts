import 'virtual:uno.css'
import { BeakerManager } from '@component-chemistry/atom-engine'

// ==================== 类型定义 ====================
interface EditorComponent {
  id: string
  type: string
  content: Record<string, any>
  style: Record<string, any>
}

interface GridSettings {
  dotSize: number
  dotColor: string
  dotSpacing: number
  snapToGrid: boolean
  canvasBackground: string
  canvasBorderRadius: number
  dotGridBackground: string
}

// ==================== 常量 ====================
const CANVAS_WIDTH = 1000

// ==================== 工具函数 ====================
function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
}

// ==================== 分子配置（完整功能，包括互动） ====================
function componentToMolecule(comp: EditorComponent): any {
  const s = comp.style
  const c = comp.content
  const w = s.width || 200
  const h = s.height || 100

  const atoms: any[] = []

  // 背景
  if (s.backgroundColor) {
    atoms.push({ capability: 'background', color: hexToRgb(s.backgroundColor), position: { x: 0, y: 0, z: 0 }, width: w, height: h, radius: s.borderRadius || 0 })
  }

  // 边框
  atoms.push({
    capability: 'border',
    borderWidth: 1,
    color: [229, 231, 235],
    position: { x: 0, y: 0, z: 0 },
    width: w, height: h,
    radius: s.borderRadius || 0,
  })

  // 阴影
  if (s.hasShadow !== false) {
    atoms.push({ capability: 'shadow', x: 0, y: 2, shadowBlur: 8, shadowWidth: 0, color: [0, 0, 0], opacity: 0.06, position: { x: 0, y: 0, z: -1 }, width: w, height: h, radius: s.borderRadius || 0 })
  }

  // 文本
  const text = c.text || c.title || c.quoteText || c.alertContent
  if (text) {
    atoms.push({ capability: 'text', text, position: { x: 0, y: 0 }, size: s.fontSize || 14, color: hexToRgb(s.color || '#1d1d1f') })
  }

  // 代码
  if (c.code) {
    atoms.push({ capability: 'code', code: c.code, language: c.language || 'javascript', position: { x: 0, y: 0 }, width: w, height: h, backgroundColor: [30, 30, 30], autoFormat: true })
  }

  // 进度条
  if (comp.type === 'progress') {
    atoms.push(
      { capability: 'background', color: [229, 231, 235], position: { x: 0, y: h/2-4, z: 0 }, width: w, height: 8, radius: 4 },
      { capability: 'background', color: [0, 122, 255], position: { x: 0, y: h/2-4, z: 1 }, width: w*(c.progress||50)/100, height: 8, radius: 4 }
    )
  }

  // 分隔线
  if (comp.type === 'divider') {
    atoms.push({ capability: 'background', color: [229, 231, 235], position: { x: 0, y: h/2-1, z: 0 }, width: w, height: 2, radius: 1 })
  }

  // 注意：预览页面使用引擎的完整功能
  // 如果用户配置了互动能力（如点击、拖拽等），会在这里生效

  return {
    id: comp.id,
    position: { x: s.x || 0, y: s.y || 0, z: 1 },
    width: w,
    height: h,
    radius: s.borderRadius || 0,
    atoms,
  }
}

// ==================== 初始化预览 ====================
function initPreview() {
  const app = document.getElementById('app')
  if (!app) return

  // 从 localStorage 获取数据
  const dataStr = localStorage.getItem('codemypage-preview')
  
  if (!dataStr) {
    app.innerHTML = `
      <div class="header">
        <h1>预览模式</h1>
        <button onclick="window.close()">返回编辑</button>
      </div>
      <div class="content">
        <div class="canvas">
          <div class="empty">没有可预览的内容</div>
        </div>
      </div>
    `
    return
  }

  try {
    const data = JSON.parse(dataStr)
    const components: EditorComponent[] = data.components || []
    const gridSettings: GridSettings = data.gridSettings || {}
    
    if (components.length === 0) {
      app.innerHTML = `
        <div class="header">
          <h1>预览模式</h1>
          <button onclick="window.close()">返回编辑</button>
        </div>
        <div class="content">
          <div class="canvas">
            <div class="empty">没有可预览的内容</div>
          </div>
        </div>
      `
      return
    }

    // 计算画布高度
    let canvasHeight = 1200
    components.forEach(comp => {
      const bottom = (comp.style?.y || 0) + (comp.style?.height || 100)
      if (bottom + 200 > canvasHeight) canvasHeight = bottom + 200
    })

    // 渲染页面
    app.innerHTML = `
      <div class="header">
        <h1>预览模式</h1>
        <button onclick="window.close()">返回编辑</button>
      </div>
      <div class="content">
        <div id="canvas" class="canvas" style="height: ${canvasHeight}px; background: ${gridSettings.canvasBackground || '#ffffff'}; border-radius: ${gridSettings.canvasBorderRadius || 16}px;"></div>
      </div>
    `

    const canvas = document.getElementById('canvas')
    if (!canvas) return

    // 创建分子（使用引擎的完整功能）
    const molecules = components.map(c => componentToMolecule(c))

    // 使用引擎渲染（完整功能）
    const manager = new BeakerManager(molecules, canvas, {
      position: { x: 0, y: 0 },
      width: CANVAS_WIDTH,
      height: canvasHeight
    })

    console.log('Preview rendered successfully with', components.length, 'components')
  } catch (err) {
    console.error('预览加载失败:', err)
    app.innerHTML = `
      <div class="header">
        <h1>预览模式</h1>
        <button onclick="window.close()">返回编辑</button>
      </div>
      <div class="content">
        <div class="canvas">
          <div class="empty">加载失败: ${err instanceof Error ? err.message : '未知错误'}</div>
        </div>
      </div>
    `
  }
}

// ==================== 样式 ====================
const style = document.createElement('style')
style.textContent = `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    background: #f5f5f7;
    min-height: 100vh;
  }
  
  .header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 56px;
    background: rgba(255, 255, 255, 0.92);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 24px;
    z-index: 100;
  }
  
  .header h1 {
    font-size: 18px;
    font-weight: 600;
    color: #1d1d1f;
  }
  
  .header button {
    height: 32px;
    padding: 0 16px;
    font-size: 14px;
    font-weight: 500;
    color: #fff;
    background: #007aff;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.2s;
  }
  
  .header button:hover {
    background: #0066d6;
  }
  
  .content {
    padding: 80px 24px 24px;
    display: flex;
    justify-content: center;
  }
  
  .canvas {
    width: 1000px;
    min-height: 1200px;
    background: #ffffff;
    border-radius: 16px;
    box-shadow: 0 2px 20px rgba(0, 0, 0, 0.06);
    position: relative;
    overflow: visible;
  }
  
  .empty {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 400px;
    color: #86868b;
    font-size: 16px;
  }
`
document.head.appendChild(style)

// ==================== 初始化 ====================
initPreview()