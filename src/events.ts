// ==================== 事件绑定 ====================
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
  draggedComponent,
  dragOffset,
  isDragging,
  globalEventsBound,
  panelPositions,
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
  setSelectedComponentId,
  setDraggedComponent,
  setDragOffset,
  setIsDragging,
  setGlobalEventsBound,
  setPanelPositions
} from './state'
import type { GridSettings, Workspace, PanelPosition } from './types'
import type { ComponentInstance } from './test-component'
import { testComponentDef, renderTestComponent } from './test-component'
import { renderUI } from './app'
import { renderWorkspace } from './workspace'

export function bindEvents() {
  document.getElementById('btn-grid')?.addEventListener('click', (e) => { e.stopPropagation(); setShowGridSettings(!showGridSettings); setShowBgSettings(false); setShowCanvasSettings(false); setShowComponentPanel(false); setShowPropertyEditor(false); setShowAddWorkspaceDialog(false); renderUI() })
  document.getElementById('btn-bg')?.addEventListener('click', (e) => { e.stopPropagation(); setShowBgSettings(!showBgSettings); setShowGridSettings(false); setShowCanvasSettings(false); setShowComponentPanel(false); setShowPropertyEditor(false); setShowAddWorkspaceDialog(false); renderUI() })
  document.getElementById('btn-canvas')?.addEventListener('click', (e) => { e.stopPropagation(); setShowCanvasSettings(!showCanvasSettings); setShowGridSettings(false); setShowBgSettings(false); setShowComponentPanel(false); setShowPropertyEditor(false); setShowAddWorkspaceDialog(false); renderUI() })
  document.getElementById('btn-components')?.addEventListener('click', (e) => { e.stopPropagation(); setShowComponentPanel(!showComponentPanel); setShowGridSettings(false); setShowBgSettings(false); setShowCanvasSettings(false); setShowPropertyEditor(false); setShowAddWorkspaceDialog(false); renderUI() })
  document.getElementById('btn-snap')?.addEventListener('click', () => { setGridSettings({...gridSettings, snapToGrid: !gridSettings.snapToGrid}); renderUI() })
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
  document.getElementById('btn-reset')?.addEventListener('click', () => { if (confirm('确认重置？')) { setComponents([]); renderUI() } })
  document.getElementById('btn-save')?.addEventListener('click', () => {
    const data = JSON.stringify({ gridSettings, workspaces, components })
    document.cookie = `codemypage=${encodeURIComponent(data)};max-age=${30*86400};path=/`
  })

  document.getElementById('snap-toggle')?.addEventListener('change', (e) => { setGridSettings({...gridSettings, snapToGrid: (e.target as HTMLInputElement).checked}); renderUI() })
  document.getElementById('spacing')?.addEventListener('input', (e) => { setGridSettings({...gridSettings, dotSpacing: +(e.target as HTMLInputElement).value}); renderUI() })
  document.getElementById('bg-color')?.addEventListener('input', (e) => { setGridSettings({...gridSettings, dotGridBackground: (e.target as HTMLInputElement).value}); renderUI() })
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
    setShowAddWorkspaceDialog(true); 
    renderUI() 
  })

  // 取消添加画布事件
  document.getElementById('btn-cancel-add-workspace')?.addEventListener('click', () => { 
    setShowAddWorkspaceDialog(false); 
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

    setWorkspaces([...workspaces, newWorkspace])
    setCurrentWorkspaceId(newWorkspace.id)
    setShowAddWorkspaceDialog(false)
    renderUI()
  })

  // 点击对话框背景关闭
  document.addEventListener('click', (e) => {
    if (showAddWorkspaceDialog && (e.target as HTMLElement).style.background === 'rgba(0, 0, 0, 0.5)') {
      setShowAddWorkspaceDialog(false)
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
          if (data.gridSettings) setGridSettings({ ...gridSettings, ...data.gridSettings })
          if (data.workspaces) setWorkspaces(data.workspaces)
          if (data.components) setComponents(data.components)
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
      setPanelPositions({...panelPositions, [panelId]: { x: rect.left, y: rect.top }})
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
        setSelectedComponentId(null)
        setShowPropertyEditor(false)
        renderUI()
      }
    })
    setGlobalEventsBound(true)
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
    setComponents(components.filter(c => c.id !== selectedComponentId))
    setSelectedComponentId(null)
    setShowPropertyEditor(false)
    renderUI()
  })
}

export function bindComponentEvents() {
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
      
      setComponents([...components, newComponent])
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
        
        setSelectedComponentId(componentId)
        setCurrentWorkspaceId(workspace.id)  // 确保更新当前 workspace
        setShowPropertyEditor(true)
        setShowGridSettings(false)
        setShowBgSettings(false)
        setShowCanvasSettings(false)
        setShowComponentPanel(false)
        setDraggedComponent(component)
        
        const rect = element.getBoundingClientRect()
        setDragOffset({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        })
        
        element.style.zIndex = '100'
        renderUI()
      })
    })
  })
}

// ==================== 网格吸附拖拽 ====================
function handleDrag(e: MouseEvent) {
  if (!draggedComponent) return
  
  setIsDragging(true)
  
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
  
  setDraggedComponent(null)
  setIsDragging(false)
}