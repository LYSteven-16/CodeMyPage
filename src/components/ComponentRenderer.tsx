import React from 'react';
import type { WidgetProps } from '../types';

interface Props {
  component: WidgetProps;
  style: React.CSSProperties;
}

export function ComponentRenderer({ component, style }: Props) {
  switch (component.type) {
    case 'heading':
      return <div style={{ ...style, color: component.color || '#1f2937', fontSize: component.level === 'h1' ? '2.5rem' : '1.5rem', fontWeight: 'bold' }}>{component.text}</div>;
    case 'text':
      return <div style={{ ...style, fontSize: component.fontSize || 16, color: component.color || '#374151', width: '100%', height: '100%' }}>{component.content}</div>;
    case 'image':
      return <img src={component.src} alt={component.alt} draggable={false} style={{ ...style, borderRadius: component.borderRadius, objectFit: 'cover', userSelect: 'none' }} />;
    case 'button':
      return <div style={{ ...style, backgroundColor: component.bgColor, color: component.textColor, borderRadius: component.borderRadius, padding: '12px 24px', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{component.buttonText}</div>;
    case 'card':
      return (
        <div style={{ ...style, backgroundColor: '#fff', borderRadius: component.borderRadius || 12, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {component.imageUrl && <img src={component.imageUrl} alt="" style={{ width: '100%', height: '60%', objectFit: component.imageFit || 'cover' }} />}
          <div style={{ padding: 16, height: '40%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 18, fontWeight: 'bold', color: component.titleColor || '#1f2937', marginBottom: 8 }}>{component.cardTitle || component.title || '卡片标题'}</div>
            <div style={{ fontSize: 14, color: component.descColor || '#6b7280' }}>{component.description || '卡片描述'}</div>
          </div>
        </div>
      );
    case 'accordion':
      return (
        <div style={{ ...style, backgroundColor: '#fff', borderRadius: component.borderRadius || 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          <div style={{ padding: 16, backgroundColor: component.accordionTitleColor || '#f3f4f6', fontWeight: 'bold' }}>{component.accordionTitle || '点击展开'}</div>
          <div style={{ padding: 16, color: component.accordionContentColor || '#374151' }}>{component.accordionContent || '隐藏内容'}</div>
        </div>
      );
    case 'quiz':
      return (
        <div style={{ ...style, backgroundColor: '#fff', borderRadius: component.borderRadius || 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', padding: 16 }}>
          <div style={{ fontWeight: 'bold', color: component.questionColor || '#1f2937', marginBottom: 12 }}>{component.question || '问题'}</div>
          <div style={{ color: component.answerColor || '#059669', backgroundColor: '#d1fae5', padding: 12, borderRadius: 4 }}>{component.answer || '答案'}</div>
        </div>
      );
    case 'choice':
      return (
        <div style={{ ...style, backgroundColor: '#fff', borderRadius: component.borderRadius || 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', padding: 16 }}>
          <div style={{ fontWeight: 'bold', marginBottom: 12, color: component.questionColor || '#1f2937' }}>{component.question || '请选择'}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {(component.options || ['选项A', '选项B', '选项C']).map((opt, i) => (
              <div key={i} style={{ padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: 8, cursor: 'pointer', color: (component as any).optionColor || '#374151' }}>{opt}</div>
            ))}
          </div>
        </div>
      );
    case 'fillBlank':
      return (
        <div style={{ ...style, backgroundColor: '#fff', borderRadius: component.borderRadius || 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', padding: 16 }}>
          <div style={{ fontWeight: 'bold', marginBottom: 12, color: component.questionColor || '#1f2937' }}>填空题</div>
          <input type="text" placeholder="请输入答案" style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, marginBottom: 12, fontSize: 14 }} />
          <button style={{ padding: '10px 20px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>检查答案</button>
        </div>
      );
    case 'trueFalse':
      return (
        <div style={{ ...style, backgroundColor: '#fff', borderRadius: component.borderRadius || 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', padding: 16 }}>
          <div style={{ fontWeight: 'bold', marginBottom: 12, color: component.questionColor || '#1f2937' }}>判断题</div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button style={{ padding: '10px 24px', border: '1px solid #e5e7eb', borderRadius: 8, backgroundColor: '#fff', cursor: 'pointer' }}>√ 正确</button>
            <button style={{ padding: '10px 24px', border: '1px solid #e5e7eb', borderRadius: 8, backgroundColor: '#fff', cursor: 'pointer' }}>× 错误</button>
          </div>
        </div>
      );
    case 'sortable':
      return (
        <div style={{ ...style, backgroundColor: '#fff', borderRadius: component.borderRadius || 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', padding: 16 }}>
          <div style={{ fontWeight: 'bold', marginBottom: 12, color: component.questionColor || '#1f2937' }}>{component.title || '排序题'}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {(component.sortableItems || ['项目1', '项目2', '项目3']).map((item, i) => (
              <div key={i} style={{ padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: 8, cursor: 'grab', display: 'flex', alignItems: 'center', gap: 8, color: (component as any).itemColor || '#374151' }}>☰ {item}</div>
            ))}
          </div>
        </div>
      );
    case 'drawing':
      return (
        <div style={{ ...style, backgroundColor: '#fff', borderRadius: component.borderRadius || 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', gap: 8, padding: 8, backgroundColor: '#f3f4f6', borderBottom: '1px solid #e5e7eb', alignItems: 'center' }}>
            <button style={{ padding: '6px 12px', border: '1px solid #d1d5db', borderRadius: 6, backgroundColor: '#fff', cursor: 'pointer', fontSize: 14 }}>✏️ 画笔</button>
            <button style={{ padding: '6px 12px', border: '1px solid #d1d5db', borderRadius: 6, backgroundColor: '#fff', cursor: 'pointer', fontSize: 14 }}>🧹 橡皮</button>
            <button style={{ padding: '6px 12px', border: '1px solid #d1d5db', borderRadius: 6, backgroundColor: '#fff', cursor: 'pointer', fontSize: 14 }}>🗑️ 清空</button>
          </div>
          <canvas style={{ flex: 1, backgroundColor: '#fafafa' }} />
        </div>
      );
    case 'checklist':
      return (
        <div style={{ ...style, backgroundColor: '#fff', borderRadius: component.borderRadius || 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', padding: 16 }}>
          <div style={{ fontWeight: 'bold', marginBottom: 12, color: component.titleColor || '#1f2937' }}>{component.title || '待办清单'}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {(component.checklistItems || [{id: '1', text: '待办1', checked: false}, {id: '2', text: '待办2', checked: true}]).map((item: any) => (
              <label key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                <input type="checkbox" defaultChecked={item.checked} style={{ width: 18, height: 18 }} />
                <span style={{ textDecoration: item.checked ? 'line-through' : 'none', color: item.checked ? '#9ca3af' : '#374151' }}>{item.text}</span>
              </label>
            ))}
          </div>
        </div>
      );
    case 'tabs':
      return (
        <div style={{ ...style, backgroundColor: '#fff', borderRadius: component.borderRadius || 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb' }}>
            <div style={{ padding: '12px 20px', borderBottom: '2px solid #3b82f6', color: '#3b82f6', fontWeight: 'bold' }}>标签1</div>
            <div style={{ padding: '12px 20px', color: '#6b7280' }}>标签2</div>
          </div>
          <div style={{ padding: 16, color: '#374151' }}>内容1</div>
        </div>
      );
    case 'timeline':
      return (
        <div style={{ ...style, backgroundColor: '#fff', borderRadius: component.borderRadius || 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', padding: 16 }}>
          <div style={{ fontWeight: 'bold', marginBottom: 12, color: component.titleColor || '#1f2937' }}>时间线</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, borderLeft: '2px solid #e5e7eb', paddingLeft: 16 }}>
            <div style={{ position: 'relative' }}><div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#3b82f6', position: 'absolute', left: -21, top: 4 }}></div><div style={{ fontWeight: 'bold', color: '#1f2937' }}>步骤1</div></div>
            <div style={{ position: 'relative' }}><div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#d1d5db', position: 'absolute', left: -21, top: 4 }}></div><div style={{ color: '#6b7280' }}>步骤2</div></div>
          </div>
        </div>
      );
    case 'progress':
      return (
        <div style={{ ...style, backgroundColor: '#fff', borderRadius: component.borderRadius || 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontWeight: 'bold', color: component.titleColor || '#1f2937' }}>{component.title || '进度'}</span>
            <span style={{ color: '#6b7280' }}>{component.progress || 50}%</span>
          </div>
          <div style={{ width: '100%', height: 8, backgroundColor: '#e5e7eb', borderRadius: 4 }}>
            <div style={{ width: `${component.progress || 50}%`, height: '100%', backgroundColor: component.progressColor || '#3b82f6', borderRadius: 4 }}></div>
          </div>
        </div>
      );
    case 'video':
      return <video src={component.src} controls style={{ ...style, backgroundColor: '#000', borderRadius: component.borderRadius || 8, objectFit: 'cover' }} />;
    case 'audio':
      return (
        <div style={{ ...style, backgroundColor: '#fff', borderRadius: component.borderRadius || 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 48, height: 48, borderRadius: 8, backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>🎵</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 'bold', marginBottom: 4, color: '#1f2937' }}>音频标题</div>
              <audio src={component.src} controls style={{ width: '100%' }} />
            </div>
          </div>
        </div>
      );
    case 'quote':
      return (
        <div style={{ ...style, backgroundColor: '#f9fafb', borderLeft: `4px solid ${(component as any).borderColor || '#3b82f6'}`, padding: 16, borderRadius: component.borderRadius || 8 }}>
          <div style={{ fontSize: 16, fontStyle: 'italic', color: '#374151', marginBottom: 8 }}>"{(component as any).quoteText || component.content || '引用内容'}"</div>
          <div style={{ fontSize: 14, color: '#6b7280', textAlign: 'right' }}>— {(component as any).author || '作者'}</div>
        </div>
      );
    case 'code':
      return (
        <div style={{ ...style, backgroundColor: '#1f2937', borderRadius: component.borderRadius || 8, overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', backgroundColor: '#111827', borderBottom: '1px solid #374151' }}>
            <span style={{ color: '#9ca3af', fontSize: 13 }}>代码</span>
            <button style={{ padding: '4px 10px', backgroundColor: '#374151', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>复制</button>
          </div>
          <pre style={{ padding: 16, overflow: 'auto', color: '#e5e7eb', fontSize: 14, fontFamily: 'monospace', margin: 0 }}>{component.code || '// 代码'}</pre>
        </div>
      );
    case 'table':
      return (
        <div style={{ ...style, backgroundColor: '#fff', borderRadius: component.borderRadius || 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr style={{ backgroundColor: '#f9fafb' }}><th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #e5e7eb', fontWeight: 'bold', color: '#1f2937' }}>列1</th><th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #e5e7eb', fontWeight: 'bold', color: '#1f2937' }}>列2</th></tr></thead>
            <tbody>
              <tr><td style={{ padding: 12, borderBottom: '1px solid #e5e7eb', color: '#374151' }}>内容1</td><td style={{ padding: 12, borderBottom: '1px solid #e5e7eb', color: '#374151' }}>内容2</td></tr>
              <tr style={{ backgroundColor: '#f9fafb' }}><td style={{ padding: 12, borderBottom: '1px solid #e5e7eb', color: '#374151' }}>内容3</td><td style={{ padding: 12, borderBottom: '1px solid #e5e7eb', color: '#374151' }}>内容4</td></tr>
            </tbody>
          </table>
        </div>
      );
    case 'tag':
      return (
        <div style={{ ...style, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ padding: '4px 14px', borderRadius: 16, backgroundColor: '#dbeafe', color: '#1e40af', fontSize: 14 }}>标签1</span>
          <span style={{ padding: '4px 14px', borderRadius: 16, backgroundColor: '#d1fae5', color: '#065f46', fontSize: 14 }}>标签2</span>
        </div>
      );
    case 'alert':
      return (
        <div style={{ ...style, padding: 16, borderRadius: component.borderRadius || 8, backgroundColor: component.bgColor || '#dbeafe', borderLeft: `4px solid ${(component as any).borderColor || '#3b82f6'}` }}>
          <div style={{ fontWeight: 'bold', marginBottom: 4, color: component.textColor || '#1e40af' }}>{component.title || '提示'}</div>
          <div style={{ color: component.textColor || '#1e40af', fontSize: 14 }}>{component.content || '内容'}</div>
        </div>
      );
    default:
      return <div style={{ ...style, backgroundColor: '#f3f4f6', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>{component.type}</div>;
  }
}
