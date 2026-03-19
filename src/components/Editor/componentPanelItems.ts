import type { ComponentPanelItem } from '../../types';

export const componentPanelItems: ComponentPanelItem[] = [
  // ===== 基础组件 =====
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
    defaultProps: { buttonText: '点击这里', bgColor: '#3b82f6', textColor: '#ffffff', borderRadius: 8, height: 48 }
  },
  {
    type: 'card',
    label: '卡片',
    icon: 'CreditCard',
    defaultProps: { 
      cardTitle: '卡片标题', 
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
  
  // ===== 输入互动类 =====
  {
    type: 'choice',
    label: '选择题',
    icon: 'CheckCircle',
    defaultProps: { 
      question: '请选择正确答案：', 
      options: ['选项 A', '选项 B', '选项 C', '选项 D'],
      questionType: 'single',
      showFeedback: true,
      height: 200
    }
  },
  {
    type: 'fillBlank',
    label: '填空题',
    icon: 'Input',
    defaultProps: {
      content: '世界上最深的海沟是___，深度约___米。',
      blanks: [
        { id: '1', answer: '马里亚纳海沟', hint: '位于太平洋' },
        { id: '2', answer: '11034', hint: '约 11 公里' }
      ],
      height: 120
    }
  },
  {
    type: 'trueFalse',
    label: '判断题',
    icon: 'ToggleLeft',
    defaultProps: {
      statement: '地球是平的。',
      correctBool: false,
      showFeedback: true,
      height: 80
    }
  },
  {
    type: 'sortable',
    label: '排序题',
    icon: 'ArrowUpDown',
    defaultProps: {
      sortableItems: ['第一步', '第二步', '第三步', '第四步'],
      height: 180
    }
  },
  
  // ===== 动手操作类 =====
  {
    type: 'drawing',
    label: '画板',
    icon: 'PenTool',
    defaultProps: {
      brushColor: '#000000',
      brushSize: 3,
      showToolbar: true,
      width: 600,
      height: 400
    }
  },
  {
    type: 'checklist',
    label: '清单',
    icon: 'ListTodo',
    defaultProps: {
      checklistItems: [
        { id: '1', text: '完成学习目标 1', checked: false },
        { id: '2', text: '完成学习目标 2', checked: false },
        { id: '3', text: '完成学习目标 3', checked: false }
      ],
      height: 150
    }
  },
  
  // ===== 互动内容类 =====
  {
    type: 'tabs',
    label: '标签页',
    icon: 'FolderTabs',
    defaultProps: {
      tabs: [
        { id: '1', label: '知识点 1', content: '这是第一个标签页的内容。' },
        { id: '2', label: '知识点 2', content: '这是第二个标签页的内容。' },
        { id: '3', label: '知识点 3', content: '这是第三个标签页的内容。' }
      ],
      activeTab: '1',
      height: 200
    }
  },
  {
    type: 'timeline',
    label: '时间线',
    icon: 'Clock',
    defaultProps: {
      steps: [
        { id: '1', title: '第一步', description: '了解基本概念' },
        { id: '2', title: '第二步', description: '实践练习' },
        { id: '3', title: '第三步', description: '巩固提高' }
      ],
      currentStep: 1,
      height: 200
    }
  },
  {
    type: 'progress',
    label: '进度条',
    icon: 'BarChart3',
    defaultProps: {
      progress: 65,
      showPercent: true,
      progressColor: '#3b82f6',
      height: 60
    }
  },
  
  // ===== 内容展示类 =====
  {
    type: 'video',
    label: '视频',
    icon: 'Video',
    defaultProps: {
      videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
      poster: 'https://picsum.photos/400/225',
      width: 400,
      height: 225
    }
  },
  {
    type: 'audio',
    label: '音频',
    icon: 'Volume2',
    defaultProps: {
      audioUrl: '',
      height: 80
    }
  },
  {
    type: 'quote',
    label: '引用',
    icon: 'Quote',
    defaultProps: {
      quoteText: '这是一段引用的文字，可以是名言警句或重要知识点。',
      quoteAuthor: '—— 作者',
      quoteIcon: true,
      height: 100
    }
  },
  {
    type: 'code',
    label: '代码',
    icon: 'Code',
    defaultProps: {
      code: 'console.log("Hello, World!");',
      language: 'javascript',
      showCopy: true,
      height: 100
    }
  },
  {
    type: 'table',
    label: '表格',
    icon: 'Table',
    defaultProps: {
      tableHeaders: ['名称', '内容', '备注'],
      tableData: [
        ['项目 1', '数据 A', '说明'],
        ['项目 2', '数据 B', '说明'],
        ['项目 3', '数据 C', '说明']
      ],
      zebraStripe: true,
      height: 150
    }
  },
  {
    type: 'tag',
    label: '标签',
    icon: 'Tag',
    defaultProps: {
      tagText: '重点',
      tagStyle: 'info',
      height: 40
    }
  },
  {
    type: 'alert',
    label: '提示框',
    icon: 'AlertCircle',
    defaultProps: {
      alertType: 'info',
      alertTitle: '提示标题',
      alertContent: '这是一条提示信息。',
      height: 100
    }
  },
  
  // ===== 学习反馈类 =====
  {
    type: 'answerSheet',
    label: '答题卡',
    icon: 'ClipboardCheck',
    defaultProps: {
      totalQuestions: 10,
      answeredQuestions: [1, 2, 3, 5, 7],
      markedQuestions: [4, 8],
      questionStatus: 'all',
      height: 200
    }
  },
  {
    type: 'answerExplanation',
    label: '答案解析',
    icon: 'BookOpen',
    defaultProps: {
      explanationTitle: '答案解析',
      explanationContent: '这是一道关于光合作用的题目。正确答案是B，因为光合作用需要在光照条件下进行...',
      relatedQuestion: '植物进行光合作用的主要器官是什么？',
      difficulty: 'medium',
      showTip: true,
      tipText: '记住：光合作用主要发生在植物的叶片中！',
      height: 180
    }
  },
  {
    type: 'scoreDisplay',
    label: '得分显示',
    icon: 'Trophy',
    defaultProps: {
      score: 85,
      totalScore: 100,
      percentage: true,
      showGrade: true,
      feedbackMessage: '继续保持，下一章节会更难哦！',
      height: 180
    }
  }
];
