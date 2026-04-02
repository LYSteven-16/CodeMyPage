import { BeakerManager } from '@component-chemistry/atom-engine'
import { colors } from './constants'
import { 
  gridSettings, 
  workspaces, 
  currentWorkspaceId,
  components,
  selectedComponentId,
  setCurrentWorkspaceId,
  setComponents
} from './state'
import type { Workspace, ComponentInstance } from './types'
import { bindComponentEvents } from './events'
import { getComponentDef } from './component-registry'
import { renderUI } from './app'

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
}

function componentToMolecule(comp: ComponentInstance): any {
  const def = getComponentDef(comp.type)
  if (!def) {
    console.warn(`[Workspace] 未找到组件定义: ${comp.type}`)
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
      if (atom.capability === 'text') {
        if (props.text !== undefined) {
          atom.text = props.text
        }
        if (props.fontSize !== undefined) {
          atom.size = props.fontSize
        }
        if (props.textColor !== undefined) {
          atom.color = hexToRgb(props.textColor)
        }
        if (props.textX !== undefined || props.textY !== undefined) {
          atom.position = atom.position || { x: 20, y: 20 }
          atom.position.x = props.textX ?? atom.position.x
          atom.position.y = props.textY ?? atom.position.y
        }
        atom.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
      }
      
      if (atom.capability === 'background') {
        if (props.backgroundColor !== undefined) {
          atom.color = hexToRgb(props.backgroundColor)
        }
        atom.width = molecule.width
        atom.height = molecule.height
      }
      
      if (atom.capability === 'border') {
        if (props.borderColor !== undefined) {
          atom.color = hexToRgb(props.borderColor)
        }
        if (props.borderWidth !== undefined) {
          atom.borderWidth = props.borderWidth
        }
        atom.width = molecule.width
        atom.height = molecule.height
      }
      
      if (atom.capability === 'shadow') {
        if (props.shadowEnabled !== undefined) {
          atom.visible = props.shadowEnabled
        }
        if (props.shadowBlur !== undefined) {
          atom.shadowBlur = props.shadowBlur
        }
        if (props.shadowSpread !== undefined) {
          atom.shadowWidth = props.shadowSpread
        }
        if (props.shadowColor !== undefined) {
          atom.color = hexToRgb(props.shadowColor)
        }
        atom.width = molecule.width
        atom.height = molecule.height
      }
      
      if (atom.radius !== undefined && props.borderRadius !== undefined) {
        atom.radius = props.borderRadius
      }
      
      if (atom.capability === 'video') {
        if (props.videoUrl !== undefined) {
          atom.src = props.videoUrl
        }
        if (props.autoplay !== undefined) {
          atom.autoplay = props.autoplay
        }
        if (props.loop !== undefined) {
          atom.loop = props.loop
        }
        if (props.muted !== undefined) {
          atom.muted = props.muted
        }
        if (props.controls !== undefined) {
          atom.controls = props.controls
        }
        if (props.borderRadius !== undefined) {
          atom.radius = props.borderRadius
        }
        atom.width = molecule.width
        atom.height = molecule.height
      }
    })
  }
  
  if (props.borderRadius !== undefined) {
    molecule.radius = props.borderRadius
  }
  
  if (props.shadowEnabled !== undefined && molecule.atoms) {
    const shadowAtom = molecule.atoms.find((a: any) => a.capability === 'shadow')
    if (shadowAtom) {
      shadowAtom.visible = props.shadowEnabled
    }
  }
  
  return molecule
}

export function renderWorkspace() {
  document.querySelectorAll('.atom-engine-workplace, .workspace-canvas').forEach(el => el.remove())
  
  workspaces.forEach((workspace, index) => {
    const isNewWorkspace = workspace.offset.x === 0 && workspace.offset.y === 0 && index === workspaces.length - 1
    if (isNewWorkspace) {
      const centerX = Math.max(0, (window.innerWidth - workspace.width) / 2)
      workspace.offset.x = centerX
      workspace.offset.y = 60 + (index * (workspace.height + 20))
    }
  })
  
  workspaces.forEach(workspace => {
    const wsComponents = components.filter(c => c.id.startsWith(workspace.id + '-')).sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
    const molecules = wsComponents.map(c => componentToMolecule(c)).filter(Boolean)
    
    if (molecules.length > 0) {
      const manager = new BeakerManager(molecules, document.body, {
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
      
      console.log('[Workspace] Created BeakerManager with molecules:', molecules.map(m => ({ id: m.id, type: m.type })))
      
      const workplace = manager.getWorkplace()
      workplace.id = workspace.id
      workplace.className = 'workspace atom-engine-workplace'
      workplace.style.zIndex = workspace.floating ? '10' : '1'
      
      console.log(`[Workspace] Workplace element:`, workplace)
      console.log(`[Workspace] Workplace children:`, workplace.children.length)
      Array.from(workplace.children).forEach((child, i) => {
        const htmlChild = child as HTMLElement
        console.log(`[Workspace] Child ${i}:`, htmlChild.tagName, htmlChild.className, htmlChild.id, 'data-id:', htmlChild.dataset?.id)
        
        // 为组件元素设置 data-id 属性
        if (i < molecules.length && molecules[i] && molecules[i].id) {
          const componentId = molecules[i].id
          const component = components.find(c => c.id === componentId)
          htmlChild.dataset.id = componentId
          console.log(`[Workspace] Set data-id="${componentId}" on child ${i}`)
          
          // 如果是选中的组件，应用高亮样式
          if (componentId === selectedComponentId) {
            htmlChild.classList.add('component-selected')
            htmlChild.style.outline = '2px solid #3b82f6'
            htmlChild.style.outlineOffset = '2px'
          }
        }
      })
      
      workplace.addEventListener('dragover', (e) => {
        e.preventDefault()
      })
      
      workplace.addEventListener('drop', (e) => {
        e.preventDefault()
        const event = e as DragEvent
        const type = event.dataTransfer?.getData('component-type')
        if (!type) return
        
        const componentDef = getComponentDef(type)
        if (!componentDef) {
          console.error(`[Workspace] 未找到组件定义: ${type}`)
          return
        }
        
        const rect = workplace.getBoundingClientRect()
        let x = event.clientX - rect.left - componentDef.defaultWidth / 2
        let y = event.clientY - rect.top - componentDef.defaultHeight / 2
        
        if (gridSettings.snapToGrid) {
          x = Math.round(x / gridSettings.dotSpacing) * gridSettings.dotSpacing
          y = Math.round(y / gridSettings.dotSpacing) * gridSettings.dotSpacing
        }
        
        x = Math.max(0, Math.min(x, workspace.width - componentDef.defaultWidth))
        y = Math.max(0, Math.min(y, workspace.height - componentDef.defaultHeight))
        
        const newComponent: ComponentInstance = {
          id: `${workspace.id}-component-${Date.now()}`,
          type: type,
          x,
          y,
          width: componentDef.defaultWidth,
          height: componentDef.defaultHeight,
          zIndex: 0,
          selected: false,
          props: {
            text: componentDef.molecule?.atoms?.find((atom: any) => atom?.capability === 'text')?.text || ''
          }
        }
        
        setComponents([...components, newComponent])
        renderUI()
      })
    } else {
      const emptyWorkspace = document.createElement('div')
      emptyWorkspace.id = workspace.id
      emptyWorkspace.className = 'workspace atom-engine-workplace'
      emptyWorkspace.style.cssText = `
        position: absolute;
        left: ${workspace.offset.x}px;
        top: ${workspace.offset.y}px;
        width: ${workspace.width}px;
        height: ${workspace.height}px;
        background: ${workspace.canvasBackground || gridSettings.canvasBackground || '#ffffff'};
        border-radius: ${workspace.canvasBorderRadius ?? gridSettings.canvasBorderRadius ?? 0}px;
        box-shadow: ${workspace.showShadow !== false ? `0 2px ${workspace.shadowBlur ?? 20}px ${workspace.shadowSpread ?? 0}px ${workspace.shadowColor ?? 'rgba(0,0,0,0.1)'}` : 'none'};
        z-index: ${workspace.floating ? 10 : 1};
        overflow: hidden;
      `
      
      emptyWorkspace.addEventListener('dragover', (e) => {
        e.preventDefault()
      })
      
      emptyWorkspace.addEventListener('drop', (e) => {
        e.preventDefault()
        const event = e as DragEvent
        const type = event.dataTransfer?.getData('component-type')
        if (!type) return
        
        const componentDef = getComponentDef(type)
        if (!componentDef) return
        
        const rect = emptyWorkspace.getBoundingClientRect()
        let x = event.clientX - rect.left - componentDef.defaultWidth / 2
        let y = event.clientY - rect.top - componentDef.defaultHeight / 2
        
        if (gridSettings.snapToGrid) {
          x = Math.round(x / gridSettings.dotSpacing) * gridSettings.dotSpacing
          y = Math.round(y / gridSettings.dotSpacing) * gridSettings.dotSpacing
        }
        
        x = Math.max(0, Math.min(x, workspace.width - componentDef.defaultWidth))
        y = Math.max(0, Math.min(y, workspace.height - componentDef.defaultHeight))
        
        const newComponent: ComponentInstance = {
          id: `${workspace.id}-component-${Date.now()}`,
          type: type,
          x,
          y,
          width: componentDef.defaultWidth,
          height: componentDef.defaultHeight,
          zIndex: 0,
          selected: false,
          props: {
            text: componentDef.molecule?.atoms?.find((atom: any) => atom?.capability === 'text')?.text || ''
          }
        }
        
        setComponents([...components, newComponent])
        renderUI()
      })
      
      document.body.appendChild(emptyWorkspace)
    }
  })
  
  bindComponentEvents()
}
