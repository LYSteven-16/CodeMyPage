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
  const panelWidth = 'width:min(280px,calc(100vw - 20px));'
  return `<div id="${panelId}" class="draggable-panel" style="position:fixed;${positionStyle}z-index:99999;background:rgba(255,255,255,0.98);backdrop-filter:blur(20px);border-radius:12px;box-shadow:0 4px 24px rgba(0,0,0,0.12);padding:10px;${panelWidth}max-height:calc(100vh - 100px);display:flex;flex-direction:column;overflow:hidden;">
    <div class="panel-header" style="font-size:14px;font-weight:600;color:${colors.text};margin-bottom:10px;padding:2px 2px 0;cursor:grab;user-select:none;">${title}</div>
    <div class="panel-content" style="overflow:auto;padding:2px 4px 4px 2px;">
      ${content}
    </div>
  </div>`
}

export function renderAddWorkspaceDialog(): string {
  const nextNumber = workspaces.length + 1
  return `<div style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:99999;display:flex;align-items:center;justify-content:center;">
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
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    }
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
    .btn-danger{color:${colors.red};}
    .btn-danger:hover{background:rgba(255,59,48,0.08);}
    .btn-pri{height:32px;padding:0 14px;font-size:13px;font-weight:500;color:#fff;background:${colors.blue};border:none;border-radius:8px;cursor:pointer;}
    .btn-pri:hover{background:#0066d6;}
    .icon-btn{width:32px;height:32px;font-size:16px;color:${colors.text};background:none;border:none;border-radius:8px;cursor:pointer;}
    .icon-btn:hover{background:rgba(0,0,0,0.04);}
    .inp{width:100%;padding:8px 10px;font-size:12px;color:${colors.text};background:${colors.bg};border:none;border-radius:8px;outline:none;box-sizing:border-box;}
    .inp:focus{box-shadow:0 0 0 2px rgba(0,122,255,0.2);}
    .component-item:hover{border-color:${colors.blue} !important;}
    .canvas-settings-section{
      margin-bottom:10px;
      padding:8px;
      background:${colors.bg};
      border-radius:10px;
    }
    .canvas-settings-title{
      font-size:11px;
      font-weight:600;
      color:${colors.textSecondary};
      text-transform:uppercase;
      margin:0 0 8px;
      letter-spacing:0.03em;
    }
    .panel-content label {
      font-size: 11px;
      color: ${colors.textSecondary};
      display: block;
      margin-bottom: 4px;
    }
    .panel-content input[type="range"] {
      width: 100%;
      accent-color: ${colors.blue};
    }
    .panel-content input[type="color"] {
      width: 100%;
      height: 32px;
      border: 1px solid ${colors.divider};
      border-radius: 8px;
      cursor: pointer;
    }
    .panel-content .inp {
      width: 100%;
      padding: 8px 10px;
      font-size: 12px;
      color: ${colors.text};
      background: ${colors.bg};
      border: none;
      border-radius: 8px;
      outline: none;
      box-sizing: border-box;
    }
    .panel-content .inp:focus {
      box-shadow: 0 0 0 2px rgba(0,122,255,0.2);
    }
    .toolbar-shell{
      width:auto;
      max-width:calc(100vw - 24px);
      min-height:44px;
      padding:6px;
      display:flex;
      align-items:center;
      gap:8px;
      overflow-x:auto;
      overflow-y:hidden;
      scrollbar-width:thin;
    }
    .toolbar-brand{
      flex:0 0 auto;
      padding:0 10px;
      font-size:14px;
      font-weight:700;
      color:${colors.text};
      white-space:nowrap;
    }
    .toolbar-group{
      flex:0 0 auto;
      display:flex;
      align-items:center;
      gap:2px;
      padding:2px;
      border-radius:10px;
      background:rgba(0,0,0,0.03);
    }
    .toolbar-shell .btn,
    .toolbar-shell .btn-pri{
      height:30px;
      white-space:nowrap;
    }
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