import { saveState } from './persistence'
import type { GridSettings, Workspace, PanelPosition, ComponentInstance } from './types'

export const defaultGridSettings: GridSettings = {
  dotSize: 1.5,
  dotColor: '#c7c7cc',
  dotSpacing: 20,
  snapToGrid: true,
  canvasBackground: '#ffffff',
  canvasBorderRadius: 16,
  dotGridBackground: '#f5f5f7',
}

export const defaultWorkspace: Workspace = {
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

export let showGridSettings = false
export let showBgSettings = false
export let showCanvasSettings = false
export let showComponentPanel = false
export let showPropertyEditor = false
export let showAddWorkspaceDialog = false

export function setShowGridSettings(value: boolean) { showGridSettings = value }
export function setShowBgSettings(value: boolean) { showBgSettings = value }
export function setShowCanvasSettings(value: boolean) { showCanvasSettings = value }
export function setShowComponentPanel(value: boolean) { showComponentPanel = value }
export function setShowPropertyEditor(value: boolean) { showPropertyEditor = value }
export function setShowAddWorkspaceDialog(value: boolean) { showAddWorkspaceDialog = value }

export let workspaces: Workspace[] = [defaultWorkspace]
export let currentWorkspaceId = 'workspace-1'

export function setWorkspaces(value: Workspace[]) { 
  workspaces = value
  saveState()
}
export function setCurrentWorkspaceId(value: string) { 
  currentWorkspaceId = value
  saveState()
}

export let gridSettings: GridSettings = defaultGridSettings
export function setGridSettings(value: GridSettings) { 
  gridSettings = value
  saveState()
}

export let components: ComponentInstance[] = []
export let selectedComponentId: string | null = null
export let draggedComponent: ComponentInstance | null = null
export let dragOffset = { x: 0, y: 0 }
export let isDragging = false
export let globalEventsBound = false

export function setComponents(value: ComponentInstance[]) { 
  components = value
  saveState()
}
export function setSelectedComponentId(value: string | null) { selectedComponentId = value }
export function setDraggedComponent(value: ComponentInstance | null) { draggedComponent = value }
export function setDragOffset(value: { x: number; y: number }) { dragOffset = value }
export function setIsDragging(value: boolean) { isDragging = value }
export function setGlobalEventsBound(value: boolean) { globalEventsBound = value }

export let panelPositions: PanelPosition = {}
export function setPanelPositions(value: PanelPosition) { 
  panelPositions = value
  saveState()
}
