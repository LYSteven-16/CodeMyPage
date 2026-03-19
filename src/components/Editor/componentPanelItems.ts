import type { ComponentPanelItem } from '../../types';

export const componentPanelItems: ComponentPanelItem[] = [
  {
    type: 'heading',
    label: '标题',
    icon: 'Heading',
    defaultProps: { level: 'h1', text: '标题文字', height: 60 }
  },
  {
    type: 'text',
    label: '文本',
    icon: 'Type',
    defaultProps: { content: '这是段落文字，可以修改内容。', fontSize: 16, color: '#333333', height: 80 }
  },
  {
    type: 'image',
    label: '图片',
    icon: 'Image',
    defaultProps: { src: 'https://picsum.photos/400/300', alt: '图片', width: 400, height: 300, borderRadius: 8 }
  },
  {
    type: 'button',
    label: '按钮',
    icon: 'Square',
    defaultProps: { buttonText: '点击这里', link: '#', bgColor: '#3b82f6', textColor: '#ffffff', borderRadius: 8, height: 48 }
  },
  {
    type: 'container',
    label: '容器',
    icon: 'Square',
    defaultProps: { width: 300, height: 200 }
  },
  {
    type: 'card',
    label: '卡片',
    icon: 'CreditCard',
    defaultProps: { 
      title: '卡片标题', 
      description: '这里是卡片的描述内容，可以放入学习要点或知识点。',
      imageUrl: 'https://picsum.photos/300/200',
      borderRadius: 12,
      height: 250
    }
  },
  {
    type: 'accordion',
    label: '折叠面板',
    icon: 'ChevronDown',
    defaultProps: { accordionTitle: '点击展开', accordionContent: '这里是隐藏的内容。', height: 100 }
  },
  {
    type: 'quiz',
    label: '问答',
    icon: 'HelpCircle',
    defaultProps: { question: '问题：这是什么？', answer: '答案是：...', height: 120 }
  }
];
