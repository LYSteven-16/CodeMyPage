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
        <div style={{ ...style, width: '100%', height: '100%', backgroundColor: '#fff', borderRadius: component.borderRadius || 12, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {component.imageUrl && <img src={component.imageUrl} alt="" style={{ width: '100%', height: '60%', objectFit: component.imageFit || 'cover' }} />}
          <div style={{ padding: 16, height: '40%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 18, fontWeight: 'bold', color: component.titleColor || '#1f2937', marginBottom: 8 }}>{component.cardTitle || component.title || '卡片标题'}</div>
            <div style={{ fontSize: 14, color: component.descColor || '#6b7280' }}>{component.description || '卡片描述'}</div>
          </div>
        </div>
      );
    case 'accordion':
      return (
        <div style={{ ...style, width: '100%', height: '100%', backgroundColor: '#fff', borderRadius: component.borderRadius || 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          <div style={{ padding: 16, backgroundColor: component.accordionTitleColor || '#f3f4f6', fontWeight: 'bold' }}>{component.accordionTitle || '点击展开'}</div>
          <div style={{ padding: 16, color: component.accordionContentColor || '#374151' }}>{component.accordionContent || '隐藏内容'}</div>
        </div>
      );
    case 'quiz':
      return (
        <div style={{ ...style, width: '100%', height: '100%', backgroundColor: '#fff', borderRadius: component.borderRadius || 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', padding: 16 }}>
          <div style={{ fontWeight: 'bold', color: component.questionColor || '#1f2937', marginBottom: 12 }}>{component.question || '问题'}</div>
          <div style={{ color: component.answerColor || '#059669', backgroundColor: '#d1fae5', padding: 12, borderRadius: 4 }}>{component.answer || '答案'}</div>
        </div>
      );
    case 'choice':
      return (
        <div style={{ ...style, width: '100%', height: '100%', padding: 16, backgroundColor: '#fff', borderRadius: 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <div style={{ fontWeight: 'bold', marginBottom: 12, color: component.questionColor || '#1f2937' }}>{component.question || '请选择正确答案：'}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {(component.options || ['选项 A', '选项 B', '选项 C', '选项 D']).map((opt: string, i: number) => (
              <div key={i} style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 6, cursor: 'pointer', color: '#374151' }}>○ {opt}</div>
            ))}
          </div>
        </div>
      );
    case 'fillBlank':
      return (
        <div style={{ ...style, width: '100%', height: '100%', padding: 16, backgroundColor: '#fff', borderRadius: 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <div style={{ color: component.color || '#374151' }}>{component.content || '填空题内容'}</div>
          <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {(component.blanks || []).map((blank: any) => (
              <input key={blank.id} placeholder="请填写..." style={{ border: '1px solid #d1d5db', borderRadius: 4, padding: '4px 8px', width: 120 }} />
            ))}
          </div>
        </div>
      );
    case 'trueFalse':
      return (
        <div style={{ ...style, width: '100%', height: '100%', padding: 16, backgroundColor: '#fff', borderRadius: 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <div style={{ marginBottom: 12, color: component.color || '#1f2937' }}>{component.statement || '请判断对错：'}</div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button style={{ padding: '8px 24px', border: '2px solid #10b981', borderRadius: 6, backgroundColor: '#fff', color: '#10b981', cursor: 'pointer' }}>√ 正确</button>
            <button style={{ padding: '8px 24px', border: '2px solid #ef4444', borderRadius: 6, backgroundColor: '#fff', color: '#ef4444', cursor: 'pointer' }}>× 错误</button>
          </div>
        </div>
      );
    case 'sortable':
      return (
        <div style={{ ...style, width: '100%', height: '100%', padding: 16, backgroundColor: '#fff', borderRadius: 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <div style={{ fontWeight: 'bold', marginBottom: 12 }}>请按正确顺序排列：</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {(component.sortableItems || ['项目 1', '项目 2', '项目 3', '项目 4']).map((item: any, i: number) => (
              <div key={i} style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 6, backgroundColor: '#f9fafb', cursor: 'move', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: '#9ca3af' }}>⋮⋮</span> {item}
              </div>
            ))}
          </div>
        </div>
      );
    case 'drawing':
      return (
        <div style={{ ...style, width: '100%', height: '100%', backgroundColor: '#fff', borderRadius: 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}>
          {component.showToolbar && (
            <div style={{ padding: 8, borderBottom: '1px solid #e5e7eb', display: 'flex', gap: 8, alignItems: 'center' }}>
              <input type="color" value={component.brushColor || '#000000'} style={{ width: 28, height: 28, border: 'none', cursor: 'pointer' }} />
              <input type="range" min="1" max="20" defaultValue={component.brushSize || 3} style={{ width: 80 }} />
              <button style={{ padding: '4px 8px', fontSize: 12, border: '1px solid #d1d5db', borderRadius: 4, backgroundColor: '#fff' }}>橡皮擦</button>
              <button style={{ padding: '4px 8px', fontSize: 12, border: '1px solid #d1d5db', borderRadius: 4, backgroundColor: '#fff' }}>清空</button>
            </div>
          )}
          <div style={{ flex: 1, backgroundColor: '#ffffff', cursor: 'crosshair', position: 'relative' }}>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d1d5db', fontSize: 14 }}>点击并拖动绘画</div>
          </div>
        </div>
      );
    case 'checklist':
      return (
        <div style={{ ...style, width: '100%', height: '100%', padding: 16, backgroundColor: '#fff', borderRadius: 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          {(component.checklistItems || [{ id: '1', text: '待办事项 1' }, { id: '2', text: '待办事项 2' }]).map((item: any) => (
            <label key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', cursor: 'pointer' }}>
              <input type="checkbox" defaultChecked={item.checked} style={{ width: 18, height: 18 }} />
              <span style={{ color: item.checked ? '#9ca3af' : '#374151', textDecoration: item.checked ? 'line-through' : 'none' }}>{item.text}</span>
            </label>
          ))}
        </div>
      );
    case 'tabs':
      return (
        <div style={{ ...style, width: '100%', height: '100%', backgroundColor: '#fff', borderRadius: 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb' }}>
            {(component.tabs || [{ id: '1', label: '标签 1', content: '内容 1' }]).map((tab: any) => (
              <div key={tab.id} style={{ padding: '12px 16px', borderBottom: tab.id === component.activeTab ? '2px solid #3b82f6' : 'none', color: tab.id === component.activeTab ? '#3b82f6' : '#6b7280', cursor: 'pointer', fontWeight: tab.id === component.activeTab ? 'bold' : 'normal' }}>{tab.label}</div>
            ))}
          </div>
          <div style={{ padding: 16, flex: 1, color: '#374151' }}>
            {(component.tabs || []).find((t: any) => t.id === component.activeTab)?.content || '标签页内容'}
          </div>
        </div>
      );
    case 'timeline':
      return (
        <div style={{ ...style, width: '100%', height: '100%', padding: 16, backgroundColor: '#fff', borderRadius: 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {(component.steps || [{ id: '1', title: '步骤 1', description: '描述' }]).map((step: any, i: number) => (
              <div key={step.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', backgroundColor: i < (component.currentStep || 1) ? '#3b82f6' : '#e5e7eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0 }}>{i + 1}</div>
                <div>
                  <div style={{ fontWeight: 'bold', color: i < (component.currentStep || 1) ? '#1f2937' : '#9ca3af' }}>{step.title}</div>
                  {step.description && <div style={{ fontSize: 12, color: '#6b7280' }}>{step.description}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    case 'progress':
      return (
        <div style={{ ...style, width: '100%', height: '100%', padding: 16, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 8 }}>
          {component.showPercent && <div style={{ fontSize: 14, color: '#6b7280', textAlign: 'center' }}>{component.progress || 0}%</div>}
          <div style={{ width: '100%', height: 12, backgroundColor: '#e5e7eb', borderRadius: 6, overflow: 'hidden' }}>
            <div style={{ width: `${component.progress || 0}%`, height: '100%', backgroundColor: component.progressColor || '#3b82f6', borderRadius: 6, transition: 'width 0.3s' }} />
          </div>
        </div>
      );
    case 'video':
      return (
        <video 
          src={component.videoUrl} 
          poster={component.poster} 
          controls 
          style={{ ...style, width: '100%', height: '100%', borderRadius: component.borderRadius || 8, objectFit: 'cover' }} 
        />
      );
    case 'audio':
      return (
        <div style={{ ...style, width: '100%', height: '100%', padding: 16, backgroundColor: '#fff', borderRadius: 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>▶</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 'bold', marginBottom: 4 }}>音频播放器</div>
            <div style={{ height: 4, backgroundColor: '#e5e7eb', borderRadius: 2 }}>
              <div style={{ width: '30%', height: '100%', backgroundColor: '#3b82f6', borderRadius: 2 }} />
            </div>
          </div>
        </div>
      );
    case 'quote':
      return (
        <div style={{ ...style, width: '100%', height: '100%', padding: 20, borderLeft: '4px solid #3b82f6', backgroundColor: '#f9fafb', borderRadius: 8 }}>
          {component.quoteIcon && <div style={{ fontSize: 24, color: '#3b82f6', marginBottom: 8 }}>❝</div>}
          <div style={{ fontSize: 16, fontStyle: 'italic', color: '#374151', marginBottom: 12 }}>"{component.quoteText || '引用内容'}"</div>
          {component.quoteAuthor && <div style={{ fontSize: 14, color: '#6b7280', textAlign: 'right' }}>{component.quoteAuthor}</div>}
        </div>
      );
    case 'code':
      return (
        <div style={{ ...style, width: '100%', height: '100%', backgroundColor: '#1f2937', borderRadius: 8, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '8px 12px', backgroundColor: '#111827', color: '#9ca3af', fontSize: 12, display: 'flex', justifyContent: 'space-between' }}>
            <span>{component.language || 'javascript'}</span>
            {component.showCopy && <span style={{ cursor: 'pointer' }}>📋 复制</span>}
          </div>
          <pre style={{ padding: 16, margin: 0, color: '#e5e7eb', fontSize: 14, fontFamily: 'monospace', overflow: 'auto', flex: 1 }}>{component.code || '// 代码内容'}</pre>
        </div>
      );
    case 'table':
      return (
        <div style={{ ...style, width: '100%', height: '100%', overflow: 'auto', backgroundColor: '#fff', borderRadius: 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb' }}>
                {(component.tableHeaders || ['列1', '列2']).map((h: string, i: number) => <th key={i} style={{ padding: 12, textAlign: 'left', borderBottom: '2px solid #e5e7eb', fontWeight: 'bold' }}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {(component.tableData || [['数据1', '数据2']]).map((row: string[], i: number) => (
                <tr key={i} style={{ backgroundColor: component.zebraStripe && i % 2 === 1 ? '#f9fafb' : '#fff' }}>
                  {row.map((cell: string, j: number) => <td key={j} style={{ padding: 12, borderBottom: '1px solid #e5e7eb' }}>{cell}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case 'tag': {
      const tagColors: Record<string, { bg: string; text: string }> = {
        default: { bg: '#f3f4f6', text: '#374151' },
        success: { bg: '#d1fae5', text: '#059669' },
        warning: { bg: '#fef3c7', text: '#d97706' },
        error: { bg: '#fee2e2', text: '#dc2626' },
        info: { bg: '#dbeafe', text: '#2563eb' }
      };
      const colors = tagColors[component.tagStyle || 'default'];
      return (
        <div style={{ ...style, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <span style={{ padding: '4px 12px', backgroundColor: colors.bg, color: colors.text, borderRadius: 9999, fontSize: 14, fontWeight: 500 }}>{component.tagText || '标签'}</span>
        </div>
      );
    }
    case 'alert': {
      const alertColors: Record<string, { bg: string; border: string; title: string; icon: string }> = {
        success: { bg: '#d1fae5', border: '#10b981', title: '#065f46', icon: '✓' },
        warning: { bg: '#fef3c7', border: '#f59e0b', title: '#92400e', icon: '⚠' },
        error: { bg: '#fee2e2', border: '#ef4444', title: '#991b1b', icon: '✕' },
        info: { bg: '#dbeafe', border: '#3b82f6', title: '#1e40af', icon: 'ℹ' }
      };
      const alert = alertColors[component.alertType || 'info'];
      return (
        <div style={{ ...style, width: '100%', height: '100%', padding: 16, backgroundColor: alert.bg, borderLeft: `4px solid ${alert.border}`, borderRadius: 8 }}>
          <div style={{ fontWeight: 'bold', color: alert.title, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>{alert.icon}</span> {component.alertTitle || '提示'}
          </div>
          <div style={{ color: '#374151', fontSize: 14 }}>{component.alertContent || '提示内容'}</div>
        </div>
      );
    }
    default:
      return <div style={{ ...style, color: '#9ca3af', textAlign: 'center', padding: 20 }}>未知组件</div>;
  }
}
