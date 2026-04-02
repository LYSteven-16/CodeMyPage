import 'virtual:uno.css'
import { BeakerManager } from '@LYSteven-16/atom-engine'
import { registerComponents, getComponentDef } from './component-registry'
import { applyAtomProps } from './atom-props'

const CANVAS_WIDTH = 1000

interface EditorComponent {
  id: string
  type: string
  x: number
  y: number
  width: number
  height: number
  zIndex: number
  props: Record<string, any>
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

interface Workspace {
  id: string
  name: string
  offset: { x: number; y: number }
  width: number
  height: number
  floating?: boolean
  showShadow?: boolean
  showBorder?: boolean
  canvasBackground?: string
  canvasBorderRadius?: number
  shadowBlur?: number
  shadowSpread?: number
  shadowColor?: string
}

function componentToMolecule(comp: EditorComponent): any {
  const def = getComponentDef(comp.type)
  if (!def) {
    console.warn(`[Preview] 未找到组件定义: ${comp.type}`)
    return null
  }

  const molecule = JSON.parse(JSON.stringify(def.molecule))
  molecule.id = comp.id
  const originalZ = molecule.position?.z || 0
  molecule.position = { x: comp.x, y: comp.y, z: originalZ + (comp.zIndex || 0) }
  molecule.width = comp.width || def.defaultWidth
  molecule.height = comp.height || def.defaultHeight

  const props = comp.props || {}

  if (molecule.atoms && Array.isArray(molecule.atoms)) {
    molecule.atoms.forEach((atom: any) => {
      applyAtomProps(atom, props, molecule.width, molecule.height)
    })
  }

  if (props.shadowEnabled !== undefined && molecule.atoms) {
    const shadowAtom = molecule.atoms.find((a: any) => a.capability === 'shadow')
    if (shadowAtom) shadowAtom.visible = props.shadowEnabled
  }

  if (props.borderRadius !== undefined) {
    molecule.radius = props.borderRadius
    if (molecule.atoms) {
      molecule.atoms.forEach((atom: any) => {
        if (atom.radius !== undefined) atom.radius = props.borderRadius
      })
    }
  }

  return molecule
}

// ==================== 初始化预览 ====================
function initPreview() {
  const app = document.getElementById('app')
  if (!app) return

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
    const workspaces: Workspace[] = data.workspaces || []
    const gridSettings: GridSettings = data.gridSettings || {}
    
    if (components.length === 0 && workspaces.length === 0) {
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

    const useMultipleWorkspaces = workspaces.length > 0

    console.log('[Preview] Data loaded:', {
      workspaceCount: workspaces.length,
      workspaces: workspaces.map(w => ({ id: w.id, name: w.name, width: w.width, height: w.height })),
      componentCount: components.length
    })

    if (useMultipleWorkspaces) {
      renderMultipleWorkspaces(app, components, workspaces, gridSettings)
    } else {
      renderSingleCanvas(app, components, gridSettings)
    }
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

function renderSingleCanvas(app: HTMLElement, components: EditorComponent[], gridSettings: GridSettings) {
  let canvasHeight = 1200
  components.forEach(comp => {
    const bottom = (comp.y || 0) + (comp.height || 100)
    if (bottom + 200 > canvasHeight) canvasHeight = bottom + 200
  })

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

  const molecules = components.map(c => componentToMolecule(c)).filter(Boolean)
  const manager = new BeakerManager(molecules, canvas, {
    position: { x: 0, y: 0 },
    width: CANVAS_WIDTH,
    height: canvasHeight
  })
  console.log('Preview rendered successfully with', components.length, 'components')
}

function renderMultipleWorkspaces(app: HTMLElement, components: EditorComponent[], workspaces: Workspace[], gridSettings: GridSettings) {
  let maxX = 0, maxY = 0
  workspaces.forEach(ws => {
    const wsRight = ws.offset.x + ws.width
    const wsBottom = ws.offset.y + ws.height
    if (wsRight > maxX) maxX = wsRight
    if (wsBottom > maxY) maxY = wsBottom
  })

  const containerWidth = maxX + 100
  const containerHeight = maxY + 100

  app.innerHTML = `
    <div class="header">
      <h1>预览模式</h1>
      <button onclick="window.close()">返回编辑</button>
    </div>
    <div class="content" style="align-items: flex-start;">
      <div id="workspaces-container" class="workspaces-container" style="position: relative; width: ${containerWidth}px; height: ${containerHeight}px;">
      </div>
    </div>
  `

  const container = document.getElementById('workspaces-container')
  if (!container) return

  console.log('[Preview] Container size:', containerWidth, 'x', containerHeight)
  console.log('[Preview] Workspaces:', workspaces.map(w => ({
    id: w.id,
    name: w.name,
    offset: w.offset,
    size: `${w.width}x${w.height}`
  })))

  workspaces.forEach(workspace => {
    const wsComponents = components.filter(c => c.id.startsWith(workspace.id + '-')).sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
    
    console.log('[Preview] Workspace:', workspace.id, '| Components in workspace:', wsComponents.length, '| Total components:', components.length)
    console.log('[Preview] Component IDs:', components.map(c => c.id).slice(0, 5))
    
    if (wsComponents.length > 0) {
      const molecules = wsComponents.map(c => componentToMolecule(c)).filter(Boolean)
      console.log('[Preview] Creating BeakerManager for', workspace.name, {
        width: workspace.width,
        height: workspace.height
      })
      const manager = new BeakerManager(molecules, container, {
        position: { x: workspace.offset.x, y: workspace.offset.y },
        width: workspace.width,
        height: workspace.height,
        backgroundColor: workspace.canvasBackground || gridSettings.canvasBackground || '#ffffff',
        borderRadius: workspace.canvasBorderRadius ?? gridSettings.canvasBorderRadius ?? 0,
        showShadow: workspace.showShadow !== false,
        shadowBlur: workspace.shadowBlur ?? 20,
        shadowSpread: workspace.shadowSpread ?? 0,
        shadowColor: workspace.shadowColor ?? 'rgba(0,0,0,0.1)'
      })
      console.log('[Preview] BeakerManager created, workplace:', manager.getWorkplace())
      console.log('[Preview] Workplace styles:', manager.getWorkplace().style.cssText)
    } else {
      console.log('[Preview] No components found for workspace', workspace.id, '- canvas not created')
    }
  })
  
  console.log('Preview rendered', workspaces.length, 'workspaces with', components.length, 'total components')
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
  
  .workspace-canvas {
    min-height: 100px;
    overflow: hidden;
  }
  
  .workspaces-container {
    display: flex;
    flex-direction: column;
    align-items: center;
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