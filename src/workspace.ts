// ==================== workspace渲染 ====================
import { colors } from './constants'
import { 
  gridSettings, 
  workspaces, 
  currentWorkspaceId,
  components,
  setCurrentWorkspaceId
} from './state'
import type { Workspace } from './types'
import type { ComponentInstance } from './test-component'
import { renderTestComponent } from './test-component'
import { bindComponentEvents } from './events'

export function renderWorkspace() {
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
      setCurrentWorkspaceId(workspace.id)
      renderUI()
    })
    
    workspaceEl.appendChild(titleEl)
    document.body.appendChild(workspaceEl)
  })
  
  bindComponentEvents()
}

// 导入renderUI函数
import { renderUI } from './app'