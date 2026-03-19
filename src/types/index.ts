// 组件类型定义
export type WidgetType = 
  | 'text'
  | 'heading'
  | 'image'
  | 'button'
  | 'card'
  | 'accordion'
  | 'quiz'
  // 输入互动类
  | 'fillBlank'
  | 'choice'
  | 'trueFalse'
  | 'dragDrop'
  | 'sortable'
  // 动手操作类
  | 'drawing'
  | 'checklist'
  // 互动内容类
  | 'tabs'
  | 'timeline'
  | 'progress'
  // 内容展示类
  | 'video'
  | 'audio'
  | 'quote'
  | 'code'
  | 'table'
  | 'tag'
  | 'alert'
  // 学习反馈类
  | 'answerSheet'
  | 'answerExplanation'
  | 'scoreDisplay';

// 组件属性
export interface WidgetProps {
  // 通用
  id: string;
  type: WidgetType;
  order: number;
  
  // 位置（自由拖拽）
  x?: number;
  y?: number;
  
  // 大小
  width?: number;
  height?: number;
  
  // 文字通用
  color?: string;
  textAlign?: 'left' | 'center' | 'right';
  
  // 文本
  content?: string;
  fontSize?: number;
  lineHeight?: number;
  
  // 标题
  level?: 'h1' | 'h2' | 'h3';
  text?: string;
  showDivider?: boolean;
  
  // 图片
  src?: string;
  alt?: string;
  borderRadius?: number;
  objectFit?: 'cover' | 'contain' | 'fill';
  enableLightbox?: boolean;
  caption?: string;
  link?: string;
  
  // 按钮
  buttonText?: string;
  bgColor?: string;
  textColor?: string;
  buttonStyle?: 'filled' | 'outline' | 'text';
  buttonIcon?: string;
  hoverAnimation?: 'scale' | 'slide' | 'none';
  openNewTab?: boolean;
  
  // 卡片
  cardTitle?: string;
  title?: string;
  titleColor?: string;
  description?: string;
  descColor?: string;
  imageUrl?: string;
  imageFit?: 'cover' | 'contain' | 'fill';
  cardStyle?: 'default' | 'elevated' | 'outlined';
  badge?: string;
  badgeColor?: string;
  
  // 折叠面板
  accordionTitle?: string;
  accordionTitleColor?: string;
  accordionContent?: string;
  accordionContentColor?: string;
  accordionMultiple?: boolean;
  
  // 问答/选择题
  question?: string;
  questionColor?: string;
  options?: string[];
  correctAnswer?: number | number[];
  questionType?: 'single' | 'multiple';
  showFeedback?: boolean;
  answer?: string;
  answerColor?: string;
  
  // 填空题
  blanks?: { id: string; answer: string; hint?: string }[];
  blankColor?: string;
  
  // 判断题
  statement?: string;
  correctBool?: boolean;
  
  // 拖拽填空
  sentence?: string;
  dragItems?: string[];
  
  // 排序题
  sortableItems?: string[];
  
  // 画板
  brushColor?: string;
  brushSize?: number;
  showToolbar?: boolean;
  
  // 清单
  checklistItems?: { id: string; text: string; checked?: boolean }[];
  
  // 标签页
  tabs?: { id: string; label: string; content: string }[];
  activeTab?: string;
  
  // 时间线
  steps?: { id: string; title: string; description?: string; icon?: string }[];
  currentStep?: number;
  
  // 进度条
  progress?: number;
  showPercent?: boolean;
  progressColor?: string;
  
  // 视频
  videoUrl?: string;
  poster?: string;
  autoplay?: boolean;
  
  // 音频
  audioUrl?: string;
  audioCover?: string;
  
  // 引用块
  quoteText?: string;
  quoteAuthor?: string;
  quoteIcon?: boolean;
  
  // 代码块
  code?: string;
  language?: string;
  showCopy?: boolean;
  
  // 表格
  tableData?: string[][];
  tableHeaders?: string[];
  zebraStripe?: boolean;
  
  // 标签
  tagText?: string;
  tagStyle?: 'default' | 'success' | 'warning' | 'error' | 'info';
  
  // 提示框
  alertType?: 'success' | 'warning' | 'error' | 'info';
  alertTitle?: string;
  alertContent?: string;
  
  // 答题卡
  totalQuestions?: number;
  answeredQuestions?: number[];
  markedQuestions?: number[];
  questionStatus?: 'all' | 'answered' | 'unanswered' | 'marked';
  
  // 答案解析
  explanationTitle?: string;
  explanationContent?: string;
  relatedQuestion?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  showTip?: boolean;
  tipText?: string;
  
  // 得分显示
  score?: number;
  totalScore?: number;
  percentage?: boolean;
  feedbackMessage?: string;
  feedbackType?: 'excellent' | 'good' | 'average' | 'needsImprovement';
  showGrade?: boolean;
}

// 组件面板项
export interface ComponentPanelItem {
  type: WidgetType;
  label: string;
  icon: string;
  defaultProps: Partial<WidgetProps>;
}
