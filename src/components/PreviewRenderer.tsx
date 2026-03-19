import React from 'react';
import type { WidgetProps } from '../types';

interface Props {
  component: WidgetProps;
  style: React.CSSProperties;
}

export function PreviewRenderer({ component, style }: Props) {
  switch (component.type) {
    case 'heading':
      return <div style={{ ...style, color: component.color, fontSize: component.level === 'h1' ? '2.5rem' : '1.5rem', fontWeight: 'bold' }}>{component.text}</div>;
    case 'text':
      return <div style={{ ...style, fontSize: component.fontSize || 16, color: component.color || '#374151' }}>{component.content}</div>;
    case 'image':
      return <img src={component.src} alt={component.alt} draggable={false} style={{ ...style, borderRadius: component.borderRadius, objectFit: 'cover', userSelect: 'none' }} />;
    case 'button':
      return <div style={{ ...style, backgroundColor: component.bgColor || '#3b82f6', color: component.textColor || '#fff', borderRadius: component.borderRadius || 8, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px 24px', cursor: component.link ? 'pointer' : 'default' }}>{component.buttonText}</div>;
    case 'card':
      return (
        <div style={{ ...style, backgroundColor: '#fff', borderRadius: component.borderRadius || 12, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {component.imageUrl && <img src={component.imageUrl} alt="" style={{ width: '100%', height: '60%', objectFit: component.imageFit || 'cover' }} />}
          <div style={{ padding: 16, display: 'flex', flexDirection: 'column', flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 'bold', color: component.titleColor || '#1f2937', marginBottom: 8 }}>{component.title}</div>
            <div style={{ fontSize: 14, color: component.descColor || '#6b7280' }}>{component.description}</div>
          </div>
        </div>
      );
    case 'accordion':
      return (
        <div style={{ ...style, backgroundColor: '#fff', borderRadius: component.borderRadius || 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          <div style={{ padding: 16, backgroundColor: component.accordionTitleColor || '#f3f4f6', fontWeight: 'bold' }}>{component.accordionTitle}</div>
          <div style={{ padding: 16, color: component.accordionContentColor || '#374151' }}>{component.accordionContent}</div>
        </div>
      );
    case 'quiz':
      return (
        <div style={{ ...style, backgroundColor: '#fff', borderRadius: component.borderRadius || 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', padding: 16 }}>
          <div style={{ fontWeight: 'bold', color: component.questionColor || '#1f2937', marginBottom: 12 }}>{component.question}</div>
          <div style={{ color: component.answerColor || '#059669', backgroundColor: '#d1fae5', padding: 12, borderRadius: 4 }}>{component.answer}</div>
        </div>
      );
    case 'choice':
      return (
        <div style={{ ...style, backgroundColor: '#fff', borderRadius: component.borderRadius || 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', padding: 16 }}>
          <div style={{ fontWeight: 'bold', marginBottom: 12 }}>{component.question || '请选择'}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {(component.options || ['选项A', '选项B']).map((opt, i) => (
              <div key={i} style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 6, cursor: 'pointer' }}>{opt}</div>
            ))}
          </div>
        </div>
      );
    case 'fillBlank':
      return (
        <div style={{ ...style, backgroundColor: '#fff', borderRadius: component.borderRadius || 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', padding: 16 }}>
          <div style={{ fontWeight: 'bold', marginBottom: 12 }}>填空题</div>
          <input type="text" placeholder="请输入答案" style={{ width: '100%', padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 6, marginBottom: 8 }} />
          <button style={{ padding: '8px 16px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6 }}>检查答案</button>
        </div>
      );
    case 'trueFalse':
      return (
        <div style={{ ...style, backgroundColor: '#fff', borderRadius: component.borderRadius || 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', padding: 16 }}>
          <div style={{ fontWeight: 'bold', marginBottom: 12 }}>判断题</div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button style={{ padding: '8px 24px', border: '1px solid #e5e7eb', borderRadius: 6, backgroundColor: '#fff' }}>√ 正确</button>
            <button style={{ padding: '8px 24px', border: '1px solid #e5e7eb', borderRadius: 6, backgroundColor: '#fff' }}>× 错误</button>
          </div>
        </div>
      );
    case 'sortable':
      return (
        <div style={{ ...style, backgroundColor: '#fff', borderRadius: component.borderRadius || 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', padding: 16 }}>
          <div style={{ fontWeight: 'bold', marginBottom: 12 }}>{component.title || '排序题'}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {((component as any).items || ['项目1', '项目2', '项目3']).map((item: any, i: any) => (
              <div key={i} style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 6, cursor: 'grab' }}>☰ {item}</div>
            ))}
          </div>
        </div>
      );
    case 'drawing':
      return (
        <div style={{ ...style, backgroundColor: '#fff', borderRadius: component.borderRadius || 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', gap: 8, padding: 8, backgroundColor: '#f3f4f6', borderBottom: '1px solid #e5e7eb', alignItems: 'center' }}>
            <button style={{ padding: '4px 8px', border: '1px solid #d1d5db', borderRadius: 4, backgroundColor: '#fff' }}>✏️ 画笔</button>
            <button style={{ padding: '4px 8px', border: '1px solid #d1d5db', borderRadius: 4, backgroundColor: '#fff' }}>🧹 橡皮</button>
            <button style={{ padding: '4px 8px', border: '1px solid #d1d5db', borderRadius: 4, backgroundColor: '#fff' }}>🗑️ 清空</button>
          </div>
          <canvas style={{ flex: 1, backgroundColor: '#fafafa' }} />
        </div>
      );
    case 'checklist':
      return (
        <div style={{ ...style, backgroundColor: '#fff', borderRadius: component.borderRadius || 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', padding: 16 }}>
          <div style={{ fontWeight: 'bold', marginBottom: 12 }}>{component.title || '待办清单'}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {(component.checklistItems || [{id: '1', text: '待办1'}, {id: '2', text: '待办2'}]).map((item) => (
              <label key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="checkbox" defaultChecked={item.checked} style={{ width: 18, height: 18 }} />
                <span>{item.text}</span>
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
          <div style={{ padding: 16 }}>内容1</div>
        </div>
      );
    case 'timeline':
      return (
        <div style={{ ...style, backgroundColor: '#fff', borderRadius: component.borderRadius || 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', padding: 16 }}>
          <div style={{ fontWeight: 'bold', marginBottom: 12 }}>时间线</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, borderLeft: '2px solid #e5e7eb', paddingLeft: 16 }}>
            <div style={{ position: 'relative' }}><div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#3b82f6', position: 'absolute', left: -21, top: 4 }}></div><div style={{ fontWeight: 'bold' }}>步骤1</div></div>
            <div style={{ position: 'relative' }}><div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#d1d5db', position: 'absolute', left: -21, top: 4 }}></div><div>步骤2</div></div>
          </div>
        </div>
      );
    case 'progress':
      return (
        <div style={{ ...style, backgroundColor: '#fff', borderRadius: component.borderRadius || 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span style={{ fontWeight: 'bold' }}>{component.title || '进度'}</span><span style={{ color: '#6b7280' }}>{component.progress || 50}%</span></div>
          <div style={{ width: '100%', height: 8, backgroundColor: '#e5e7eb', borderRadius: 4 }}><div style={{ width: `${component.progress || 50}%`, height: '100%', backgroundColor: component.progressColor || '#3b82f6', borderRadius: 4 }}></div></div>
        </div>
      );
    case 'video':
      return <video src={component.src} controls style={{ ...style, backgroundColor: '#000', borderRadius: component.borderRadius || 8, objectFit: 'cover' }} />;
    case 'audio':
      return (
        <div style={{ ...style, backgroundColor: '#fff', borderRadius: component.borderRadius || 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 48, height: 48, borderRadius: 8, backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🎵</div>
            <div style={{ flex: 1 }}><div style={{ fontWeight: 'bold', marginBottom: 4 }}>音频标题</div><audio src={component.src} controls style={{ width: '100%' }} /></div>
          </div>
        </div>
      );
    case 'quote':
      return (
        <div style={{ ...style, backgroundColor: '#f9fafb', borderLeft: `4px solid ${(component as any).borderColor || '#3b82f6'}`, padding: 16, borderRadius: component.borderRadius || 8 }}>
          <div style={{ fontSize: 16, fontStyle: 'italic', color: '#374151', marginBottom: 8 }}>"{component.content || '引用内容'}"</div>
          <div style={{ fontSize: 14, color: '#6b7280', textAlign: 'right' }}>— {(component as any).author || '作者'}</div>
        </div>
      );
    case 'code':
      return (
        <div style={{ ...style, backgroundColor: '#1f2937', borderRadius: component.borderRadius || 8, overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', backgroundColor: '#111827', borderBottom: '1px solid #374151' }}>
            <span style={{ color: '#9ca3af', fontSize: 12 }}>代码</span>
            <button style={{ padding: '4px 8px', backgroundColor: '#374151', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>复制</button>
          </div>
          <pre style={{ padding: 16, overflow: 'auto', color: '#e5e7eb', fontSize: 14, fontFamily: 'monospace', margin: 0 }}>{component.code || '// 代码'}</pre>
        </div>
      );
    case 'table':
      return (
        <div style={{ ...style, backgroundColor: '#fff', borderRadius: component.borderRadius || 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr style={{ backgroundColor: '#f9fafb' }}><th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #e5e7eb', fontWeight: 'bold' }}>列1</th><th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #e5e7eb', fontWeight: 'bold' }}>列2</th></tr></thead>
            <tbody>
              <tr><td style={{ padding: 12, borderBottom: '1px solid #e5e7eb' }}>内容1</td><td style={{ padding: 12, borderBottom: '1px solid #e5e7eb' }}>内容2</td></tr>
              <tr style={{ backgroundColor: '#f9fafb' }}><td style={{ padding: 12, borderBottom: '1px solid #e5e7eb' }}>内容3</td><td style={{ padding: 12, borderBottom: '1px solid #e5e7eb' }}>内容4</td></tr>
            </tbody>
          </table>
        </div>
      );
    case 'tag':
      return (
        <div style={{ ...style, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ padding: '4px 12px', borderRadius: 16, backgroundColor: '#dbeafe', color: '#1e40af', fontSize: 14 }}>标签1</span>
          <span style={{ padding: '4px 12px', borderRadius: 16, backgroundColor: '#d1fae5', color: '#065f46', fontSize: 14 }}>标签2</span>
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
      return <div style={{ ...style, backgroundColor: '#f3f4f6', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{component.type}</div>;
  }
}
