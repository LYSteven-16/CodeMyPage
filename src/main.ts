import 'virtual:uno.css'
import { type ComponentInstance, type ComponentProps, testComponentDef, renderTestComponent } from './test-component'

// ==================== 类型定义 ====================
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

// ==================== 常量 ====================
const colors = {
  bg: '#f5f5f7',
  white: 'rgba(255,255,255,0.92)',
  text: '#1d1d1f',
  textSecondary: '#86868b',
  blue: '#007aff',
  red: '#ff3b30',
  divider: 'rgba(0,0,0,0.06)',
}

// ==================== 全局状态 ====================
let showGridSettings = false
let showBgSettings = false
let showCanvasSettings = false
let showComponentPanel = false
let showPropertyEditor = false
let showAddWorkspaceDialog = false
let workspaces: Workspace[] = [
  {
    id: 'workspace-1',
    name: 'workspace1',
    offset: { x: 0, y: 0 },
    width: 1000,
    height: 1600,
    showShadow: true,
    showBorder: true,
    canvasBackground: '#ffffff',
    canvasBorderRadius: 16,
    shadowBlur: 20,
    shadowSpread: 0,
    shadowColor: 'rgba(0,0,0,0.1)'
  }
]
let currentWorkspaceId = 'workspace-1'
let gridSettings: GridSettings = {
  dotSize: 1.5,
  dotColor: '#c7c7cc',
  dotSpacing: 20,
  snapToGrid: true,
  canvasBackground: '#ffffff',
  canvasBorderRadius: 16,
  dotGridBackground: '#f5f5f7',
}

// 组件管理
let components: ComponentInstance[] = []
let selectedComponentId: string | null = null
let draggedComponent: ComponentInstance | null = null
let dragOffset = { x: 0, y: 0 }
let isDragging = false
let globalEventsBound = false

// 面板位置存储
let panelPositions: { [key: string]: { x: number; y: number } } = {}

// ==================== 核心：workspace 渲染 ====================
function renderWorkspace() {
  document.documentElement.style.overflow = 'auto'
  
  document.body.style.background = `${gridSettings.dotGridBackground}`
  document.body.style.backgroundImage = `radial-gradient(circle,${gridSettings.dotColor} ${gridSettings.dotSize}px,transparent ${gridSettings.dotSize}px)`
  document.body.style.backgroundSize = `${gridSettings.dotSpacing}px ${gridSettings.dotSpacing}px`
  
  const existingWorkspaces = document.querySelectorAll('[id^="workspace-"]')
  existingWorkspaces.forEach(el => el.remove())
  
  let maxBottom = 0
  workspaces.forEach(workspace => {
    maxBottom = Math.max(maxBottom, workspace.offset.y + workspace.height)
  })
  const bodyHeight = Math.max(maxBottom + 100, window.innerHeight * 2)
  document.body.style.minHeight = `${bodyHeight}px`
  document.body.style.position = 'relative'
  document.body.style.overflow = 'visible'

  workspaces.forEach(workspace => {
    if (workspace.offset.x === 0 && workspace.offset.y === 0) {
      const centerX = Math.max(0, (window.innerWidth - workspace.width) / 2)
      workspace.offset.x = centerX
      workspace.offset.y = 60 + (workspaces.indexOf(workspace) * (workspace.height + 20))
    }
    
    const workspaceEl = document.createElement('div')
    workspaceEl.id = workspace.id
    workspaceEl.className = 'workspace'
    
    const isFloating = workspace.floating
    const workspaceBg = workspace.canvasBackground || gridSettings.canvasBackground
    const workspaceRadius = workspace.canvasBorderRadius ?? gridSettings.canvasBorderRadius
    const showShadow = workspace.showShadow !== false
    const showBorder = workspace.showBorder !== false
    const shadowBlur = workspace.shadowBlur ?? 20
    const shadowSpread = workspace.shadowSpread ?? 0
    const shadowColor = workspace.shadowColor ?? 'rgba(0,0,0,0.1)'
    const isSelected = workspace.id === currentWorkspaceId
    
    workspaceEl.style.cssText = `
      position: ${isFloating ? 'fixed' : 'absolute'};
      left: ${workspace.offset.x}px;
      top: ${workspace.offset.y}px;
      width: ${workspace.width}px;
      height: ${workspace.height}px;
      background: ${workspaceBg};
      border-radius: ${workspaceRadius}px;
      box-shadow: ${showShadow ? `0 2px ${shadowBlur}px ${shadowSpread}px ${shadowColor}` : 'none'};
      z-index: ${isFloating ? 10 : 1};
      overflow: hidden;
      border: ${isSelected && showBorder ? '2px solid' + colors.blue : 'none'};
    `
    
    // 渲染组件
    const componentsHtml = components
      .filter(c => c.id.startsWith(workspace.id + '-'))
      .map(c => renderTestComponent(c))
      .join('')
    
    workspaceEl.innerHTML = componentsHtml
    
    const titleEl = document.createElement('div')
    titleEl.className = 'workspace-title'
    titleEl.textContent = workspace.name
    titleEl.style.cssText = `
      position: absolute;
      top: -24px;
      left: 0;
      font-size: 12px;
      font-weight: 500;
      color: ${workspace.id === currentWorkspaceId ? colors.blue : colors.textSecondary};
      background: ${colors.white};
      padding: 2px 8px;
      border-radius: 4px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      cursor: pointer;
    `
    titleEl.addEventListener('click', () => {
      currentWorkspaceId = workspace.id
      renderUI()
    })
    
    workspaceEl.appendChild(titleEl)
    document.body.appendChild(workspaceEl)
  })
  
  bindComponentEvents()
}

// ==================== UI 渲染 ====================
function renderUI() {
  const app = document.getElementById('app')!
  const floatBg = `background:${colors.white};backdrop-filter:blur(20px);border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,0.08),0 0 0 1px rgba(0,0,0,0.04);`

  const selectedComponent = components.find(c => c.id === selectedComponentId)

  app.innerHTML = `
    <!-- 顶部工具栏 -->
    <div style="position:fixed;top:16px;left:50%;transform:translateX(-50%);z-index:100;${floatBg}display:flex;align-items:center;height:44px;padding:0 8px;">
      <span style="padding:0 12px;font-size:14px;font-weight:700;color:${colors.text};">CodeMyPage</span>
      <div style="width:1px;height:20px;background:${colors.divider};margin:0 4px;"></div>
      <button id="btn-grid" class="btn ${showGridSettings ? 'active' : ''}">网格</button>
      <button id="btn-bg" class="btn ${showBgSettings ? 'active' : ''}">背景</button>
      <button id="btn-canvas" class="btn ${showCanvasSettings ? 'active' : ''}">画布</button>
      <button id="btn-components" class="btn ${showComponentPanel ? 'active' : ''}">组件</button>
      <div style="width:1px;height:20px;background:${colors.divider};margin:0 4px;"></div>
      <button id="btn-preview" class="btn-pri">预览</button>
      <button id="btn-load" class="btn">加载</button>
      <button id="btn-export" class="btn">导出</button>
      <button id="btn-reset" class="btn" style="color:${colors.red};">重置</button>
      <div style="width:1px;height:20px;background:${colors.divider};margin:0 4px;"></div>
      <button id="btn-snap" class="btn ${gridSettings.snapToGrid ? 'active' : ''}">吸附</button>
      <button id="btn-save" class="btn-pri">保存</button>
    </div>

    ${showGridSettings ? renderDropdown('网格设置', `
      <label style="display:flex;align-items:center;gap:8px;font-size:13px;color:${colors.textSecondary};cursor:pointer;margin-bottom:12px;">
        <input type="checkbox" id="snap-toggle" ${gridSettings.snapToGrid ? 'checked' : ''} style="accent-color:${colors.blue};">
        启用网格吸附
      </label>
      <div style="display:flex;align-items:center;gap:12px;">
        <span style="font-size:13px;color:${colors.textSecondary};width:50px;">间距</span>
        <input type="range" id="spacing" min="10" max="60" value="${gridSettings.dotSpacing}" style="flex:1;accent-color:${colors.blue};">
        <span style="font-size:12px;color:${colors.textSecondary};width:40px;text-align:right;">${gridSettings.dotSpacing}px</span>
      </div>
      <div style="font-size:11px;color:${colors.textSecondary};margin-top:8px;">
        组件将吸附到 ${gridSettings.dotSpacing}px 网格
      </div>
    `) : ''}

    ${showBgSettings ? renderDropdown('工作区背景', `
      <div style="display:flex;align-items:center;gap:12px;">
        <input type="color" id="bg-color" value="${gridSettings.dotGridBackground}" style="width:32px;height:32px;border:1px solid ${colors.divider};border-radius:8px;cursor:pointer;">
        <span style="font-size:13px;color:${colors.textSecondary};">${gridSettings.dotGridBackground}</span>
      </div>
    `) : ''}

    ${showCanvasSettings ? renderDropdown('画布设置', `
      <div style="margin-bottom:16px;">
        <h3 style="font-size:11px;font-weight:600;color:${colors.textSecondary};text-transform:uppercase;margin:0 0 10px;">画布列表</h3>
        <div style="margin-bottom:12px;max-height:120px;overflow-y:auto;">
          ${workspaces.map(ws => `
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;padding:8px;background:${ws.id === currentWorkspaceId ? 'rgba(0,122,255,0.08)' : colors.bg};border-radius:8px;cursor:pointer;" onclick="selectWorkspace('${ws.id}')">
              <div style="width:8px;height:8px;border-radius:50%;background:${ws.id === currentWorkspaceId ? colors.blue : colors.textSecondary};"></div>
              <span style="font-size:13px;color:${ws.id === currentWorkspaceId ? colors.blue : colors.text};flex:1;">${ws.name}</span>
              <button onclick="event.stopPropagation();deleteWorkspace('${ws.id}')" style="font-size:12px;color:${colors.red};background:none;border:none;cursor:pointer;padding:2px 6px;border-radius:4px;">删除</button>
            </div>
          `).join('')}
        </div>
        <button id="btn-add-workspace" class="btn-pri" style="width:100%;height:32px;">添加画布</button>
      </div>
      <div style="margin-bottom:16px;">
        <h3 style="font-size:11px;font-weight:600;color:${colors.textSecondary};text-transform:uppercase;margin:0 0 10px;">当前画布设置</h3>
        <div style="margin-bottom:10px;">
          <label style="font-size:12px;color:${colors.textSecondary};display:block;margin-bottom:6px;">画布名称</label>
          <input type="text" id="current-workspace-name" value="${workspaces.find(ws => ws.id === currentWorkspaceId)?.name || ''}" class="inp" style="width:100%;">
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px;">
          <div>
            <label style="font-size:11px;color:${colors.textSecondary};display:block;margin-bottom:4px;">宽度</label>
            <input type="number" id="current-workspace-width" value="${workspaces.find(ws => ws.id === currentWorkspaceId)?.width || 1000}" class="inp" style="width:100%;">
          </div>
          <div>
            <label style="font-size:11px;color:${colors.textSecondary};display:block;margin-bottom:4px;">高度</label>
            <input type="number" id="current-workspace-height" value="${workspaces.find(ws => ws.id === currentWorkspaceId)?.height || 1600}" class="inp" style="width:100%;">
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px;">
          <div>
            <label style="font-size:11px;color:${colors.textSecondary};display:block;margin-bottom:4px;">X 位置</label>
            <input type="number" id="current-workspace-x" value="${workspaces.find(ws => ws.id === currentWorkspaceId)?.offset.x || 0}" class="inp" style="width:100%;">
          </div>
          <div>
            <label style="font-size:11px;color:${colors.textSecondary};display:block;margin-bottom:4px;">Y 位置</label>
            <input type="number" id="current-workspace-y" value="${workspaces.find(ws => ws.id === currentWorkspaceId)?.offset.y || 60}" class="inp" style="width:100%;">
          </div>
        </div>
        <label style="display:flex;align-items:center;gap:8px;font-size:13px;color:${colors.textSecondary};cursor:pointer;">
          <input type="checkbox" id="current-workspace-floating" ${workspaces.find(ws => ws.id === currentWorkspaceId)?.floating ? 'checked' : ''} style="accent-color:${colors.blue};">
          悬浮画布
        </label>
      </div>
      <div style="margin-bottom:16px;">
        <h3 style="font-size:11px;font-weight:600;color:${colors.textSecondary};text-transform:uppercase;margin:0 0 10px;">外观</h3>
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px;">
          <span style="font-size:13px;color:${colors.textSecondary};width:50px;">背景</span>
          <input type="color" id="canvas-color" value="${workspaces.find(ws => ws.id === currentWorkspaceId)?.canvasBackground || gridSettings.canvasBackground}" style="width:32px;height:32px;border:1px solid ${colors.divider};border-radius:8px;cursor:pointer;">
        </div>
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px;">
          <span style="font-size:13px;color:${colors.textSecondary};width:50px;">圆角</span>
          <input type="number" id="canvas-radius" min="0" max="999" value="${workspaces.find(ws => ws.id === currentWorkspaceId)?.canvasBorderRadius || gridSettings.canvasBorderRadius}" class="inp" style="width:80px;">
          <span style="font-size:12px;color:${colors.textSecondary};">px</span>
        </div>
        <div style="margin-bottom:10px;">
          <label style="display:flex;align-items:center;gap:8px;font-size:13px;color:${colors.textSecondary};cursor:pointer;margin-bottom:8px;">
            <input type="checkbox" id="current-workspace-shadow" ${workspaces.find(ws => ws.id === currentWorkspaceId)?.showShadow !== false ? 'checked' : ''} style="accent-color:${colors.blue};">
            显示阴影
          </label>
          <label style="display:flex;align-items:center;gap:8px;font-size:13px;color:${colors.textSecondary};cursor:pointer;">
            <input type="checkbox" id="current-workspace-border" ${workspaces.find(ws => ws.id === currentWorkspaceId)?.showBorder !== false ? 'checked' : ''} style="accent-color:${colors.blue};">
            显示边框
          </label>
        </div>
        <div id="shadow-options" style="margin-left:24px;margin-bottom:10px;display:${workspaces.find(ws => ws.id === currentWorkspaceId)?.showShadow !== false ? 'block' : 'none'};">
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px;">
            <span style="font-size:12px;color:${colors.textSecondary};width:50px;">扩展</span>
            <input type="range" id="shadow-spread" min="-20" max="20" value="${workspaces.find(ws => ws.id === currentWorkspaceId)?.shadowSpread ?? 0}" style="flex:1;accent-color:${colors.blue};">
            <span style="font-size:12px;color:${colors.textSecondary};width:35px;text-align:right;">${workspaces.find(ws => ws.id === currentWorkspaceId)?.shadowSpread ?? 0}px</span>
          </div>
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px;">
            <span style="font-size:12px;color:${colors.textSecondary};width:50px;">模糊</span>
            <input type="range" id="shadow-blur" min="0" max="50" value="${workspaces.find(ws => ws.id === currentWorkspaceId)?.shadowBlur ?? 20}" style="flex:1;accent-color:${colors.blue};">
            <span style="font-size:12px;color:${colors.textSecondary};width:35px;text-align:right;">${workspaces.find(ws => ws.id === currentWorkspaceId)?.shadowBlur ?? 20}px</span>
          </div>
          <div style="display:flex;align-items:center;gap:12px;">
            <span style="font-size:12px;color:${colors.textSecondary};width:50px;">颜色</span>
            <input type="color" id="shadow-color" value="${workspaces.find(ws => ws.id === currentWorkspaceId)?.shadowColor ?? 'rgba(0,0,0,0.1)'}" style="width:32px;height:32px;border:1px solid ${colors.divider};border-radius:8px;cursor:pointer;">
          </div>
        </div>
      </div>
    `) : ''}

    ${showComponentPanel ? renderDropdown('组件库', `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
        <div 
          class="component-item"
          data-type="test-box"
          style="
            padding:12px;
            background:${colors.bg};
            border-radius:8px;
            cursor:grab;
            text-align:center;
            font-size:12px;
            color:${colors.text};
            border:2px solid transparent;
            transition: border-color 0.2s;
          "
          draggable="true"
        >
          <div style="font-size:24px;margin-bottom:4px;">📦</div>
          <div>测试方块</div>
        </div>
      </div>
      <div style="margin-top:12px;font-size:11px;color:${colors.textSecondary};">
        拖拽组件到画布中
      </div>
    `) : ''}

    ${showPropertyEditor && selectedComponent ? renderDropdown('组件属性', `
      <div style="margin-bottom:12px;">
        <label style="font-size:12px;color:${colors.textSecondary};display:block;margin-bottom:4px;">文本内容</label>
        <input type="text" id="prop-text" value="${selectedComponent.props.text || ''}" class="inp" style="width:100%;">
      </div>
      
      <div style="margin-bottom:12px;">
        <label style="font-size:12px;color:${colors.textSecondary};display:block;margin-bottom:4px;">背景颜色</label>
        <input type="color" id="prop-bg" value="${selectedComponent.props.backgroundColor || '#ffffff'}" style="width:100%;height:32px;border:1px solid ${colors.divider};border-radius:8px;cursor:pointer;">
      </div>
      
      <div style="margin-bottom:12px;">
        <label style="font-size:12px;color:${colors.textSecondary};display:block;margin-bottom:4px;">文字颜色</label>
        <input type="color" id="prop-text-color" value="${selectedComponent.props.textColor || '#1d1d1f'}" style="width:100%;height:32px;border:1px solid ${colors.divider};border-radius:8px;cursor:pointer;">
      </div>
      
      <div style="margin-bottom:12px;">
        <label style="font-size:12px;color:${colors.textSecondary};display:block;margin-bottom:4px;">字体大小</label>
        <input type="number" id="prop-font-size" value="${selectedComponent.props.fontSize || 14}" class="inp" style="width:100%;">
      </div>
      
      <div style="margin-bottom:12px;">
        <label style="font-size:12px;color:${colors.textSecondary};display:block;margin-bottom:4px;">边框颜色</label>
        <input type="color" id="prop-border-color" value="${selectedComponent.props.borderColor || '#e5e5e5'}" style="width:100%;height:32px;border:1px solid ${colors.divider};border-radius:8px;cursor:pointer;">
      </div>
      
      <div style="margin-bottom:12px;">
        <label style="font-size:12px;color:${colors.textSecondary};display:block;margin-bottom:4px;">边框宽度</label>
        <input type="number" id="prop-border-width" value="${selectedComponent.props.borderWidth || 1}" class="inp" style="width:100%;">
      </div>
      
      <div style="margin-bottom:12px;">
        <label style="font-size:12px;color:${colors.textSecondary};display:block;margin-bottom:4px;">圆角</label>
        <input type="number" id="prop-radius" value="${selectedComponent.props.borderRadius || 8}" class="inp" style="width:100%;">
      </div>
      
      <div style="margin-bottom:12px;">
        <label style="display:flex;align-items:center;gap:8px;font-size:13px;color:${colors.textSecondary};cursor:pointer;">
          <input type="checkbox" id="prop-shadow" ${selectedComponent.props.shadowEnabled ? 'checked' : ''} style="accent-color:${colors.blue};">
          显示阴影
        </label>
      </div>
      
      <div id="shadow-options" style="display:${selectedComponent.props.shadowEnabled ? 'block' : 'none'};margin-left:16px;margin-bottom:12px;">
        <div style="margin-bottom:8px;">
          <label style="font-size:11px;color:${colors.textSecondary};display:block;margin-bottom:4px;">模糊</label>
          <input type="range" id="prop-shadow-blur" min="0" max="50" value="${selectedComponent.props.shadowBlur || 10}" style="width:100%;accent-color:${colors.blue};">
        </div>
        <div style="margin-bottom:8px;">
          <label style="font-size:11px;color:${colors.textSecondary};display:block;margin-bottom:4px;">扩展</label>
          <input type="range" id="prop-shadow-spread" min="-20" max="20" value="${selectedComponent.props.shadowSpread || 0}" style="width:100%;accent-color:${colors.blue};">
        </div>
        <div>
          <label style="font-size:11px;color:${colors.textSecondary};display:block;margin-bottom:4px;">颜色</label>
          <input type="color" id="prop-shadow-color" value="${selectedComponent.props.shadowColor || 'rgba(0,0,0,0.1)'}" style="width:100%;height:28px;border:1px solid ${colors.divider};border-radius:6px;cursor:pointer;">
        </div>
      </div>
      
      <button id="btn-delete-component" style="width:100%;height:32px;font-size:13px;font-weight:500;color:${colors.white};background:${colors.red};border:none;border-radius:8px;cursor:pointer;margin-top:8px;">
        删除组件
      </button>
    `) : ''}

    <!-- 缩放 -->
    <div style="position:fixed;bottom:16px;right:16px;z-index:100;${floatBg}display:flex;align-items:center;height:40px;padding:0 4px;">
      <button id="zoom-out" class="icon-btn">−</button>
      <span style="width:48px;text-align:center;font-size:13px;font-weight:500;color:${colors.text};">100%</span>
      <button id="zoom-in" class="icon-btn">+</button>
    </div>

    ${showAddWorkspaceDialog ? renderAddWorkspaceDialog() : ''}

    <input type="file" id="file-input" accept=".json" style="display:none;">
  `

  addStyles()
  bindEvents()
  renderWorkspace()
}

function renderDropdown(title: string, content: string, id?: string): string {
  // 为每个面板类型使用固定的 ID
  let panelId = id
  if (!panelId) {
    if (title === '网格设置') panelId = 'panel-grid'
    else if (title === '工作区背景') panelId = 'panel-bg'
    else if (title === '画布设置') panelId = 'panel-canvas'
    else if (title === '组件库') panelId = 'panel-components'
    else if (title === '组件属性') panelId = 'panel-properties'
    else panelId = `panel-${title}`
  }
  const savedPosition = panelPositions[panelId]
  const positionStyle = savedPosition 
    ? `left:${savedPosition.x}px;top:${savedPosition.y}px;transform:none;`
    : `top:68px;left:50%;transform:translateX(-50%);`
  return `<div id="${panelId}" class="draggable-panel" style="position:fixed;${positionStyle}z-index:110;background:rgba(255,255,255,0.98);backdrop-filter:blur(20px);border-radius:12px;box-shadow:0 4px 24px rgba(0,0,0,0.12);padding:16px;width:260px;cursor:move;">
    <div class="panel-header" style="font-size:14px;font-weight:600;color:${colors.text};margin-bottom:16px;cursor:grab;user-select:none;">${title}</div>
    ${content}
  </div>`
}

function renderAddWorkspaceDialog(): string {
  const nextNumber = workspaces.length + 1
  return `<div style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:200;display:flex;align-items:center;justify-content:center;">
    <div style="background:${colors.white};border-radius:16px;padding:24px;width:300px;box-shadow:0 8px 32px rgba(0,0,0,0.2);">
      <h2 style="font-size:16px;font-weight:600;color:${colors.text};margin:0 0 20px;">添加新画布</h2>
      <div style="margin-bottom:16px;">
        <label style="font-size:12px;color:${colors.textSecondary};display:block;margin-bottom:6px;">画布名称</label>
        <input type="text" id="new-workspace-name" value="workspace${nextNumber}" class="inp" style="width:100%;">
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;">
        <div>
          <label style="font-size:12px;color:${colors.textSecondary};display:block;margin-bottom:6px;">宽度 (px)</label>
          <input type="number" id="new-workspace-width" value="1000" class="inp" style="width:100%;">
        </div>
        <div>
          <label style="font-size:12px;color:${colors.textSecondary};display:block;margin-bottom:6px;">高度 (px)</label>
          <input type="number" id="new-workspace-height" value="1200" class="inp" style="width:100%;">
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px;">
        <div>
          <label style="font-size:12px;color:${colors.textSecondary};display:block;margin-bottom:6px;">X 位置 (px)</label>
          <input type="number" id="new-workspace-x" value="100" class="inp" style="width:100%;">
        </div>
        <div>
          <label style="font-size:12px;color:${colors.textSecondary};display:block;margin-bottom:6px;">Y 位置 (px)</label>
          <input type="number" id="new-workspace-y" value="60" class="inp" style="width:100%;">
        </div>
      </div>
      <div style="display:flex;gap:12px;">
        <button id="btn-cancel-add-workspace" class="btn" style="flex:1;height:36px;border:1px solid ${colors.divider};">取消</button>
        <button id="btn-confirm-add-workspace" class="btn-pri" style="flex:1;height:36px;">确认添加</button>
      </div>
    </div>
  </div>`
}

function addStyles() {
  const s = document.createElement('style')
  s.textContent = `
    * {
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
    }
    .inp, input, textarea {
      -webkit-user-select: text;
      -moz-user-select: text;
      -ms-user-select: text;
      user-select: text;
    }
    .btn{height:32px;padding:0 12px;font-size:13px;font-weight:500;color:${colors.text};background:none;border:none;border-radius:8px;cursor:pointer;}
    .btn:hover{background:rgba(0,0,0,0.04);}
    .btn.active{color:${colors.blue};background:rgba(0,122,255,0.08);}
    .btn-pri{height:32px;padding:0 14px;font-size:13px;font-weight:500;color:#fff;background:${colors.blue};border:none;border-radius:8px;cursor:pointer;}
    .btn-pri:hover{background:#0066d6;}
    .icon-btn{width:32px;height:32px;font-size:16px;color:${colors.text};background:none;border:none;border-radius:8px;cursor:pointer;}
    .icon-btn:hover{background:rgba(0,0,0,0.04);}
    .inp{width:100%;padding:8px 10px;font-size:12px;color:${colors.text};background:${colors.bg};border:none;border-radius:8px;outline:none;box-sizing:border-box;}
    .inp:focus{box-shadow:0 0 0 2px rgba(0,122,255,0.2);}
    .component-item:hover{border-color:${colors.blue} !important;}
    @keyframes componentDrop {
      0% {
        opacity: 0.5;
        transform: scale(1.1);
      }
      50% {
        opacity: 0.8;
        transform: scale(0.95);
      }
      100% {
        opacity: 1;
        transform: scale(1);
      }
    }
  `
  document.head.appendChild(s)
}

// ==================== 事件绑定 ====================
function bindEvents() {
  document.getElementById('btn-grid')?.addEventListener('click', (e) => { e.stopPropagation(); showGridSettings = !showGridSettings; showBgSettings = false; showCanvasSettings = false; showComponentPanel = false; showPropertyEditor = false; showAddWorkspaceDialog = false; renderUI() })
  document.getElementById('btn-bg')?.addEventListener('click', (e) => { e.stopPropagation(); showBgSettings = !showBgSettings; showGridSettings = false; showCanvasSettings = false; showComponentPanel = false; showPropertyEditor = false; showAddWorkspaceDialog = false; renderUI() })
  document.getElementById('btn-canvas')?.addEventListener('click', (e) => { e.stopPropagation(); showCanvasSettings = !showCanvasSettings; showGridSettings = false; showBgSettings = false; showComponentPanel = false; showPropertyEditor = false; showAddWorkspaceDialog = false; renderUI() })
  document.getElementById('btn-components')?.addEventListener('click', (e) => { e.stopPropagation(); showComponentPanel = !showComponentPanel; showGridSettings = false; showBgSettings = false; showCanvasSettings = false; showPropertyEditor = false; showAddWorkspaceDialog = false; renderUI() })
  document.getElementById('btn-snap')?.addEventListener('click', () => { gridSettings.snapToGrid = !gridSettings.snapToGrid; renderUI() })
  document.getElementById('btn-load')?.addEventListener('click', () => document.getElementById('file-input')?.click())
  document.getElementById('btn-preview')?.addEventListener('click', () => {
    window.open('/CodeMyPage/preview.html', '_blank')
  })
  document.getElementById('btn-export')?.addEventListener('click', () => {
    const blob = new Blob([JSON.stringify({ gridSettings, workspaces, components }, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'project.json'
    a.click()
  })
  document.getElementById('btn-reset')?.addEventListener('click', () => { if (confirm('确认重置？')) { components = []; renderUI() } })
  document.getElementById('btn-save')?.addEventListener('click', () => {
    const data = JSON.stringify({ gridSettings, workspaces, components })
    document.cookie = `codemypage=${encodeURIComponent(data)};max-age=${30*86400};path=/`
  })

  document.getElementById('snap-toggle')?.addEventListener('change', (e) => { gridSettings.snapToGrid = (e.target as HTMLInputElement).checked; renderUI() })
  document.getElementById('spacing')?.addEventListener('input', (e) => { gridSettings.dotSpacing = +(e.target as HTMLInputElement).value; renderUI() })
  document.getElementById('bg-color')?.addEventListener('input', (e) => { gridSettings.dotGridBackground = (e.target as HTMLInputElement).value; renderUI() })
  document.getElementById('canvas-color')?.addEventListener('input', (e) => { 
    const currentWorkspace = workspaces.find(ws => ws.id === currentWorkspaceId)
    if (currentWorkspace) {
      currentWorkspace.canvasBackground = (e.target as HTMLInputElement).value
      renderUI()
    }
  })
  document.getElementById('canvas-radius')?.addEventListener('input', (e) => { 
    const currentWorkspace = workspaces.find(ws => ws.id === currentWorkspaceId)
    if (currentWorkspace) {
      currentWorkspace.canvasBorderRadius = +(e.target as HTMLInputElement).value
      renderUI()
    }
  })
  document.getElementById('current-workspace-shadow')?.addEventListener('change', (e) => {
    const currentWorkspace = workspaces.find(ws => ws.id === currentWorkspaceId)
    if (currentWorkspace) {
      currentWorkspace.showShadow = (e.target as HTMLInputElement).checked
      renderUI()
    }
  })
  document.getElementById('current-workspace-border')?.addEventListener('change', (e) => {
    const currentWorkspace = workspaces.find(ws => ws.id === currentWorkspaceId)
    if (currentWorkspace) {
      currentWorkspace.showBorder = (e.target as HTMLInputElement).checked
      renderUI()
    }
  })
  document.getElementById('shadow-blur')?.addEventListener('input', (e) => {
    const currentWorkspace = workspaces.find(ws => ws.id === currentWorkspaceId)
    if (currentWorkspace) {
      currentWorkspace.shadowBlur = +(e.target as HTMLInputElement).value
      renderUI()
    }
  })
  document.getElementById('shadow-spread')?.addEventListener('input', (e) => {
    const currentWorkspace = workspaces.find(ws => ws.id === currentWorkspaceId)
    if (currentWorkspace) {
      currentWorkspace.shadowSpread = +(e.target as HTMLInputElement).value
      renderUI()
    }
  })
  document.getElementById('shadow-color')?.addEventListener('input', (e) => {
    const currentWorkspace = workspaces.find(ws => ws.id === currentWorkspaceId)
    if (currentWorkspace) {
      currentWorkspace.shadowColor = (e.target as HTMLInputElement).value
      renderUI()
    }
  })

  // 当前画布设置事件
  document.getElementById('current-workspace-name')?.addEventListener('change', (e) => {
    const currentWorkspace = workspaces.find(ws => ws.id === currentWorkspaceId)
    if (currentWorkspace) {
      currentWorkspace.name = (e.target as HTMLInputElement).value
      renderUI()
    }
  })
  document.getElementById('current-workspace-width')?.addEventListener('change', (e) => {
    const currentWorkspace = workspaces.find(ws => ws.id === currentWorkspaceId)
    if (currentWorkspace) {
      currentWorkspace.width = +(e.target as HTMLInputElement).value
      renderUI()
    }
  })
  document.getElementById('current-workspace-height')?.addEventListener('change', (e) => {
    const currentWorkspace = workspaces.find(ws => ws.id === currentWorkspaceId)
    if (currentWorkspace) {
      currentWorkspace.height = +(e.target as HTMLInputElement).value
      renderUI()
    }
  })
  document.getElementById('current-workspace-x')?.addEventListener('change', (e) => {
    const currentWorkspace = workspaces.find(ws => ws.id === currentWorkspaceId)
    if (currentWorkspace) {
      currentWorkspace.offset.x = +(e.target as HTMLInputElement).value
      renderUI()
    }
  })
  document.getElementById('current-workspace-y')?.addEventListener('change', (e) => {
    const currentWorkspace = workspaces.find(ws => ws.id === currentWorkspaceId)
    if (currentWorkspace) {
      currentWorkspace.offset.y = +(e.target as HTMLInputElement).value
      renderUI()
    }
  })
  document.getElementById('current-workspace-floating')?.addEventListener('change', (e) => {
    const currentWorkspace = workspaces.find(ws => ws.id === currentWorkspaceId)
    if (currentWorkspace) {
      currentWorkspace.floating = (e.target as HTMLInputElement).checked
      renderUI()
    }
  })

  // 添加画布按钮事件
  document.getElementById('btn-add-workspace')?.addEventListener('click', (e) => { 
    e.stopPropagation(); 
    showAddWorkspaceDialog = true; 
    renderUI() 
  })

  // 取消添加画布事件
  document.getElementById('btn-cancel-add-workspace')?.addEventListener('click', () => { 
    showAddWorkspaceDialog = false; 
    renderUI() 
  })

  // 确认添加画布事件
  document.getElementById('btn-confirm-add-workspace')?.addEventListener('click', () => {
    const name = (document.getElementById('new-workspace-name') as HTMLInputElement)?.value || `workspace${workspaces.length + 1}`
    const width = +(document.getElementById('new-workspace-width') as HTMLInputElement)?.value || 1000
    const height = +(document.getElementById('new-workspace-height') as HTMLInputElement)?.value || 1200
    const x = +(document.getElementById('new-workspace-x') as HTMLInputElement)?.value || 100
    const y = +(document.getElementById('new-workspace-y') as HTMLInputElement)?.value || 60

    const newWorkspace: Workspace = {
      id: `workspace-${Date.now()}`,
      name: name,
      offset: { x, y },
      width,
      height,
      showShadow: true,
      showBorder: true,
      canvasBackground: '#ffffff',
      canvasBorderRadius: 16,
      shadowBlur: 20,
      shadowSpread: 0,
      shadowColor: 'rgba(0,0,0,0.1)'
    }

    workspaces.push(newWorkspace)
    currentWorkspaceId = newWorkspace.id
    showAddWorkspaceDialog = false
    renderUI()
  })

  // 点击对话框背景关闭
  document.addEventListener('click', (e) => {
    if (showAddWorkspaceDialog && (e.target as HTMLElement).style.background === 'rgba(0, 0, 0, 0.5)') {
      showAddWorkspaceDialog = false
      renderUI()
    }
  })

  document.getElementById('file-input')?.addEventListener('change', (e) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target?.result as string)
          if (data.gridSettings) gridSettings = { ...gridSettings, ...data.gridSettings }
          if (data.workspaces) workspaces = data.workspaces
          if (data.components) components = data.components
          renderUI()
        } catch { alert('导入失败') }
      }
      reader.readAsText(file)
    }
  })

    // 面板拖拽功能
  let draggedPanel: HTMLElement | null = null
  let panelDragOffset = { x: 0, y: 0 }
  
  document.querySelectorAll('.draggable-panel').forEach(panel => {
    const panelEl = panel as HTMLElement
    const header = panelEl.querySelector('.panel-header') as HTMLElement
    
    if (header) {
      header.addEventListener('mousedown', (e) => {
        draggedPanel = panelEl
        const rect = panelEl.getBoundingClientRect()
        panelDragOffset = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        }
        panelEl.style.cursor = 'grabbing'
        e.preventDefault()
      })
    }
  })
  
  document.addEventListener('mousemove', (e) => {
    if (draggedPanel) {
      const newX = e.clientX - panelDragOffset.x
      const newY = e.clientY - panelDragOffset.y
      draggedPanel.style.left = `${newX}px`
      draggedPanel.style.top = `${newY}px`
      draggedPanel.style.transform = 'none'
    }
  })
  
  document.addEventListener('mouseup', () => {
    if (draggedPanel) {
      // 保存面板位置
      const panelId = draggedPanel.id
      const rect = draggedPanel.getBoundingClientRect()
      panelPositions[panelId] = { x: rect.left, y: rect.top }
      draggedPanel.style.cursor = 'move'
      draggedPanel = null
    }
  })

  // 组件拖拽
  let dragPreview: HTMLElement | null = null
  
  document.querySelectorAll('.component-item').forEach(item => {
    item.addEventListener('dragstart', (e) => {
      const event = e as DragEvent
      const target = event.target as HTMLElement
      const type = target.dataset.type
      if (type) {
        event.dataTransfer?.setData('component-type', type)
        
        // 创建拖拽预览
        dragPreview = document.createElement('div')
        dragPreview.style.cssText = `
          position: fixed;
          width: ${testComponentDef.defaultWidth}px;
          height: ${testComponentDef.defaultHeight}px;
          background: ${testComponentDef.defaultProps.backgroundColor};
          border: ${testComponentDef.defaultProps.borderWidth}px solid ${testComponentDef.defaultProps.borderColor};
          border-radius: ${testComponentDef.defaultProps.borderRadius}px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: ${testComponentDef.defaultProps.fontSize}px;
          color: ${testComponentDef.defaultProps.textColor};
          pointer-events: none;
          z-index: 1000;
          opacity: 0.8;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          transform: translate(-50%, -50%);
        `
        dragPreview.textContent = testComponentDef.defaultProps.text || '测试组件'
        document.body.appendChild(dragPreview)
        
        // 设置拖拽图像为透明
        const img = new Image()
        img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
        event.dataTransfer?.setDragImage(img, 0, 0)
      }
    })
    
    item.addEventListener('drag', (e) => {
      const event = e as DragEvent
      if (dragPreview && event.clientX > 0 && event.clientY > 0) {
        dragPreview.style.left = `${event.clientX}px`
        dragPreview.style.top = `${event.clientY}px`
      }
    })
    
    item.addEventListener('dragend', () => {
      if (dragPreview) {
        dragPreview.remove()
        dragPreview = null
      }
    })
  })
  
  // 属性编辑器事件
  if (showPropertyEditor && selectedComponentId) {
    bindPropertyEditorEvents()
  }

  // 组件事件
  bindComponentEvents()
  
  // 全局拖拽事件（只绑定一次）
  if (!globalEventsBound) {
    document.addEventListener('mousemove', handleDrag)
    document.addEventListener('mouseup', endDrag)
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement
      if (!target.closest('.canvas-component') && 
          !target.closest('[style*="position:fixed"]') &&
          !target.closest('.draggable-panel')) {
        selectedComponentId = null
        showPropertyEditor = false
        renderUI()
      }
    })
    globalEventsBound = true
  }
}

function bindPropertyEditorEvents() {
  const selected = components.find(c => c.id === selectedComponentId)
  if (!selected) return
  
  document.getElementById('prop-text')?.addEventListener('input', (e) => {
    selected.props.text = (e.target as HTMLInputElement).value
    renderWorkspace()
  })
  
  document.getElementById('prop-bg')?.addEventListener('input', (e) => {
    selected.props.backgroundColor = (e.target as HTMLInputElement).value
    renderWorkspace()
  })
  
  document.getElementById('prop-text-color')?.addEventListener('input', (e) => {
    selected.props.textColor = (e.target as HTMLInputElement).value
    renderWorkspace()
  })
  
  document.getElementById('prop-font-size')?.addEventListener('input', (e) => {
    selected.props.fontSize = +(e.target as HTMLInputElement).value
    renderWorkspace()
  })
  
  document.getElementById('prop-border-color')?.addEventListener('input', (e) => {
    selected.props.borderColor = (e.target as HTMLInputElement).value
    renderWorkspace()
  })
  
  document.getElementById('prop-border-width')?.addEventListener('input', (e) => {
    selected.props.borderWidth = +(e.target as HTMLInputElement).value
    renderWorkspace()
  })
  
  document.getElementById('prop-radius')?.addEventListener('input', (e) => {
    selected.props.borderRadius = +(e.target as HTMLInputElement).value
    renderWorkspace()
  })
  
  document.getElementById('prop-shadow')?.addEventListener('change', (e) => {
    selected.props.shadowEnabled = (e.target as HTMLInputElement).checked
    renderUI()
  })
  
  document.getElementById('prop-shadow-blur')?.addEventListener('input', (e) => {
    selected.props.shadowBlur = +(e.target as HTMLInputElement).value
    renderWorkspace()
  })
  
  document.getElementById('prop-shadow-spread')?.addEventListener('input', (e) => {
    selected.props.shadowSpread = +(e.target as HTMLInputElement).value
    renderWorkspace()
  })
  
  document.getElementById('prop-shadow-color')?.addEventListener('input', (e) => {
    selected.props.shadowColor = (e.target as HTMLInputElement).value
    renderWorkspace()
  })
  
  document.getElementById('btn-delete-component')?.addEventListener('click', () => {
    components = components.filter(c => c.id !== selectedComponentId)
    selectedComponentId = null
    showPropertyEditor = false
    renderUI()
  })
}

function bindComponentEvents() {
  // 为每个 workspace 绑定独立的事件
  workspaces.forEach(workspace => {
    const workspaceEl = document.getElementById(workspace.id)
    if (!workspaceEl) return
    
    // 移除旧的事件监听器（通过克隆元素）
    const newWorkspaceEl = workspaceEl.cloneNode(true) as HTMLElement
    workspaceEl.parentNode?.replaceChild(newWorkspaceEl, workspaceEl)
    
    newWorkspaceEl.addEventListener('dragover', (e) => {
      e.preventDefault()
    })
    
    newWorkspaceEl.addEventListener('drop', (e) => {
      e.preventDefault()
      const event = e as DragEvent
      const type = event.dataTransfer?.getData('component-type')
      if (!type) return
      
      const workspaceData = workspaces.find(w => w.id === workspace.id)
      if (!workspaceData) return
      
      const rect = newWorkspaceEl.getBoundingClientRect()
      let x = event.clientX - rect.left - testComponentDef.defaultWidth / 2
      let y = event.clientY - rect.top - testComponentDef.defaultHeight / 2
      
      // 网格吸附
      if (gridSettings.snapToGrid) {
        x = Math.round(x / gridSettings.dotSpacing) * gridSettings.dotSpacing
        y = Math.round(y / gridSettings.dotSpacing) * gridSettings.dotSpacing
      }
      
      const newComponent: ComponentInstance = {
        id: `${workspace.id}-component-${Date.now()}`,
        type: type,
        x: Math.max(0, Math.min(x, workspaceData.width - testComponentDef.defaultWidth)),
        y: Math.max(0, Math.min(y, workspaceData.height - testComponentDef.defaultHeight)),
        width: testComponentDef.defaultWidth,
        height: testComponentDef.defaultHeight,
        selected: false,
        props: { ...testComponentDef.defaultProps }
      }
      
      components.push(newComponent)
      renderUI()
      
      // 添加放置动画效果
      requestAnimationFrame(() => {
        const placedElement = document.querySelector(`[data-id="${newComponent.id}"]`) as HTMLElement
        if (placedElement) {
          placedElement.style.animation = 'componentDrop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
        }
      })
    })
    
    newWorkspaceEl.querySelectorAll('.canvas-component').forEach(el => {
      const element = el as HTMLElement
      const componentId = element.dataset.id
      
      element.addEventListener('mousedown', (e) => {
        if (!componentId) return
        
        const component = components.find(c => c.id === componentId)
        if (!component) return
        
        selectedComponentId = componentId
        currentWorkspaceId = workspace.id  // 确保更新当前 workspace
        showPropertyEditor = true
        showGridSettings = false
        showBgSettings = false
        showCanvasSettings = false
        showComponentPanel = false
        draggedComponent = component
        
        const rect = element.getBoundingClientRect()
        dragOffset = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        }
        
        element.style.zIndex = '100'
        renderUI()
      })
    })
  })
}

// ==================== 网格吸附拖拽 ====================
function handleDrag(e: MouseEvent) {
  if (!draggedComponent) return
  
  isDragging = true
  
  const workspace = document.getElementById(currentWorkspaceId)
  if (!workspace) return
  
  const workspaceData = workspaces.find(w => w.id === currentWorkspaceId)
  if (!workspaceData) return
  
  const rect = workspace.getBoundingClientRect()
  
  let newX = e.clientX - rect.left - dragOffset.x
  let newY = e.clientY - rect.top - dragOffset.y
  
  // 边界限制
  newX = Math.max(0, Math.min(newX, workspaceData.width - draggedComponent.width))
  newY = Math.max(0, Math.min(newY, workspaceData.height - draggedComponent.height))
  
  // 网格吸附
  if (gridSettings.snapToGrid) {
    newX = Math.round(newX / gridSettings.dotSpacing) * gridSettings.dotSpacing
    newY = Math.round(newY / gridSettings.dotSpacing) * gridSettings.dotSpacing
  }
  
  draggedComponent.x = newX
  draggedComponent.y = newY
  
  renderWorkspace()
}

function endDrag() {
  if (draggedComponent) {
    const element = document.querySelector(`[data-id="${draggedComponent.id}"]`) as HTMLElement
    if (element) {
      element.style.zIndex = ''
    }
  }
  
  draggedComponent = null
  isDragging = false
}

// ==================== 初始化 ====================
function init() {
  const match = document.cookie.match(/(?:^|; )codemypage=([^;]*)/)
  if (match) {
    try {
      const data = JSON.parse(decodeURIComponent(match[1]))
      if (data.gridSettings) gridSettings = { ...gridSettings, ...data.gridSettings }
      if (data.workspaces) workspaces = data.workspaces
      if (data.components) components = data.components
    } catch {}
  }
  renderUI()
  window.addEventListener('resize', () => renderWorkspace())
}

// ==================== 全局函数 ====================
function selectWorkspace(id: string) {
  currentWorkspaceId = id
  renderUI()
}

function deleteWorkspace(id: string) {
  if (workspaces.length <= 1) {
    alert('至少需要保留一个画布')
    return
  }
  
  const index = workspaces.findIndex(ws => ws.id === id)
  if (index > -1) {
    workspaces.splice(index, 1)
    if (currentWorkspaceId === id) {
      currentWorkspaceId = workspaces[0].id
    }
    // 删除画布下的组件
    components = components.filter(c => !c.id.startsWith(id + '-'))
    renderUI()
  }
}

// 将函数暴露到全局作用域
(window as any).selectWorkspace = selectWorkspace
;(window as any).deleteWorkspace = deleteWorkspace

init()