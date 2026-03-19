// 组件类型定义
export type WidgetType = 
  | 'text'
  | 'heading'
  | 'image'
  | 'button'
  | 'card'
  | 'container'
  | 'accordion'
  | 'quiz';

// 组件属性
export interface WidgetProps {
  // 通用
  id: string;
  type: WidgetType;
  order: number;
  
  // 位置（自由拖拽）
  x?: number;
  y?: number;
  
  // 容器子组件
  children?: WidgetProps[];
  
  // 大小
  width?: number;
  height?: number;
  
  // 文字通用
  color?: string;
  
  // 文本
  content?: string;
  fontSize?: number;
  
  // 标题
  level?: 'h1' | 'h2' | 'h3';
  text?: string;
  
  // 图片
  src?: string;
  alt?: string;
  borderRadius?: number;
  
  // 按钮
  buttonText?: string;
  link?: string;
  bgColor?: string;
  textColor?: string;
  openNewTab?: boolean;
  
  // 卡片
  title?: string;
  titleColor?: string;
  description?: string;
  descColor?: string;
  imageUrl?: string;
  imageFit?: 'cover' | 'contain' | 'fill';
  
  // 容器
  backgroundColor?: string;
  padding?: number;
  containerContent?: string;
  
  // 折叠面板
  accordionTitle?: string;
  accordionTitleColor?: string;
  accordionContent?: string;
  accordionContentColor?: string;
  
  // 问答
  question?: string;
  questionColor?: string;
  answer?: string;
  answerColor?: string;
}

// 编辑器状态
export interface EditorState {
  components: WidgetProps[];
  selectedId: string | null;
}

// 组件面板项
export interface ComponentPanelItem {
  type: WidgetType;
  label: string;
  icon: string;
  defaultProps: Partial<WidgetProps>;
}
