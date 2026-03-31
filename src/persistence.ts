import type { GridSettings, Workspace, ComponentInstance } from './types'
import { 
  setGridSettings, 
  setWorkspaces, 
  setCurrentWorkspaceId, 
  setComponents, 
  setPanelPositions,
  defaultGridSettings,
  defaultWorkspace,
  gridSettings as currentGridSettings,
  workspaces as currentWorkspaces,
  components as currentComponents,
  panelPositions as currentPanelPositions
} from './state'

const STORAGE_KEY = 'codemypage-state'
const COOKIE_KEY = 'codemypage'

export interface PersistedState {
  gridSettings: GridSettings
  workspaces: Workspace[]
  currentWorkspaceId: string
  components: ComponentInstance[]
  panelPositions: Record<string, { x: number; y: number }>
}

export function saveState() {
  const state: PersistedState = {
    gridSettings: currentGridSettings,
    workspaces: currentWorkspaces,
    currentWorkspaceId: currentWorkspaces[0]?.id || 'workspace-1',
    components: currentComponents,
    panelPositions: currentPanelPositions
  }
  try {
    const data = JSON.stringify(state)
    localStorage.setItem(STORAGE_KEY, data)
    document.cookie = `${COOKIE_KEY}=${encodeURIComponent(data)};max-age=${365*86400};path=/;SameSite=Lax`
  } catch (e) {
    console.warn('保存状态失败:', e)
  }
}

export function loadState(): PersistedState | null {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (data) {
      return JSON.parse(data)
    }
    const cookies = document.cookie.split(';')
    for (const cookie of cookies) {
      const [key, value] = cookie.trim().split('=')
      if (key === COOKIE_KEY) {
        return JSON.parse(decodeURIComponent(value))
      }
    }
  } catch (e) {
    console.warn('加载状态失败:', e)
  }
  return null
}

export function restoreState() {
  const saved = loadState()
  if (saved) {
    setGridSettings(saved.gridSettings || defaultGridSettings)
    setWorkspaces(saved.workspaces?.length ? saved.workspaces : [defaultWorkspace])
    setCurrentWorkspaceId(saved.currentWorkspaceId || saved.workspaces?.[0]?.id || 'workspace-1')
    setComponents(saved.components || [])
    setPanelPositions(saved.panelPositions || {})
    return true
  }
  return false
}

export function clearState() {
  localStorage.removeItem(STORAGE_KEY)
  document.cookie = `${COOKIE_KEY}=;max-age=0;path=/`
}
