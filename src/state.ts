// ==================== 全局状态 ====================
import type { GridSettings, Workspace, PanelPosition } from './types'
import type { ComponentInstance } from './test-component'

// 默认网格设置
export const defaultGridSettings: GridSettings = {
  dotSize: 1.5,
  dotColor: '#c7c7cc',
  dotSpacing: 20,
  snapToGrid: true,
  canvasBackground: '#ffffff',
  canvasBorderRadius: 16,
  dotGridBackground: '#f5f5f7',
}

// 默认工作区
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

// UI面板显示状态
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

// 工作区列表
export let workspaces: Workspace[] = [defaultWorkspace]
export let currentWorkspaceId = 'workspace-1'

export function setWorkspaces(value: Workspace[]) { workspaces = value }
export function setCurrentWorkspaceId(value: string) { currentWorkspaceId = value }

// 网格设置
export let gridSettings: GridSettings = defaultGridSettings
export function setGridSettings(value: GridSettings) { gridSettings = value }

// 组件管理
export let components: ComponentInstance[] = []
export let selectedComponentId: string | null = null
export let draggedComponent: ComponentInstance | null = null
export let dragOffset = { x: 0, y: 0 }
export let isDragging = false
export let globalEventsBound = false

export function setComponents(value: ComponentInstance[]) { components = value }
export function setSelectedComponentId(value: string | null) { selectedComponentId = value }
export function setDraggedComponent(value: ComponentInstance | null) { draggedComponent = value }
export function setDragOffset(value: { x: number; y: number }) { dragOffset = value }
export function setIsDragging(value: boolean) { isDragging = value }
export function setGlobalEventsBound(value: boolean) { globalEventsBound = value }

// 面板位置存储
export let panelPositions: PanelPosition = {}
export function setPanelPositions(value: PanelPosition) { panelPositions = value }