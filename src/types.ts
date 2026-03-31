// ==================== 类型定义 ====================
export interface GridSettings {
  dotSize: number
  dotColor: string
  dotSpacing: number
  snapToGrid: boolean
  canvasBackground: string
  canvasBorderRadius: number
  dotGridBackground: string
}

export interface Workspace {
  id: string
  name: string
  offset: { x: number; y: number }
  width: number
  height: number
  floating?: boolean
  showShadow?: boolean
  showBorder?: boolean
  canvasBackground?: string
  canvasBorderRadius?: number
  shadowBlur?: number
  shadowSpread?: number
  shadowColor?: string
}

export interface PanelPosition {
  [key: string]: { x: number; y: number }
}

export interface ComponentProps {
  backgroundColor?: string
  borderColor?: string
  borderWidth?: number
  borderRadius?: number
  shadowEnabled?: boolean
  shadowBlur?: number
  shadowSpread?: number
  shadowColor?: string
  text?: string
  fontSize?: number
  textColor?: string
  textX?: number
  textY?: number
}

export interface ComponentInstance {
  id: string
  type: string
  x: number
  y: number
  width: number
  height: number
  selected: boolean
  props: ComponentProps
  moleculeData?: any
}
