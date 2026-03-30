// ==================== 测试组件：静态占位 ====================
// 这是一个简单的静态组件，用于测试拖拽、选择、吸附功能

export interface ComponentInstance {
  id: string
  type: string
  x: number
  y: number
  width: number
  height: number
  selected: boolean
  props: ComponentProps
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
}

// 测试组件定义
export const testComponentDef = {
  type: 'test-box',
  name: '测试方块',
  icon: '📦',
  defaultWidth: 150,
  defaultHeight: 100,
  defaultProps: {
    backgroundColor: '#ffffff',
    borderColor: '#e5e5e5',
    borderWidth: 1,
    borderRadius: 8,
    shadowEnabled: false,
    shadowBlur: 10,
    shadowSpread: 0,
    shadowColor: 'rgba(0,0,0,0.1)',
    text: '测试组件',
    fontSize: 14,
    textColor: '#1d1d1f'
  } as ComponentProps
}

// 渲染测试组件
export function renderTestComponent(instance: ComponentInstance): string {
  const props = instance.props
  const boxShadow = props.shadowEnabled 
    ? `0 2px ${props.shadowBlur}px ${props.shadowSpread}px ${props.shadowColor}`
    : 'none'
  
  return `
    <div 
      class="canvas-component"
      data-id="${instance.id}"
      style="
        position: absolute;
        left: ${instance.x}px;
        top: ${instance.y}px;
        width: ${instance.width}px;
        height: ${instance.height}px;
        background: ${props.backgroundColor};
        border: ${props.borderWidth}px solid ${props.borderColor};
        border-radius: ${props.borderRadius}px;
        box-shadow: ${boxShadow};
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: ${props.fontSize}px;
        color: ${props.textColor};
        user-select: none;
        cursor: move;
        transition: box-shadow 0.2s, border-color 0.2s;
      "
    >
      ${props.text || '测试组件'}
    </div>
  `
}