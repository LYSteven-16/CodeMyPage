// ==================== 事件绑定 ====================
import { colors } from './constants'
import { generateExportHTML } from './export-utils'
import { 
  gridSettings, 
  workspaces, 
  currentWorkspaceId,
  defaultWorkspace,
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
import type { GridSettings, Workspace, PanelPosition, ComponentInstance } from './types'
import { renderUI } from './app'
import { renderWorkspace } from './workspace'
import { 
  getComponentDef, 
  renderComponentSnapshot, 
  getComponentMenuItems 
} from './component-registry'

let workspaceRenderQueued = false

let draggedPanel: HTMLElement | null = null
let panelDragOffset = { x: 0, y: 0 }

function scheduleWorkspaceRender() {
  if (workspaceRenderQueued) return
  workspaceRenderQueued = true
  requestAnimationFrame(() => {
    workspaceRenderQueued = false
    renderWorkspace()
  })
}

export function bindEvents() {
  document.getElementById('btn-grid')?.addEventListener('click', (e) => { e.stopPropagation(); setShowGridSettings(!showGridSettings); setShowBgSettings(false); setShowCanvasSettings(false); setShowComponentPanel(false); setShowPropertyEditor(false); setShowAddWorkspaceDialog(false); renderUI() })
  document.getElementById('btn-bg')?.addEventListener('click', (e) => { e.stopPropagation(); setShowBgSettings(!showBgSettings); setShowGridSettings(false); setShowCanvasSettings(false); setShowComponentPanel(false); setShowPropertyEditor(false); setShowAddWorkspaceDialog(false); renderUI() })
  document.getElementById('btn-canvas')?.addEventListener('click', (e) => { e.stopPropagation(); setShowCanvasSettings(!showCanvasSettings); setShowGridSettings(false); setShowBgSettings(false); setShowComponentPanel(false); setShowPropertyEditor(false); setShowAddWorkspaceDialog(false); renderUI() })
  document.getElementById('btn-components')?.addEventListener('click', (e) => { e.stopPropagation(); setShowComponentPanel(!showComponentPanel); setShowGridSettings(false); setShowBgSettings(false); setShowCanvasSettings(false); setShowPropertyEditor(false); setShowAddWorkspaceDialog(false); renderUI() })
  document.getElementById('btn-snap')?.addEventListener('click', () => { setGridSettings({...gridSettings, snapToGrid: !gridSettings.snapToGrid}); renderUI() })
  document.getElementById('btn-load')?.addEventListener('click', () => document.getElementById('file-input')?.click())
  document.getElementById('btn-preview')?.addEventListener('click', () => {
    const previewData = {
      components: components.map(comp => ({
        id: comp.id,
        type: comp.type,
        x: comp.x,
        y: comp.y,
        width: comp.width,
        height: comp.height,
        zIndex: comp.zIndex,
        props: comp.props || {}
      })),
      workspaces: workspaces,
      gridSettings
    }
    console.log('[Editor] Preview data:', {
      workspaceCount: workspaces.length,
      workspaces: workspaces.map(w => ({ id: w.id, name: w.name })),
      componentCount: components.length
    })
    localStorage.setItem('codemypage-preview', JSON.stringify(previewData))
    window.open('/CodeMyPage/preview.html', '_blank')
  })

  let exportMenuVisible = false
  let exportMenu: HTMLElement | null = null
  
  function createExportMenu() {
    if (exportMenu) return exportMenu
    exportMenu = document.createElement('div')
    exportMenu.id = 'export-menu'
    exportMenu.style.cssText = 'display:none;position:fixed;background:#fff;border:1px solid #e5e5e5;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,0.12);padding:6px;min-width:180px;z-index:99999;'
    exportMenu.innerHTML = `
      <div data-action="project" style="padding:10px 14px;border-radius:8px;cursor:pointer;font-size:13px;color:#333;">
        📁 导出工程文件
      </div>
      <div data-action="offline" style="padding:10px 14px;border-radius:8px;cursor:pointer;font-size:13px;color:#333;">
        🌐 导出离线HTML
      </div>
      <div data-action="pdf" style="padding:10px 14px;border-radius:8px;cursor:pointer;font-size:13px;color:#333;">
        📄 导出PDF
      </div>
    `
    exportMenu.querySelectorAll('div').forEach(item => {
      item.addEventListener('mouseenter', () => (item.style.background = '#f0f0f5'))
      item.addEventListener('mouseleave', () => (item.style.background = 'transparent'))
      item.addEventListener('click', () => {
        const action = item.getAttribute('data-action')
        if (action === 'project') (window as any).exportProject()
        else if (action === 'offline') (window as any).exportOfflineHTML()
        else if (action === 'pdf') (window as any).exportPDF()
        hideExportMenu()
      })
    })
    document.body.appendChild(exportMenu)
    return exportMenu
  }
  
  function hideExportMenu() {
    exportMenuVisible = false
    if (exportMenu) exportMenu.style.display = 'none'
  }
  
  function showExportMenu() {
    exportMenuVisible = true
    const btn = document.getElementById('btn-export')
    if (!btn || !exportMenu) return
    const rect = btn.getBoundingClientRect()
    exportMenu.style.display = 'block'
    exportMenu.style.top = `${rect.bottom + 4}px`
    exportMenu.style.left = `${rect.right - 180}px`
  }
  
  document.getElementById('btn-export')?.addEventListener('click', (e) => {
    e.stopPropagation()
    createExportMenu()
    if (exportMenuVisible) {
      hideExportMenu()
    } else {
      showExportMenu()
    }
  })
  
  document.addEventListener('click', (e) => {
    if (exportMenuVisible && exportMenu && !exportMenu.contains(e.target as Node) && !(e.target as Element).closest('#btn-export')) {
      hideExportMenu()
    }
  })

  ;(window as any).exportProject = () => {
    const blob = new Blob([JSON.stringify({ gridSettings, workspaces, components }, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'project.json'
    a.click()
  }

  ;(window as any).exportOfflineHTML = async () => {
    const workspace = workspaces.find(ws => ws.id === currentWorkspaceId)
    if (!workspace) return

    const htmlContent = await generateExportHTML({
      workspace,
      components,
      gridSettings
    })
    console.log('[Export] 生成的 HTML 大小:', htmlContent.length, '字节', '(约', Math.round(htmlContent.length / 1024), 'KB)')

    const blob = new Blob([htmlContent], { type: 'text/html' })
    console.log('[Export] Blob 大小:', blob.size, '字节')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'codemypage-export.html'
    a.click()
  }

  ;(window as any).exportPDF = async () => {
    const workspace = workspaces.find(ws => ws.id === currentWorkspaceId)
    if (!workspace) return

    const htmlContent = await generateExportHTML({
      workspace,
      components,
      gridSettings
    })

    const printWindow = window.open('', '_blank')!
    printWindow.document.write(htmlContent)
    printWindow.document.close()
  }
  document.getElementById('btn-reset')?.addEventListener('click', () => { if (confirm('确认重置？')) { setComponents([]); setWorkspaces([{ ...defaultWorkspace }]); setCurrentWorkspaceId('workspace-1'); renderUI() } })
  document.getElementById('btn-save')?.addEventListener('click', () => {
    const data = JSON.stringify({ gridSettings, workspaces, components })
    document.cookie = `codemypage=${encodeURIComponent(data)};max-age=${30*86400};path=/`
  })

  document.getElementById('snap-toggle')?.addEventListener('change', (e) => { setGridSettings({...gridSettings, snapToGrid: (e.target as HTMLInputElement).checked}); renderUI() })
  document.getElementById('spacing')?.addEventListener('input', (e) => {
    const value = +(e.target as HTMLInputElement).value
    setGridSettings({ ...gridSettings, dotSpacing: value })
    const valueLabel = (e.target as HTMLElement).parentElement?.querySelector('span:last-child') as HTMLElement | null
    if (valueLabel) valueLabel.textContent = `${value}px`
    scheduleWorkspaceRender()
  })
  document.getElementById('bg-color')?.addEventListener('input', (e) => { setGridSettings({...gridSettings, dotGridBackground: (e.target as HTMLInputElement).value}); renderUI() })
  document.getElementById('canvas-color')?.addEventListener('input', (e) => { 
    const currentWorkspace = workspaces.find(ws => ws.id === currentWorkspaceId)
    if (currentWorkspace) {
      currentWorkspace.canvasBackground = (e.target as HTMLInputElement).value
      const textInput = document.getElementById('canvas-color-text') as HTMLInputElement
      if (textInput) textInput.value = currentWorkspace.canvasBackground
      renderUI()
    }
  })
  document.getElementById('canvas-color-text')?.addEventListener('change', (e) => {
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
      scheduleWorkspaceRender()
    }
  })
  document.getElementById('shadow-spread')?.addEventListener('input', (e) => {
    const currentWorkspace = workspaces.find(ws => ws.id === currentWorkspaceId)
    if (currentWorkspace) {
      currentWorkspace.shadowSpread = +(e.target as HTMLInputElement).value
      scheduleWorkspaceRender()
    }
  })
  document.getElementById('shadow-color')?.addEventListener('input', (e) => {
    const currentWorkspace = workspaces.find(ws => ws.id === currentWorkspaceId)
    if (currentWorkspace) {
      currentWorkspace.shadowColor = (e.target as HTMLInputElement).value
      const textInput = document.getElementById('shadow-color-text') as HTMLInputElement
      if (textInput) textInput.value = currentWorkspace.shadowColor
      renderUI()
    }
  })
  document.getElementById('shadow-color-text')?.addEventListener('change', (e) => {
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

  // 组件拖拽
  let dragPreview: HTMLElement | null = null
  
  document.querySelectorAll('.component-item').forEach(item => {
    item.addEventListener('dragstart', (e) => {
      const event = e as DragEvent
      const target = event.target as HTMLElement
      const type = target.dataset.type
      if (type) {
        event.dataTransfer?.setData('component-type', type)
        
        // 从组件注册中心获取组件定义
        const componentDef = getComponentDef(type)
        if (componentDef) {
          // 创建拖拽预览
          dragPreview = document.createElement('div')
          dragPreview.style.cssText = `
            position: fixed;
            width: ${componentDef.defaultWidth}px;
            height: ${componentDef.defaultHeight}px;
            background: #ffffff;
            border: 1px solid #e5e5e5;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            color: #1d1d1f;
            pointer-events: none;
            z-index: 1000;
            opacity: 0.8;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            transform: translate(-50%, -50%);
          `
          dragPreview.textContent = componentDef.name
          document.body.appendChild(dragPreview)
        }
        
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
  
  // 全局拖拽事件（只绑定一次）
  if (!globalEventsBound) {
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
      } else {
        console.log(`[Events] Click outside component, clearing selection`)
      }
    })
    setGlobalEventsBound(true)
  }
}

function bindPropertyEditorEvents() {
  const selected = components.find(c => c.id === selectedComponentId)
  if (!selected) return
  
  document.getElementById('prop-width')?.addEventListener('input', (e) => {
    selected.width = Math.max(20, +(e.target as HTMLInputElement).value)
    renderWorkspace()
  })
  
  document.getElementById('prop-height')?.addEventListener('input', (e) => {
    selected.height = Math.max(20, +(e.target as HTMLInputElement).value)
    renderWorkspace()
  })
  
  document.getElementById('prop-text')?.addEventListener('input', (e) => {
    selected.props.text = (e.target as HTMLInputElement).value
    renderWorkspace()
  })
  
  document.getElementById('prop-bg')?.addEventListener('input', (e) => {
    selected.props.backgroundColor = (e.target as HTMLInputElement).value
    const textInput = document.getElementById('prop-bg-text') as HTMLInputElement
    if (textInput) textInput.value = selected.props.backgroundColor
    renderWorkspace()
  })
  
  document.getElementById('prop-bg-text')?.addEventListener('change', (e) => {
    selected.props.backgroundColor = (e.target as HTMLInputElement).value
    renderWorkspace()
  })
  
  document.getElementById('prop-text-color')?.addEventListener('input', (e) => {
    selected.props.textColor = (e.target as HTMLInputElement).value
    const textInput = document.getElementById('prop-text-color-text') as HTMLInputElement
    if (textInput) textInput.value = selected.props.textColor
    renderWorkspace()
  })
  
  document.getElementById('prop-text-color-text')?.addEventListener('change', (e) => {
    selected.props.textColor = (e.target as HTMLInputElement).value
    renderWorkspace()
  })
  
  document.getElementById('prop-font-size')?.addEventListener('input', (e) => {
    selected.props.fontSize = +(e.target as HTMLInputElement).value
    renderWorkspace()
  })
  
  document.getElementById('prop-text-x')?.addEventListener('input', (e) => {
    selected.props.textX = +(e.target as HTMLInputElement).value
    renderWorkspace()
  })
  
  document.getElementById('prop-text-y')?.addEventListener('input', (e) => {
    selected.props.textY = +(e.target as HTMLInputElement).value
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
    renderWorkspace()
  })
  
  document.getElementById('prop-shadow-blur')?.addEventListener('input', (e) => {
    selected.props.shadowBlur = +(e.target as HTMLInputElement).value
    scheduleWorkspaceRender()
  })
  
  document.getElementById('prop-shadow-spread')?.addEventListener('input', (e) => {
    selected.props.shadowSpread = +(e.target as HTMLInputElement).value
    scheduleWorkspaceRender()
  })
  
  document.getElementById('prop-shadow-color')?.addEventListener('input', (e) => {
    selected.props.shadowColor = (e.target as HTMLInputElement).value
    renderWorkspace()
  })
  
  document.getElementById('prop-video-url')?.addEventListener('input', (e) => {
    const url = (e.target as HTMLInputElement).value
    selected.props.videoUrl = url
    
    if (url) {
      const video = document.createElement('video')
      video.src = url
      video.muted = true
      video.preload = 'metadata'
      
      video.onloadedmetadata = () => {
        const aspectRatio = video.videoWidth / video.videoHeight
        if (aspectRatio > 0 && isFinite(aspectRatio)) {
          const baseHeight = 300
          const newWidth = Math.round(baseHeight * aspectRatio)
          selected.width = newWidth
          selected.height = baseHeight
          
          const idx = components.findIndex(c => c.id === selectedComponentId)
          if (idx !== -1) {
            components[idx] = { ...selected }
            setComponents([...components])
          }
        }
        renderWorkspace()
      }
      
      video.onerror = () => {
        console.warn('[Video] 无法加载视频元数据')
        renderWorkspace()
      }
    } else {
      renderWorkspace()
    }
  })
  
  document.getElementById('prop-autoplay')?.addEventListener('change', (e) => {
    selected.props.autoplay = (e.target as HTMLInputElement).checked
    renderWorkspace()
  })
  
  document.getElementById('prop-loop')?.addEventListener('change', (e) => {
    selected.props.loop = (e.target as HTMLInputElement).checked
    renderWorkspace()
  })
  
  document.getElementById('prop-muted')?.addEventListener('change', (e) => {
    selected.props.muted = (e.target as HTMLInputElement).checked
    renderWorkspace()
  })
  
  document.getElementById('prop-controls')?.addEventListener('change', (e) => {
    selected.props.controls = (e.target as HTMLInputElement).checked
    renderWorkspace()
  })
  
  document.getElementById('btn-delete-component')?.addEventListener('click', () => {
    setComponents(components.filter(c => c.id !== selectedComponentId))
    setSelectedComponentId(null)
    setShowPropertyEditor(false)
    renderUI()
  })
  
  document.getElementById('btn-zindex-up')?.addEventListener('click', () => {
    const selected = components.find(c => c.id === selectedComponentId)
    if (!selected) return
    const wsComponents = components.filter(c => c.id.startsWith(selected.id.split('-component-')[0] + '-component-'))
    const maxZ = Math.max(...wsComponents.map(c => c.zIndex || 0))
    const updated = components.map(c => {
      if (c.id === selectedComponentId) {
        return { ...c, zIndex: maxZ + 1 }
      }
      return c
    })
    setComponents(updated)
    renderUI()
  })
  
  document.getElementById('btn-zindex-down')?.addEventListener('click', () => {
    const selected = components.find(c => c.id === selectedComponentId)
    if (!selected) return
    const wsComponents = components.filter(c => c.id.startsWith(selected.id.split('-component-')[0] + '-component-'))
    const minZ = Math.min(...wsComponents.map(c => c.zIndex || 0))
    const updated = components.map(c => {
      if (c.id === selectedComponentId) {
        return { ...c, zIndex: Math.max(0, minZ - 1) }
      }
      return c
    })
    setComponents(updated)
    renderUI()
  })

  document.getElementById('btn-zindex-top')?.addEventListener('click', () => {
    const selected = components.find(c => c.id === selectedComponentId)
    if (!selected) return
    const wsComponents = components.filter(c => c.id.startsWith(selected.id.split('-component-')[0] + '-component-'))
    const maxZ = Math.max(...wsComponents.map(c => c.zIndex || 0))
    const updated = components.map(c => {
      if (c.id === selectedComponentId) {
        return { ...c, zIndex: maxZ + 1 }
      }
      return c
    })
    setComponents(updated)
    renderUI()
  })

  document.getElementById('btn-zindex-bottom')?.addEventListener('click', () => {
    const selected = components.find(c => c.id === selectedComponentId)
    if (!selected) return
    const wsComponents = components.filter(c => c.id.startsWith(selected.id.split('-component-')[0] + '-component-'))
    const minZ = Math.min(...wsComponents.map(c => c.zIndex || 0))
    const updated = components.map(c => {
      if (c.id === selectedComponentId) {
        return { ...c, zIndex: Math.max(0, minZ - 1) }
      }
      return c
    })
    setComponents(updated)
    renderUI()
  })
}

export function bindComponentEvents() {
  console.log('[Events] bindComponentEvents called')
  const workspaces = document.querySelectorAll('.atom-engine-workplace, .workspace')
  console.log(`[Events] Found ${workspaces.length} workspaces`)
  
  workspaces.forEach(workspaceEl => {
    const workspaceId = workspaceEl.id
    console.log(`[Events] Binding events to workspace: ${workspaceId}`)
    
    // 为组件元素绑定 mousedown 事件用于拖拽
    workspaceEl.querySelectorAll('[data-id]').forEach(el => {
      const componentEl = el as HTMLElement
      const componentId = componentEl.dataset.id
      if (!componentId) return
      
      componentEl.addEventListener('mousedown', (e) => {
        const component = components.find(c => c.id === componentId)
        if (!component) return
        
        setSelectedComponentId(componentId)
        setCurrentWorkspaceId(workspaceId)
        setShowPropertyEditor(true)
        setShowGridSettings(false)
        setShowBgSettings(false)
        setShowCanvasSettings(false)
        setShowComponentPanel(false)
        setDraggedComponent(component)
        
        const rect = componentEl.getBoundingClientRect()
        setDragOffset({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        })
        
        console.log(`[Events] Component mousedown: ${componentId}`)
        e.stopPropagation()
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