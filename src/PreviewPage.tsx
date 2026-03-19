import React, { useState, useEffect } from 'react';

const CANVAS_WIDTH = 1000;
const CANVAS_MIN_HEIGHT = 1600;

interface Widget {
  id: string;
  type: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  text?: string;
  content?: string;
  color?: string;
  level?: string;
  src?: string;
  alt?: string;
  imageUrl?: string;
  imageFit?: string;
  borderRadius?: number;
  buttonText?: string;
  bgColor?: string;
  textColor?: string;
  title?: string;
  titleColor?: string;
  description?: string;
  descColor?: string;
  accordionTitle?: string;
  accordionContent?: string;
  question?: string;
  answer?: string;
  options?: string[];
  progress?: number;
  code?: string;
  items?: string[];
  checklistItems?: { id: string; text: string; checked?: boolean }[];
  [key: string]: any;
}

export function PreviewPage() {
  const [components, setComponents] = useState<Widget[]>([]);
  const [bg, setBg] = useState('#f0f0f0');
  const [canvasBg, setCanvasBg] = useState('#ffffff');
  const [canvasRadius, setCanvasRadius] = useState(0);

  useEffect(() => {
    try {
      const c = sessionStorage.getItem('previewComponents');
      const g = sessionStorage.getItem('previewGridSettings');
      if (c) setComponents(JSON.parse(c));
      if (g) {
        const gs = JSON.parse(g);
        setBg(gs.dotGridBackground || '#f0f0f0');
        setCanvasBg(gs.canvasBackground || '#ffffff');
        setCanvasRadius(gs.canvasBorderRadius || 0);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const h = Math.max(CANVAS_MIN_HEIGHT, ...components.map((c: Widget) => (c.y || 0) + (c.height || 200) + 200));

  const render = (comp: Widget) => {
    const s: React.CSSProperties = {
      position: 'absolute',
      left: comp.x || 0,
      top: comp.y || 0,
      width: comp.width || 300,
      height: comp.height || 200
    };
    const base = { ...s, backgroundColor: '#fff', borderRadius: 8, padding: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' };

    switch (comp.type) {
      case 'heading':
        return <div key={comp.id} style={{ ...s, color: comp.color || '#000', fontSize: comp.level === 'h1' ? '2.5rem' : '1.5rem', fontWeight: 'bold' }}>{comp.text}</div>;
      case 'text':
        return <div key={comp.id} style={{ ...s, fontSize: comp.fontSize || 16, color: comp.color || '#374151' }}>{comp.content}</div>;
      case 'image':
        return <img key={comp.id} src={comp.src} alt={comp.alt} style={{ ...s, borderRadius: comp.borderRadius, objectFit: 'cover' }} />;
      case 'button':
        return <div key={comp.id} style={{ ...s, backgroundColor: comp.bgColor || '#3b82f6', color: comp.textColor || '#fff', borderRadius: comp.borderRadius || 8, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 12 }}>{comp.buttonText}</div>;
      case 'card':
        return (
          <div key={comp.id} style={{ ...s, backgroundColor: '#fff', borderRadius: comp.borderRadius || 12, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {comp.imageUrl && <img src={comp.imageUrl} alt="" style={{ width: '100%', height: '60%', objectFit: 'cover' }} />}
            <div style={{ padding: 16 }}><div style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 8 }}>{comp.title}</div><div style={{ fontSize: 14, color: '#6b7280' }}>{comp.description}</div></div>
          </div>
        );
      case 'video':
        return <video key={comp.id} src={comp.src} controls style={{ ...s, backgroundColor: '#000', borderRadius: comp.borderRadius || 8, objectFit: 'cover' }} />;
      case 'audio':
        return <div key={comp.id} style={{ ...base, display: 'flex', alignItems: 'center', gap: 12 }}><div style={{ width: 48, height: 48, borderRadius: 8, backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🎵</div><audio src={comp.src} controls style={{ flex: 1 }} /></div>;
      case 'accordion':
        return <div key={comp.id} style={{ ...base }}><div style={{ fontWeight: 'bold', backgroundColor: '#f3f4f6', padding: 16, borderRadius: 8, marginBottom: -16 }}>{comp.accordionTitle}</div><div style={{ padding: 16 }}>{comp.accordionContent}</div></div>;
      case 'quiz':
        return <div key={comp.id} style={{ ...base }}><div style={{ fontWeight: 'bold', marginBottom: 12 }}>{comp.question}</div><div style={{ color: '#059669', backgroundColor: '#d1fae5', padding: 12, borderRadius: 4 }}>{comp.answer}</div></div>;
      case 'choice':
        return <div key={comp.id} style={{ ...base }}><div style={{ fontWeight: 'bold', marginBottom: 12 }}>{comp.question || '请选择'}</div>{(comp.options || ['选项A', '选项B']).map((o, i) => <div key={i} style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 6, marginBottom: 8 }}>{o}</div>)}</div>;
      case 'fillBlank':
        return <div key={comp.id} style={{ ...base }}><div style={{ fontWeight: 'bold', marginBottom: 12 }}>填空题</div><input type="text" placeholder="请输入答案" style={{ width: '100%', padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 6, marginBottom: 8 }} /><button style={{ padding: '8px 16px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6 }}>检查答案</button></div>;
      case 'trueFalse':
        return <div key={comp.id} style={{ ...base }}><div style={{ fontWeight: 'bold', marginBottom: 12 }}>判断题</div><div style={{ display: 'flex', gap: 12 }}><button style={{ padding: '8px 24px', border: '1px solid #e5e7eb', borderRadius: 6, background: '#fff' }}>√ 正确</button><button style={{ padding: '8px 24px', border: '1px solid #e5e7eb', borderRadius: 6, background: '#fff' }}>× 错误</button></div></div>;
      case 'sortable':
        return <div key={comp.id} style={{ ...base }}><div style={{ fontWeight: 'bold', marginBottom: 12 }}>{comp.title || '排序题'}</div>{(comp.items || ['项目1', '项目2', '项目3']).map((item, i) => <div key={i} style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 6, marginBottom: 8, cursor: 'grab' }}>☰ {item}</div>)}</div>;
      case 'drawing':
        return <div key={comp.id} style={{ ...s, backgroundColor: '#fff', borderRadius: comp.borderRadius || 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}><div style={{ display: 'flex', gap: 8, padding: 8, background: '#f3f4f6', borderBottom: '1px solid #e5e7eb' }}><button style={{ padding: '4px 8px', border: '1px solid #d1d5db', borderRadius: 4, background: '#fff' }}>✏️</button><button style={{ padding: '4px 8px', border: '1px solid #d1d5db', borderRadius: 4, background: '#fff' }}>🧹</button><button style={{ padding: '4px 8px', border: '1px solid #d1d5db', borderRadius: 4, background: '#fff' }}>🗑️</button></div><canvas style={{ flex: 1, background: '#fafafa' }} /></div>;
      case 'checklist':
        return <div key={comp.id} style={{ ...base }}><div style={{ fontWeight: 'bold', marginBottom: 12 }}>{comp.title || '待办清单'}</div>{(comp.checklistItems || [{id: '1', text: '待办1'}, {id: '2', text: '待办2'}]).map((item) => <label key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}><input type="checkbox" defaultChecked={item.checked} /><span>{item.text}</span></label>)}</div>;
      case 'tabs':
        return <div key={comp.id} style={{ ...base, padding: 0, overflow: 'hidden' }}><div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb' }}><div style={{ padding: '12px 20px', borderBottom: '2px solid #3b82f6', color: '#3b82f6', fontWeight: 'bold' }}>标签1</div><div style={{ padding: '12px 20px', color: '#6b7280' }}>标签2</div></div><div style={{ padding: 16 }}>内容1</div></div>;
      case 'timeline':
        return <div key={comp.id} style={{ ...base }}><div style={{ fontWeight: 'bold', marginBottom: 12 }}>时间线</div><div style={{ display: 'flex', flexDirection: 'column', gap: 12, borderLeft: '2px solid #e5e7eb', paddingLeft: 16 }}><div style={{ position: 'relative' }}><div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#3b82f6', position: 'absolute', left: -21, top: 4 }}></div><div style={{ fontWeight: 'bold' }}>步骤1</div></div><div style={{ position: 'relative' }}><div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#d1d5db', position: 'absolute', left: -21, top: 4 }}></div><div>步骤2</div></div></div></div>;
      case 'progress':
        return <div key={comp.id} style={{ ...base }}><div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span style={{ fontWeight: 'bold' }}>进度</span><span style={{ color: '#6b7280' }}>{comp.progress || 50}%</span></div><div style={{ width: '100%', height: 8, backgroundColor: '#e5e7eb', borderRadius: 4 }}><div style={{ width: `${comp.progress || 50}%`, height: '100%', backgroundColor: '#3b82f6', borderRadius: 4 }}></div></div></div>;
      case 'quote':
        return <div key={comp.id} style={{ ...base, backgroundColor: '#f9fafb', borderLeft: '4px solid #3b82f6' }}><div style={{ fontStyle: 'italic', marginBottom: 8 }}>"{comp.content || '引用内容'}"</div><div style={{ fontSize: 14, color: '#6b7280', textAlign: 'right' }}>— {comp.author || '作者'}</div></div>;
      case 'code':
        return <div key={comp.id} style={{ ...s, backgroundColor: '#1f2937', borderRadius: comp.borderRadius || 8, padding: 16, overflow: 'auto' }}><pre style={{ color: '#e5e7eb', fontSize: 14, fontFamily: 'monospace', margin: 0 }}>{comp.code || '// 代码'}</pre></div>;
      case 'table':
        return <div key={comp.id} style={{ ...base, padding: 0, overflow: 'hidden' }}><table style={{ width: '100%', borderCollapse: 'collapse' }}><thead><tr style={{ backgroundColor: '#f9fafb' }}><th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #e5e7eb', fontWeight: 'bold' }}>列1</th><th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #e5e7eb', fontWeight: 'bold' }}>列2</th></tr></thead><tbody><tr><td style={{ padding: 12, borderBottom: '1px solid #e5e7eb' }}>内容1</td><td style={{ padding: 12, borderBottom: '1px solid #e5e7eb' }}>内容2</td></tr><tr style={{ backgroundColor: '#f9fafb' }}><td style={{ padding: 12, borderBottom: '1px solid #e5e7eb' }}>内容3</td><td style={{ padding: 12, borderBottom: '1px solid #e5e7eb' }}>内容4</td></tr></tbody></table></div>;
      case 'tag':
        return <div key={comp.id} style={{ ...s, display: 'flex', gap: 8, flexWrap: 'wrap' }}><span style={{ padding: '4px 12px', borderRadius: 16, backgroundColor: '#dbeafe', color: '#1e40af', fontSize: 14 }}>标签1</span><span style={{ padding: '4px 12px', borderRadius: 16, backgroundColor: '#d1fae5', color: '#065f46', fontSize: 14 }}>标签2</span></div>;
      case 'alert':
        return <div key={comp.id} style={{ ...s, padding: 16, backgroundColor: '#dbeafe', borderLeft: '4px solid #3b82f6', borderRadius: comp.borderRadius || 8 }}><div style={{ fontWeight: 'bold', marginBottom: 4 }}>{comp.title || '提示'}</div><div style={{ fontSize: 14 }}>{comp.content || '内容'}</div></div>;
      default:
        return <div key={comp.id} style={{ ...base, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{comp.type}</div>;
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: bg, padding: 20 }}>
      <div style={{ position: 'relative', width: CANVAS_WIDTH, minHeight: h, backgroundColor: canvasBg, borderRadius: canvasRadius, margin: '0 auto' }}>
        {components.map(render)}
      </div>
    </div>
  );
}
