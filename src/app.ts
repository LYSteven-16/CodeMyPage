// ==================== 主入口 ====================
import 'virtual:uno.css'
import { colors } from './constants'
import { 
  gridSettings, 
  workspaces, 
  currentWorkspaceId,
  showGridSettings,
  showBgSettings,
  showCanvasSettings,
  showComponentPanel,
  showPropertyEditor,
  showAddWorkspaceDialog,
  components,
  selectedComponentId,
  setShowGridSettings,
  setShowBgSettings,
  setShowCanvasSettings,
  setShowComponentPanel,
  setShowPropertyEditor,
  setShowAddWorkspaceDialog,
  setGridSettings,
  setWorkspaces,
  setCurrentWorkspaceId,
  setComponents,
  setSelectedComponentId
} from './state'
import { renderDropdown, renderAddWorkspaceDialog, addStyles } from './ui'
import { renderWorkspace } from './workspace'
import { bindEvents } from './events'
import { restoreState } from './persistence'
import { 
  registerComponents, 
  getComponentMenuItems,
  getComponentDef
} from './component-registry'
import type { ComponentDefinition, PropertiesPanelControl } from './types'

function renderControl(control: PropertiesPanelControl, props: Record<string, any>): string {
  const value = props[control.id] ?? control.default
  const domId = control.domId || `prop-${control.id}`
  
  switch (control.type) {
    case 'text':
      return `<div style="margin-bottom:12px;">
        <label style="font-size:11px;color:${colors.textSecondary};display:block;margin-bottom:4px;">${control.label}</label>
        <input type="text" id="${domId}" value="${value || ''}" class="inp" style="width:100%;" placeholder="${control.placeholder || ''}">
      </div>`
    
    case 'number':
      return `<div>
        <label style="font-size:${control.smallLabel ? 10 : 11}px;color:${colors.textSecondary};display:block;margin-bottom:4px;">${control.label}</label>
        <input type="number" id="${domId}" value="${value}" class="inp" style="width:100%;">
      </div>`
    
    case 'range':
      const rangeValue = value ?? control.default ?? 0
      const displayValue = control.showValue ? ` (${rangeValue}${control.valueSuffix || ''})` : ''
      return `<div style="margin-bottom:12px;">
        <label style="font-size:11px;color:${colors.textSecondary};display:block;margin-bottom:4px;">${control.label}${displayValue}</label>
        <input type="range" id="${domId}" min="${control.min ?? 0}" max="${control.max ?? 100}" value="${rangeValue}" class="inp" style="width:100%;accent-color:${colors.blue};">
      </div>`
    
    case 'color':
      if (control.showTextInput) {
        return `<div style="margin-bottom:12px;">
          <label style="font-size:11px;color:${colors.textSecondary};display:block;margin-bottom:4px;">${control.label}</label>
          <div style="display:flex;align-items:center;gap:8px;">
            <input type="color" id="${domId}" value="${value || control.default}" style="width:32px;height:32px;border:1px solid ${colors.divider};border-radius:8px;cursor:pointer;padding:0;">
            <input type="text" id="${domId}-text" value="${value || control.default}" class="inp" style="flex:1;">
          </div>
        </div>`
      }
      if (control.compact) {
        return `<div>
          <label style="font-size:${control.smallLabel ? 10 : 11}px;color:${colors.textSecondary};display:block;margin-bottom:4px;">${control.label}</label>
          <input type="color" id="${domId}" value="${value || control.default}" style="width:100%;height:28px;border:1px solid ${colors.divider};border-radius:6px;cursor:pointer;padding:0;">
        </div>`
      }
      return `<div style="margin-bottom:12px;">
        <label style="font-size:11px;color:${colors.textSecondary};display:block;margin-bottom:4px;">${control.label}</label>
        <input type="color" id="${domId}" value="${value || control.default}" style="width:100%;height:32px;border:1px solid ${colors.divider};border-radius:8px;cursor:pointer;padding:0;">
      </div>`
    
    case 'checkbox':
      const checked = value !== false ? 'checked' : ''
      if (control.sectionHeader) {
        return `<div style="margin-bottom:12px;border-top:1px solid ${colors.divider};padding-top:12px;">
          <label style="display:flex;align-items:center;gap:8px;font-size:12px;color:${colors.textSecondary};cursor:pointer;margin-bottom:8px;">
            <input type="checkbox" id="${domId}" ${checked} style="accent-color:${colors.blue};">
            ${control.label}
          </label>`
      }
      return `<label style="display:flex;align-items:center;gap:8px;font-size:12px;color:${colors.textSecondary};cursor:pointer;">
        <input type="checkbox" id="${domId}" ${checked} style="accent-color:${colors.blue};">
        ${control.label}
      </label>`
    
    default:
      return ''
  }
}

function renderPropertiesPanel(def: ComponentDefinition, selectedComponent: any): string {
  const props = selectedComponent.props || {}
  const panel = def.propertiesPanel
  
  if (!panel || !panel.sections) {
    return `<div style="padding:16px;">
      <div style="font-size:13px;color:${colors.textSecondary};">此组件暂无可配置属性</div>
    </div>`
  }
  
  let html = '<div style="padding:16px;max-height:400px;overflow-y:auto;">'
  
  panel.sections.forEach((section, sectionIndex) => {
    const halfControls: PropertiesPanelControl[] = []
    const fullControls: PropertiesPanelControl[] = []
    
    section.controls.forEach(control => {
      if (control.layout === 'half') {
        halfControls.push(control)
      } else {
        fullControls.push(control)
      }
    })
    
    for (let i = 0; i < halfControls.length; i += 2) {
      const c1 = halfControls[i]
      const c2 = halfControls[i + 1]
      html += `<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px;">
        ${renderControl(c1, props)}
        ${c2 ? renderControl(c2, props) : '<div></div>'}
      </div>`
    }
    
    fullControls.forEach(control => {
      const controlHtml = renderControl(control, props)
      if (control.type === 'checkbox' && control.sectionHeader) {
        html += controlHtml
      } else if (control.type === 'checkbox' && !control.sectionHeader && sectionIndex > 0) {
        html += controlHtml
      } else {
        html += controlHtml
      }
    })
    
    const lastControl = section.controls[section.controls.length - 1]
    if (lastControl && lastControl.type === 'checkbox' && lastControl.sectionHeader) {
      html += '</div>'
    }
  })
  
  html += `<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;border-top:1px solid ${colors.divider};padding-top:12px;">
    <div>
      <label style="font-size:11px;color:${colors.textSecondary};display:block;margin-bottom:4px;">宽度</label>
      <input type="number" id="prop-width" value="${selectedComponent.width || def.defaultWidth}" class="inp" style="width:100%;">
    </div>
    <div>
      <label style="font-size:11px;color:${colors.textSecondary};display:block;margin-bottom:4px;">高度</label>
      <input type="number" id="prop-height" value="${selectedComponent.height || def.defaultHeight}" class="inp" style="width:100%;">
    </div>
  </div>
  <div style="margin-top:12px;display:flex;justify-content:space-between;align-items:center;">
    <div style="font-size:11px;color:${colors.textSecondary};">
      位置: (${Math.round(selectedComponent.x)}, ${Math.round(selectedComponent.y)})
    </div>
    <button id="btn-delete-component" style="font-size:12px;color:${colors.red};background:none;border:none;cursor:pointer;padding:4px 8px;border-radius:4px;">删除组件</button>
  </div>
  <div style="margin-top:8px;display:flex;justify-content:space-between;align-items:center;border-top:1px solid ${colors.divider};padding-top:12px;">
    <div style="font-size:11px;color:${colors.textSecondary};">
      层级: ${selectedComponent.zIndex || 0}
    </div>
    <div style="display:flex;gap:4px;">
      <button id="btn-zindex-up" style="font-size:11px;color:${colors.text};background:${colors.bg};border:1px solid ${colors.divider};cursor:pointer;padding:4px 8px;border-radius:4px;">上移一层</button>
      <button id="btn-zindex-down" style="font-size:11px;color:${colors.text};background:${colors.bg};border:1px solid ${colors.divider};cursor:pointer;padding:4px 8px;border-radius:4px;">下移一层</button>
    </div>
  </div>
  <div style="margin-top:8px;display:flex;justify-content:space-between;align-items:center;">
    <div></div>
    <div style="display:flex;gap:4px;">
      ${(() => {
        const wsComponents = components.filter(c => c.id.startsWith(selectedComponent.id.split('-component-')[0] + '-component-'))
        const maxZ = Math.max(...wsComponents.map(c => c.zIndex || 0))
        const minZ = Math.min(...wsComponents.map(c => c.zIndex || 0))
        const currentZ = selectedComponent.zIndex || 0
        const isTop = currentZ >= maxZ
        const isBottom = currentZ <= minZ
        const disabledStyle = 'opacity:0.4;cursor:not-allowed;'
        const enabledStyle = 'cursor:pointer;'
        return `
          <button id="btn-zindex-top" style="font-size:11px;color:${colors.text};background:${colors.bg};border:1px solid ${colors.divider};padding:4px 8px;border-radius:4px;${isTop ? disabledStyle : enabledStyle}" ${isTop ? 'disabled' : ''}>顶层</button>
          <button id="btn-zindex-bottom" style="font-size:11px;color:${colors.text};background:${colors.bg};border:1px solid ${colors.divider};padding:4px 8px;border-radius:4px;${isBottom ? disabledStyle : enabledStyle}" ${isBottom ? 'disabled' : ''}>底层</button>
        `
      })()}
    </div>
  </div>
</div>`
  
  return html
}

function selectWorkspace(id: string) {
  setCurrentWorkspaceId(id)
  renderUI()
}

function deleteWorkspace(id: string) {
  if (workspaces.length <= 1) {
    alert('至少需要保留一个画布')
    return
  }
  
  const index = workspaces.findIndex(ws => ws.id === id)
  if (index > -1) {
    const newWorkspaces = [...workspaces]
    newWorkspaces.splice(index, 1)
    setWorkspaces(newWorkspaces)
    if (currentWorkspaceId === id) {
      setCurrentWorkspaceId(newWorkspaces[0].id)
    }
    setComponents(components.filter(c => !c.id.startsWith(id + '-')))
    renderUI()
  }
}

(window as any).selectWorkspace = selectWorkspace
;(window as any).deleteWorkspace = deleteWorkspace

export function renderUI() {
  document.body.style.cssText = `
    margin: 0;
    padding: 0;
    background: ${gridSettings.dotGridBackground};
    background-image: radial-gradient(circle,${gridSettings.dotColor} ${gridSettings.dotSize}px,transparent ${gridSettings.dotSize}px);
    background-size: ${gridSettings.dotSpacing}px ${gridSettings.dotSpacing}px;
  `
  
  let maxX = 0, maxY = 0
  workspaces.forEach(ws => {
    const wsRight = ws.offset.x + ws.width
    const wsBottom = ws.offset.y + ws.height
    if (wsRight > maxX) maxX = wsRight
    if (wsBottom > maxY) maxY = wsBottom
  })
  
  document.body.innerHTML = `
    <!-- 顶部工具栏 -->
    <div class="toolbar-shell" style="position:fixed;top:12px;left:50%;transform:translateX(-50%);z-index:99999;background:${colors.white};backdrop-filter:blur(20px);border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,0.08),0 0 0 1px rgba(0,0,0,0.04);">
      <div class="toolbar-brand">CodeMyPage</div>
      <div class="toolbar-group">
        <button id="btn-grid" class="btn ${showGridSettings ? 'active' : ''}">网格</button>
        <button id="btn-bg" class="btn ${showBgSettings ? 'active' : ''}">背景</button>
        <button id="btn-canvas" class="btn ${showCanvasSettings ? 'active' : ''}">画布</button>
        <button id="btn-components" class="btn ${showComponentPanel ? 'active' : ''}">组件</button>
      </div>
      <div class="toolbar-group">
        <button id="btn-preview" class="btn-pri">预览</button>
        <button id="btn-load" class="btn">加载</button>
        <button id="btn-export" class="btn">导出</button>
        <button id="btn-reset" class="btn btn-danger">重置</button>
      </div>
      <div class="toolbar-group">
        <button id="btn-save" class="btn-pri">保存</button>
      </div>
    </div>

    ${showGridSettings ? renderDropdown('网格设置', `
      <div class="canvas-settings-section">
        <h3 class="canvas-settings-title">吸附设置</h3>
        <label style="display:flex;align-items:center;gap:8px;font-size:13px;color:${colors.textSecondary};cursor:pointer;margin-bottom:12px;">
          <input type="checkbox" id="snap-toggle" ${gridSettings.snapToGrid ? 'checked' : ''} style="accent-color:${colors.blue};">
          启用网格吸附
        </label>
        <div style="display:flex;align-items:center;gap:12px;">
          <span style="font-size:12px;color:${colors.textSecondary};width:50px;">间距</span>
          <input type="range" id="spacing" min="10" max="60" value="${gridSettings.dotSpacing}" style="flex:1;accent-color:${colors.blue};">
          <span style="font-size:12px;color:${colors.textSecondary};width:40px;text-align:right;">${gridSettings.dotSpacing}px</span>
        </div>
        <div style="font-size:11px;color:${colors.textSecondary};margin-top:8px;">
          组件将吸附到 ${gridSettings.dotSpacing}px 网格
        </div>
      </div>
    `) : ''}

    ${showBgSettings ? renderDropdown('工作区背景', `
      <div class="canvas-settings-section">
        <h3 class="canvas-settings-title">背景颜色</h3>
        <div style="display:flex;align-items:center;gap:12px;">
          <input type="color" id="bg-color" value="${gridSettings.dotGridBackground}" style="width:32px;height:32px;border:1px solid ${colors.divider};border-radius:8px;cursor:pointer;">
          <span style="font-size:13px;color:${colors.textSecondary};">${gridSettings.dotGridBackground}</span>
        </div>
      </div>
    `) : ''}

    ${showCanvasSettings ? renderDropdown('画布设置', `
      <div class="canvas-settings-section">
        <h3 class="canvas-settings-title">画布列表</h3>
        <div style="margin-bottom:8px;max-height:136px;overflow-y:auto;padding-right:2px;">
          ${workspaces.map(ws => `
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;padding:6px 8px;background:${ws.id === currentWorkspaceId ? 'rgba(0,122,255,0.08)' : colors.white};border:1px solid ${ws.id === currentWorkspaceId ? 'rgba(0,122,255,0.2)' : colors.divider};border-radius:8px;cursor:pointer;" onclick="selectWorkspace('${ws.id}')">
              <div style="width:8px;height:8px;border-radius:50%;background:${ws.id === currentWorkspaceId ? colors.blue : colors.textSecondary};"></div>
              <span style="font-size:13px;color:${ws.id === currentWorkspaceId ? colors.blue : colors.text};flex:1;">${ws.name}</span>
              <button onclick="event.stopPropagation();deleteWorkspace('${ws.id}')" style="font-size:12px;color:${colors.red};background:none;border:none;cursor:pointer;padding:2px 6px;border-radius:4px;">删除</button>
            </div>
          `).join('')}
        </div>
        <button id="btn-add-workspace" class="btn-pri" style="width:100%;height:32px;">添加画布</button>
      </div>

      <div class="canvas-settings-section">
        <h3 class="canvas-settings-title">当前画布设置</h3>
        <div style="font-size:11px;color:${colors.textSecondary};margin-bottom:8px;">
          当前正在编辑：${workspaces.find(ws => ws.id === currentWorkspaceId)?.name || '未选择'}
        </div>
        <div style="margin-bottom:8px;">
          <label style="font-size:12px;color:${colors.textSecondary};display:block;margin-bottom:6px;">画布名称</label>
          <input type="text" id="current-workspace-name" value="${workspaces.find(ws => ws.id === currentWorkspaceId)?.name || ''}" class="inp" style="width:100%;">
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px;">
          <div>
            <label style="font-size:11px;color:${colors.textSecondary};display:block;margin-bottom:4px;">宽度(px)</label>
            <input type="number" id="current-workspace-width" value="${workspaces.find(ws => ws.id === currentWorkspaceId)?.width ?? 1000}" class="inp" style="width:100%;">
          </div>
          <div>
            <label style="font-size:11px;color:${colors.textSecondary};display:block;margin-bottom:4px;">高度(px)</label>
            <input type="number" id="current-workspace-height" value="${workspaces.find(ws => ws.id === currentWorkspaceId)?.height ?? 1600}" class="inp" style="width:100%;">
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px;">
          <div>
            <label style="font-size:11px;color:${colors.textSecondary};display:block;margin-bottom:4px;">X 位置(px)</label>
            <input type="number" id="current-workspace-x" value="${workspaces.find(ws => ws.id === currentWorkspaceId)?.offset.x ?? 0}" class="inp" style="width:100%;">
          </div>
          <div>
            <label style="font-size:11px;color:${colors.textSecondary};display:block;margin-bottom:4px;">Y 位置(px)</label>
            <input type="number" id="current-workspace-y" value="${workspaces.find(ws => ws.id === currentWorkspaceId)?.offset.y ?? 0}" class="inp" style="width:100%;">
          </div>
        </div>
        <div style="margin-bottom:8px;">
          <label style="font-size:11px;color:${colors.textSecondary};display:block;margin-bottom:4px;">背景颜色</label>
          <div style="display:flex;align-items:center;gap:8px;">
            <input type="color" id="canvas-color" value="${workspaces.find(ws => ws.id === currentWorkspaceId)?.canvasBackground || '#ffffff'}" class="inp" style="width:50px;height:28px;padding:0;">
            <input type="text" id="canvas-color-text" value="${workspaces.find(ws => ws.id === currentWorkspaceId)?.canvasBackground || '#ffffff'}" class="inp" style="flex:1;">
          </div>
        </div>
        <div style="margin-bottom:8px;">
          <label style="font-size:11px;color:${colors.textSecondary};display:block;margin-bottom:4px;">圆角(px)</label>
          <input type="number" id="canvas-radius" value="${workspaces.find(ws => ws.id === currentWorkspaceId)?.canvasBorderRadius ?? 0}" class="inp" style="width:100%;">
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:8px;">
          <label style="display:flex;align-items:center;gap:8px;font-size:12px;color:${colors.textSecondary};cursor:pointer;">
            <input type="checkbox" id="current-workspace-shadow" ${workspaces.find(ws => ws.id === currentWorkspaceId)?.showShadow !== false ? 'checked' : ''} style="accent-color:${colors.blue};">
            显示阴影
          </label>
          <label style="display:flex;align-items:center;gap:8px;font-size:12px;color:${colors.textSecondary};cursor:pointer;">
            <input type="checkbox" id="current-workspace-border" ${workspaces.find(ws => ws.id === currentWorkspaceId)?.showBorder !== false ? 'checked' : ''} style="accent-color:${colors.blue};">
            显示边框
          </label>
        </div>
        <div style="margin-top:8px;">
          <label style="display:flex;align-items:center;gap:8px;font-size:12px;color:${colors.textSecondary};cursor:pointer;">
            <input type="checkbox" id="current-workspace-floating" ${workspaces.find(ws => ws.id === currentWorkspaceId)?.floating ? 'checked' : ''} style="accent-color:${colors.blue};">
            浮动层级
          </label>
        </div>
        <div style="margin-top:12px;border-top:1px solid ${colors.divider};padding-top:12px;">
          <h4 style="font-size:11px;font-weight:600;color:${colors.textSecondary};margin-bottom:8px;">阴影设置</h4>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px;">
            <div>
              <label style="font-size:10px;color:${colors.textSecondary};display:block;margin-bottom:4px;">模糊(px)</label>
              <input type="number" id="shadow-blur" value="${workspaces.find(ws => ws.id === currentWorkspaceId)?.shadowBlur ?? 20}" class="inp" style="width:100%;">
            </div>
            <div>
              <label style="font-size:10px;color:${colors.textSecondary};display:block;margin-bottom:4px;">扩散(px)</label>
              <input type="number" id="shadow-spread" value="${workspaces.find(ws => ws.id === currentWorkspaceId)?.shadowSpread ?? 0}" class="inp" style="width:100%;">
            </div>
          </div>
          <div>
            <label style="font-size:10px;color:${colors.textSecondary};display:block;margin-bottom:4px;">阴影颜色</label>
            <div style="display:flex;align-items:center;gap:8px;">
              <input type="color" id="shadow-color" value="${workspaces.find(ws => ws.id === currentWorkspaceId)?.shadowColor || 'rgba(0,0,0,0.1)'}" class="inp" style="width:50px;height:28px;padding:0;">
              <input type="text" id="shadow-color-text" value="${workspaces.find(ws => ws.id === currentWorkspaceId)?.shadowColor || 'rgba(0,0,0,0.1)'}" class="inp" style="flex:1;">
            </div>
          </div>
        </div>
      </div>
    `) : ''}

    ${showComponentPanel ? renderDropdown('组件面板', `
      <div class="canvas-settings-section">
        <h3 class="canvas-settings-title">组件列表</h3>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
          ${getComponentMenuItems().map(comp => `
            <div 
              class="component-item"
              data-type="${comp.type}"
              style="
                padding:12px;
                background:${colors.white};
                border-radius:8px;
                cursor:grab;
                text-align:center;
                font-size:12px;
                color:${colors.text};
                border:1px solid ${colors.divider};
                transition: border-color 0.2s;
              "
              draggable="true"
            >
              <div style="font-size:24px;margin-bottom:4px;">${comp.icon}</div>
              <div>${comp.name}</div>
            </div>
          `).join('')}
        </div>
      </div>
      <div style="margin-top:8px;font-size:11px;color:${colors.textSecondary};">
        拖拽组件到画布中
      </div>
    `) : ''}
  `

  const selectedComponent = components.find(c => c.id === selectedComponentId)
  
  if (selectedComponent && showPropertyEditor) {
    const def = getComponentDef(selectedComponent.type)
    if (def) {
      const panelContent = renderPropertiesPanel(def as ComponentDefinition, selectedComponent)
      document.body.insertAdjacentHTML('beforeend', renderDropdown(`${def.name} 属性`, panelContent, 'panel-properties'))
    }
  }
  
  if (showAddWorkspaceDialog) {
    document.body.insertAdjacentHTML('beforeend', renderAddWorkspaceDialog())
  }
  
  renderWorkspace()
  addStyles()
  bindEvents()
}
