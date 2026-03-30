// ==================== UI渲染 ====================
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
  panelPositions
} from './state'
import type { GridSettings, Workspace, PanelPosition } from './types'
import type { ComponentInstance } from './test-component'

export function renderDropdown(title: string, content: string, id?: string): string {
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

export function renderAddWorkspaceDialog(): string {
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

export function addStyles() {
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