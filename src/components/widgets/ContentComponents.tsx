import React from 'react';
import type { WidgetProps } from '../../types';

export const TabsRenderer: React.FC<{ component: WidgetProps; style: React.CSSProperties }> = ({ component, style }) => {
  const [activeTab, setActiveTab] = React.useState((component as any).activeTab || '1');
  const tabs = (component as any).tabs || [
    { id: '1', label: '标签 1', content: '内容 1' },
    { id: '2', label: '标签 2', content: '内容 2' }
  ];
  const currentTab = tabs.find((t: any) => t.id === activeTab) || tabs[0];
  
  return (
    <div style={style}>
      <div style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
        backgroundColor: '#fff',
        borderRadius: 8,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb' }}>
          {tabs.map((tab: any) => (
            <div
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '12px 16px',
                borderBottom: tab.id === activeTab ? '2px solid #3b82f6' : '2px solid transparent',
                color: tab.id === activeTab ? '#3b82f6' : '#6b7280',
                cursor: 'pointer',
                fontWeight: tab.id === activeTab ? 'bold' : 'normal',
                transition: 'all 0.2s'
              }}
            >
              {tab.label}
            </div>
          ))}
        </div>
        <div style={{
          padding: 16,
          flex: 1,
          color: '#374151',
          display: 'flex',
          alignItems: 'center'
        }}>
          {currentTab?.content || '标签页内容'}
        </div>
      </div>
    </div>
  );
};

export const TimelineRenderer: React.FC<{ component: WidgetProps; style: React.CSSProperties }> = ({ component, style }) => {
  const steps = (component as any).steps || [
    { id: '1', title: '步骤 1', description: '描述' },
    { id: '2', title: '步骤 2', description: '描述' }
  ];
  
  return (
    <div style={style}>
      <div style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
        backgroundColor: '#fff',
        borderRadius: 8,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        overflow: 'auto'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {steps.map((step: any, i: number) => (
            <div key={step.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                backgroundColor: '#3b82f6',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                flexShrink: 0
              }}>
                {i + 1}
              </div>
              <div>
                <div style={{ fontWeight: 'bold', color: '#1f2937' }}>{step.title}</div>
                {step.description && (
                  <div style={{ fontSize: 12, color: '#6b7280' }}>{step.description}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const ProgressRenderer: React.FC<{ component: WidgetProps; style: React.CSSProperties }> = ({ component, style }) => {
  return (
    <div style={style}>
      <div style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: 8
      }}>
        <div style={{ fontSize: 14, color: '#6b7280', textAlign: 'center' }}>
          {(component as any).progress || 0}%
        </div>
        <div style={{
          width: '100%',
          height: 12,
          backgroundColor: '#e5e7eb',
          borderRadius: 6,
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${(component as any).progress || 0}%`,
            height: '100%',
            backgroundColor: (component as any).progressColor || '#3b82f6',
            borderRadius: 6,
            transition: 'width 0.3s'
          }} />
        </div>
      </div>
    </div>
  );
};

export const VideoRenderer: React.FC<{ component: WidgetProps; style: React.CSSProperties }> = ({ component, style }) => {
  return (
    <div style={style}>
      <video
        src={(component as any).videoUrl}
        poster={(component as any).poster}
        controls
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: '100%',
          height: '100%',
          borderRadius: component.borderRadius || 8,
          objectFit: 'cover'
        }}
      />
    </div>
  );
};

export const AudioRenderer: React.FC<{ component: WidgetProps; style: React.CSSProperties }> = ({ component, style }) => {
  return (
    <div style={style}>
      <div style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
        backgroundColor: '#fff',
        borderRadius: 8,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        padding: 16,
        display: 'flex',
        alignItems: 'center',
        gap: 12
      }}>
        <div style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          backgroundColor: '#3b82f6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          flexShrink: 0,
          fontSize: 20
        }}>
          ▶
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 'bold', marginBottom: 4 }}>音频播放器</div>
          <audio src={component.src} controls style={{ width: '100%' }} />
        </div>
      </div>
    </div>
  );
};

export const QuoteRenderer: React.FC<{ component: WidgetProps; style: React.CSSProperties }> = ({ component, style }) => {
  const borderColor = (component as any).borderColor || '#3b82f6';
  
  return (
    <div style={style}>
      <div style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
        padding: 20,
        borderLeft: `4px solid ${borderColor}`,
        backgroundColor: '#f9fafb',
        borderRadius: 8,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }}>
        {(component as any).quoteIcon && (
          <div style={{ fontSize: 24, color: borderColor, marginBottom: 8 }}>❝</div>
        )}
        <div style={{
          fontSize: 16,
          fontStyle: 'italic',
          color: '#374151',
          marginBottom: 12
        }}>
          "{component.quoteText || '引用内容'}"
        </div>
        {(component as any).quoteAuthor && (
          <div style={{ fontSize: 14, color: '#6b7280', textAlign: 'right' }}>
            — {(component as any).quoteAuthor}
          </div>
        )}
      </div>
    </div>
  );
};

export const CodeRenderer: React.FC<{ component: WidgetProps; style: React.CSSProperties }> = ({ component, style }) => {
  const [copied, setCopied] = React.useState(false);
  
  const copyCode = () => {
    navigator.clipboard.writeText((component as any).code || '// 代码');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <div style={style}>
      <div style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
        backgroundColor: '#1f2937',
        borderRadius: 8,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{
          padding: '8px 12px',
          backgroundColor: '#111827',
          color: '#9ca3af',
          fontSize: 12,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>{(component as any).language || 'javascript'}</span>
          <button
            onClick={copyCode}
            style={{
              padding: '4px 10px',
              backgroundColor: copied ? '#10b981' : '#374151',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              fontSize: 12
            }}
          >
            {copied ? '✓ 已复制' : '📋 复制'}
          </button>
        </div>
        <pre style={{
          padding: 16,
          margin: 0,
          color: '#e5e7eb',
          fontSize: 14,
          fontFamily: 'monospace',
          overflow: 'auto',
          flex: 1
        }}>
          {(component as any).code || '// 代码'}
        </pre>
      </div>
    </div>
  );
};

export const TableRenderer: React.FC<{ component: WidgetProps; style: React.CSSProperties }> = ({ component, style }) => {
  const headers = (component as any).tableHeaders || ['列1', '列2'];
  const data = (component as any).tableData || [
    ['数据1', '数据2'],
    ['数据3', '数据4']
  ];
  const zebra = (component as any).zebraStripe;
  
  return (
    <div style={style}>
      <div style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
        overflow: 'auto',
        backgroundColor: '#fff',
        borderRadius: 8,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ backgroundColor: '#f9fafb' }}>
              {headers.map((h: string, i: number) => (
                <th
                  key={i}
                  style={{
                    padding: 12,
                    textAlign: 'left',
                    borderBottom: '2px solid #e5e7eb',
                    fontWeight: 'bold'
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row: string[], i: number) => (
              <tr key={i} style={{ backgroundColor: zebra && i % 2 === 1 ? '#f9fafb' : '#fff' }}>
                {row.map((cell: string, j: number) => (
                  <td key={j} style={{ padding: 12, borderBottom: '1px solid #e5e7eb' }}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const TagRenderer: React.FC<{ component: WidgetProps; style: React.CSSProperties }> = ({ component, style }) => {
  const tagColors: Record<string, { bg: string; text: string }> = {
    default: { bg: '#f3f4f6', text: '#374151' },
    success: { bg: '#d1fae5', text: '#059669' },
    warning: { bg: '#fef3c7', text: '#d97706' },
    error: { bg: '#fee2e2', text: '#dc2626' },
    info: { bg: '#dbeafe', text: '#2563eb' }
  };
  
  const colors = tagColors[(component as any).tagStyle || 'default'];
  
  return (
    <div style={style}>
      <div style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <span style={{
          padding: '4px 12px',
          backgroundColor: colors.bg,
          color: colors.text,
          borderRadius: 9999,
          fontSize: 14,
          fontWeight: 500
        }}>
          {(component as any).tagText || '标签'}
        </span>
      </div>
    </div>
  );
};

export const AlertRenderer: React.FC<{ component: WidgetProps; style: React.CSSProperties }> = ({ component, style }) => {
  const alertColors: Record<string, { bg: string; border: string; title: string; icon: string }> = {
    success: { bg: '#d1fae5', border: '#10b981', title: '#065f46', icon: '✓' },
    warning: { bg: '#fef3c7', border: '#f59e0b', title: '#92400e', icon: '⚠' },
    error: { bg: '#fee2e2', border: '#ef4444', title: '#991b1b', icon: '✕' },
    info: { bg: '#dbeafe', border: '#3b82f6', title: '#1e40af', icon: 'ℹ' }
  };
  
  const alert = alertColors[(component as any).alertType || 'info'];
  
  return (
    <div style={style}>
      <div style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
        padding: 16,
        backgroundColor: alert.bg,
        borderLeft: `4px solid ${alert.border}`,
        borderRadius: 8,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }}>
        <div style={{
          fontWeight: 'bold',
          color: alert.title,
          marginBottom: 4,
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          <span>{alert.icon}</span>
          {(component as any).alertTitle || '提示'}
        </div>
        <div style={{ color: '#374151', fontSize: 14 }}>
          {(component as any).alertContent || '提示内容'}
        </div>
      </div>
    </div>
  );
};
