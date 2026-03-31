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
import { 
  registerComponents, 
  getComponentMenuItems
} from './component-registry'

export function renderUI() {
  const app = document.getElementById('app')!
  const floatBg = `background:${colors.white};backdrop-filter:blur(20px);border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,0.08),0 0 0 1px rgba(0,0,0,0.04);`

  const selectedComponent = components.find(c => c.id === selectedComponentId)

  app.innerHTML = `
    <!-- 顶部工具栏 -->
    <div class="toolbar-shell" style="position:fixed;top:12px;left:50%;transform:translateX(-50%);z-index:9999;${floatBg}">
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
            <input type="number" id="current-workspace-width" value="${workspaces.find(ws => ws.id === currentWorkspaceId)?.width || 1000}" class="inp" style="width:100%;">
          </div>
          <div>
            <label style="font-size:11px;color:${colors.textSecondary};display:block;margin-bottom:4px;">高度(px)</label>
            <input type="number" id="current-workspace-height" value="${workspaces.find(ws => ws.id === currentWorkspaceId)?.height || 1600}" class="inp" style="width:100%;">
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px;">
          <div>
            <label style="font-size:11px;color:${colors.textSecondary};display:block;margin-bottom:4px;">X 位置(px)</label>
            <input type="number" id="current-workspace-x" value="${workspaces.find(ws => ws.id === currentWorkspaceId)?.offset.x || 0}" class="inp" style="width:100%;">
          </div>
          <div>
            <label style="font-size:11px;color:${colors.textSecondary};display:block;margin-bottom:4px;">Y 位置(px)</label>
            <input type="number" id="current-workspace-y" value="${workspaces.find(ws => ws.id === currentWorkspaceId)?.offset.y || 60}" class="inp" style="width:100%;">
          </div>
        </div>
        <div style="height:1px;background:${colors.divider};margin:10px 0 8px;"></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px;">
          <div>
            <label style="font-size:11px;color:${colors.textSecondary};display:block;margin-bottom:4px;">背景颜色</label>
            <input type="color" id="canvas-color" value="${workspaces.find(ws => ws.id === currentWorkspaceId)?.canvasBackground || gridSettings.canvasBackground}" style="width:100%;height:32px;border:1px solid ${colors.divider};border-radius:8px;cursor:pointer;">
          </div>
          <div>
            <label style="font-size:11px;color:${colors.textSecondary};display:block;margin-bottom:4px;">圆角(px)</label>
            <input type="number" id="canvas-radius" min="0" max="999" value="${workspaces.find(ws => ws.id === currentWorkspaceId)?.canvasBorderRadius || gridSettings.canvasBorderRadius}" class="inp" style="width:100%;">
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px;">
          <label style="display:flex;align-items:center;gap:8px;font-size:13px;color:${colors.textSecondary};cursor:pointer;background:${colors.white};padding:8px;border-radius:8px;border:1px solid ${colors.divider};">
            <input type="checkbox" id="current-workspace-floating" ${workspaces.find(ws => ws.id === currentWorkspaceId)?.floating ? 'checked' : ''} style="accent-color:${colors.blue};">
            悬浮画布
          </label>
          <label style="display:flex;align-items:center;gap:8px;font-size:13px;color:${colors.textSecondary};cursor:pointer;background:${colors.white};padding:8px;border-radius:8px;border:1px solid ${colors.divider};">
            <input type="checkbox" id="current-workspace-shadow" ${workspaces.find(ws => ws.id === currentWorkspaceId)?.showShadow !== false ? 'checked' : ''} style="accent-color:${colors.blue};">
            显示阴影
          </label>
        </div>
        <div id="shadow-options" style="margin-left:0;margin-bottom:2px;display:${workspaces.find(ws => ws.id === currentWorkspaceId)?.showShadow !== false ? 'block' : 'none'};">
          <div style="font-size:11px;font-weight:600;color:${colors.blue};letter-spacing:0.02em;margin-bottom:6px;">阴影设置</div>
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
            <span style="font-size:12px;color:${colors.textSecondary};width:62px;">扩展(px)</span>
            <input type="range" id="shadow-spread" min="-20" max="20" value="${workspaces.find(ws => ws.id === currentWorkspaceId)?.shadowSpread ?? 0}" style="flex:1;accent-color:${colors.blue};">
          </div>
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
            <span style="font-size:12px;color:${colors.textSecondary};width:62px;">模糊(px)</span>
            <input type="range" id="shadow-blur" min="0" max="50" value="${workspaces.find(ws => ws.id === currentWorkspaceId)?.shadowBlur ?? 20}" style="flex:1;accent-color:${colors.blue};">
          </div>
          <div style="display:flex;align-items:center;gap:8px;">
            <span style="font-size:12px;color:${colors.textSecondary};width:62px;">阴影颜色</span>
            <input type="color" id="shadow-color" value="${workspaces.find(ws => ws.id === currentWorkspaceId)?.shadowColor ?? 'rgba(0,0,0,0.1)'}" style="width:100%;height:32px;border:1px solid ${colors.divider};border-radius:8px;cursor:pointer;">
          </div>
        </div>
      </div>
    `) : ''}

    ${showComponentPanel ? renderDropdown('组件库', `
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

    ${showPropertyEditor && selectedComponent ? renderDropdown('组件属性', `
      <div class="canvas-settings-section">
        <h3 class="canvas-settings-title">尺寸设置</h3>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px;">
          <div>
            <label style="font-size:11px;color:${colors.textSecondary};display:block;margin-bottom:4px;">宽度</label>
            <input type="number" id="prop-width" value="${selectedComponent.width}" class="inp" style="width:100%;">
          </div>
          <div>
            <label style="font-size:11px;color:${colors.textSecondary};display:block;margin-bottom:4px;">高度</label>
            <input type="number" id="prop-height" value="${selectedComponent.height}" class="inp" style="width:100%;">
          </div>
        </div>
      </div>
      
      <div class="canvas-settings-section">
        <h3 class="canvas-settings-title">文本设置</h3>
        <div style="margin-bottom:8px;">
          <label style="font-size:11px;color:${colors.textSecondary};display:block;margin-bottom:4px;">文本内容</label>
          <input type="text" id="prop-text" value="${selectedComponent.props.text || ''}" class="inp" style="width:100%;">
        </div>
        <div style="margin-bottom:8px;">
          <label style="font-size:11px;color:${colors.textSecondary};display:block;margin-bottom:4px;">文字颜色</label>
          <input type="color" id="prop-text-color" value="${selectedComponent.props.textColor || '#1d1d1f'}" style="width:100%;height:32px;border:1px solid ${colors.divider};border-radius:8px;cursor:pointer;">
        </div>
        <div style="margin-bottom:8px;">
          <label style="font-size:11px;color:${colors.textSecondary};display:block;margin-bottom:4px;">字体大小</label>
          <input type="number" id="prop-font-size" value="${selectedComponent.props.fontSize || 14}" class="inp" style="width:100%;">
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
          <div>
            <label style="font-size:11px;color:${colors.textSecondary};display:block;margin-bottom:4px;">文字 X</label>
            <input type="number" id="prop-text-x" value="${selectedComponent.props.textX !== undefined ? selectedComponent.props.textX : 20}" class="inp" style="width:100%;">
          </div>
          <div>
            <label style="font-size:11px;color:${colors.textSecondary};display:block;margin-bottom:4px;">文字 Y</label>
            <input type="number" id="prop-text-y" value="${selectedComponent.props.textY !== undefined ? selectedComponent.props.textY : 20}" class="inp" style="width:100%;">
          </div>
        </div>
      </div>
      
      <div class="canvas-settings-section">
        <h3 class="canvas-settings-title">外观设置</h3>
        <div style="margin-bottom:8px;">
          <label style="font-size:11px;color:${colors.textSecondary};display:block;margin-bottom:4px;">背景颜色</label>
          <input type="color" id="prop-bg" value="${selectedComponent.props.backgroundColor || '#ffffff'}" style="width:100%;height:32px;border:1px solid ${colors.divider};border-radius:8px;cursor:pointer;">
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px;">
          <div>
            <label style="font-size:11px;color:${colors.textSecondary};display:block;margin-bottom:4px;">边框颜色</label>
            <input type="color" id="prop-border-color" value="${selectedComponent.props.borderColor || '#e5e5e5'}" style="width:100%;height:32px;border:1px solid ${colors.divider};border-radius:8px;cursor:pointer;">
          </div>
          <div>
            <label style="font-size:11px;color:${colors.textSecondary};display:block;margin-bottom:4px;">边框宽度</label>
            <input type="number" id="prop-border-width" value="${selectedComponent.props.borderWidth || 1}" class="inp" style="width:100%;">
          </div>
        </div>
        <div style="margin-bottom:8px;">
          <label style="font-size:11px;color:${colors.textSecondary};display:block;margin-bottom:4px;">圆角</label>
          <input type="number" id="prop-radius" value="${selectedComponent.props.borderRadius || 8}" class="inp" style="width:100%;">
        </div>
      </div>
      
      <div class="canvas-settings-section">
        <h3 class="canvas-settings-title">阴影设置</h3>
        <label style="display:flex;align-items:center;gap:8px;font-size:12px;color:${colors.textSecondary};cursor:pointer;margin-bottom:8px;">
          <input type="checkbox" id="prop-shadow" ${selectedComponent.props.shadowEnabled ? 'checked' : ''} style="accent-color:${colors.blue};">
          显示阴影
        </label>
        <div id="shadow-options" style="display:${selectedComponent.props.shadowEnabled ? 'block' : 'none'};">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
            <span style="font-size:12px;color:${colors.textSecondary};width:40px;">模糊</span>
            <input type="range" id="prop-shadow-blur" min="0" max="50" value="${selectedComponent.props.shadowBlur || 10}" style="flex:1;accent-color:${colors.blue};">
          </div>
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
            <span style="font-size:12px;color:${colors.textSecondary};width:40px;">扩展</span>
            <input type="range" id="prop-shadow-spread" min="-20" max="20" value="${selectedComponent.props.shadowSpread || 0}" style="flex:1;accent-color:${colors.blue};">
          </div>
          <div>
            <label style="font-size:11px;color:${colors.textSecondary};display:block;margin-bottom:4px;">颜色</label>
            <input type="color" id="prop-shadow-color" value="${selectedComponent.props.shadowColor || 'rgba(0,0,0,0.1)'}" style="width:100%;height:28px;border:1px solid ${colors.divider};border-radius:6px;cursor:pointer;">
          </div>
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

// ==================== 初始化 ====================
async function init() {
  // 首先注册组件
  await registerComponents()
  
  const match = document.cookie.match(/(?:^|; )codemypage=([^;]*)/)
  if (match) {
    try {
      const data = JSON.parse(decodeURIComponent(match[1]))
      if (data.gridSettings) setGridSettings({ ...gridSettings, ...data.gridSettings })
      if (data.workspaces) setWorkspaces(data.workspaces)
      if (data.components) setComponents(data.components)
    } catch {}
  }
  renderUI()
  window.addEventListener('resize', () => renderWorkspace())
}

// ==================== 全局函数 ====================
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
    // 删除画布下的组件
    setComponents(components.filter(c => !c.id.startsWith(id + '-')))
    renderUI()
  }
}

// 将函数暴露到全局作用域
(window as any).selectWorkspace = selectWorkspace
;(window as any).deleteWorkspace = deleteWorkspace

init()