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
  videoUrl?: string
  autoplay?: boolean
  loop?: boolean
  muted?: boolean
  controls?: boolean
  strokeColor?: string
  strokeWidth?: number
  blackboardStyle?: boolean
  showToolbar?: boolean
  resizable?: boolean
  opacity?: number
  audioUrl?: string
  imageUrl?: string
  imageAlt?: string
  imageFitMode?: 'scroll' | 'crop' | 'stretch'
  code?: string
  codeLanguage?: string
  codeBackgroundColor?: string
  icon?: string
  iconSvg?: string
  iconSize?: number
  iconColor?: string
  checkboxChecked?: boolean
  checkboxLabel?: string
  checkboxSize?: number
  checkboxColor?: string
  inputValue?: string
  inputPlaceholder?: string
  inputSize?: number
  inputColor?: string
  inputWidth?: number
  inputHeight?: number
  selectValue?: string
  selectOptions?: { label: string; value: string }[]
  textareaValue?: string
  textareaPlaceholder?: string
  textareaSize?: number
  textareaColor?: string
  textareaRows?: number
  editableText?: string
  editableTextSize?: number
  editableTextColor?: string
  editableTextEditable?: boolean
  flexDirection?: 'row' | 'column'
  flexGap?: number
  flexAlign?: 'start' | 'center' | 'end' | 'stretch'
  flexJustify?: 'start' | 'center' | 'end' | 'space-between' | 'space-around'
  flexWrap?: boolean
  scrollDirection?: 'vertical' | 'horizontal' | 'both'
  collapseExpandedValue?: number
  collapseCollapsedValue?: number
  opacityValue?: number
  opacityDefaultValue?: number
  opacityDuration?: number
  scaleValue?: number
  scaleDefaultValue?: number
  scaleDuration?: number
  rotateValue?: number
  rotateDefaultValue?: number
  rotateDuration?: number
  widthCollapsedValue?: number
  widthTrigger?: 'hover' | 'click' | 'doubleclick'
  widthDuration?: number
  heightCollapsedValue?: number
  heightTrigger?: 'hover' | 'click' | 'doubleclick'
  heightDuration?: number
}

export interface ComponentInstance {
  id: string
  type: string
  x: number
  y: number
  width: number
  height: number
  zIndex: number
  selected: boolean
  props: ComponentProps
  moleculeData?: any
}

export interface PropertiesPanelControl {
  id: string
  domId?: string
  type: 'text' | 'number' | 'range' | 'color' | 'checkbox'
  label: string
  placeholder?: string
  default?: any
  min?: number
  max?: number
  layout?: 'half' | 'full'
  showValue?: boolean
  valueSuffix?: string
  showTextInput?: boolean
  compact?: boolean
  smallLabel?: boolean
  sectionHeader?: boolean
}

export interface PropertiesPanelSection {
  id: string
  controls: PropertiesPanelControl[]
}

export interface PropertiesPanel {
  sections: PropertiesPanelSection[]
}

export interface ComponentDefinition {
  type: string
  name: string
  icon: string
  defaultWidth: number
  defaultHeight: number
  propertiesPanel?: PropertiesPanel
  molecule: any
}
