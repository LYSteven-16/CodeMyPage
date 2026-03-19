import React, { useState, useRef } from 'react';
import type { WidgetProps } from '../types';

interface Props {
  component: WidgetProps;
  style: React.CSSProperties;
}

export function ComponentRenderer({ component, style }: Props) {
  const fillStyle: React.CSSProperties = {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%'
  };

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState((component as any).brushColor || '#000000');
  const [brushSize, setBrushSize] = useState((component as any).brushSize || 3);
  const [isErasing, setIsErasing] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [blankValues, setBlankValues] = useState<Record<string, string>>({});
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);
  const [showTfResult, setShowTfResult] = useState(false);
  const [activeTab, setActiveTab] = useState((component as any).activeTab || '1');
  const [checklist, setChecklist] = useState((component as any).checklistItems || []);
  const [sortItems, setSortItems] = useState((component as any).sortableItems || []);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dropIndicator, setDropIndicator] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const startDraw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.strokeStyle = isErasing ? '#ffffff' : brushColor;
    ctx.lineWidth = isErasing ? 20 : brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const endDraw = () => setIsDrawing(false);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleSortMouseDown = (idx: number) => setDragIdx(idx);

  const handleSortMouseMove = (e: React.MouseEvent, containerHeight: number) => {
    if (dragIdx === null) return;
    const items = sortItems.length;
    if (items === 0) return;
    const itemHeight = containerHeight / items;
    const mouseY = e.nativeEvent.offsetY;
    const newDropIdx = Math.max(0, Math.min(items - 1, Math.floor(mouseY / itemHeight)));
    setDropIndicator(newDropIdx);
  };

  const handleSortMouseUp = () => {
    if (dragIdx !== null && dropIndicator !== null && dragIdx !== dropIndicator) {
      const newItems = [...sortItems];
      const [removed] = newItems.splice(dragIdx, 1);
      newItems.splice(dropIndicator, 0, removed);
      setSortItems(newItems);
    }
    setDragIdx(null);
    setDropIndicator(null);
  };

  const checkFillBlanks = () => {
    const blanks = (component as any).blanks || [];
    blanks.forEach((blank: any) => {
      const input = document.getElementById(`blank-${blank.id}`) as HTMLInputElement;
      if (input) {
        const isCorrect = input.value.trim().toLowerCase() === (blank.answer || '').toLowerCase();
        input.style.borderColor = isCorrect ? '#10b981' : '#ef4444';
        input.style.backgroundColor = isCorrect ? '#d1fae5' : '#fee2e2';
      }
    });
  };

  const checkTrueFalse = (answer: boolean) => {
    setSelectedAnswer(answer);
    setShowTfResult(true);
  };

  const checkChoice = (idx: number) => {
    setSelectedOption(idx);
    setShowResult(true);
  };

  const getButtonLink = () => (component as any).link || '';
  const getOpenInNewTab = () => (component as any).openNewTab || false;
  const getCardLink = () => (component as any).link || '';
  const getCardOpenNewTab = () => (component as any).openNewTab || false;

  switch (component.type) {
    case 'heading':
      return <div style={style}><div style={{ ...fillStyle, color: component.color || '#1f2937', fontSize: component.level === 'h1' ? '2.5rem' : '1.5rem', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>{component.text}</div></div>;
    case 'text':
      return <div style={style}><div style={{ ...fillStyle, fontSize: component.fontSize || 16, color: component.color || '#374151', display: 'flex', alignItems: 'center' }}>{component.content}</div></div>;
    case 'image':
      return <div style={style}><img src={component.src} alt={component.alt} draggable={false} style={{ ...fillStyle, borderRadius: component.borderRadius, objectFit: 'cover', userSelect: 'none' }} /></div>;
    case 'button': {
      const link = getButtonLink();
      const handleClick = link ? () => window.open(link, getOpenInNewTab() ? '_blank' : '_self') : undefined;
      return <div style={style}><div onClick={handleClick} style={{ ...fillStyle, backgroundColor: component.bgColor, color: component.textColor, borderRadius: component.borderRadius, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px 24px', cursor: link ? 'pointer' : 'default' }}>{component.buttonText}</div></div>;
    }
    case 'card': {
      const link = getCardLink();
      const handleClick = link ? () => window.open(link, getCardOpenNewTab() ? '_blank' : '_self') : undefined;
      return <div style={style} onClick={handleClick}><div style={{ ...fillStyle, backgroundColor: '#fff', borderRadius: component.borderRadius || 12, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', overflow: 'hidden', display: 'flex', flexDirection: 'column', cursor: link ? 'pointer' : 'default' }}>{(component as any).imageUrl && <img src={(component as any).imageUrl} alt="" draggable={false} onDragStart={(e) => e.preventDefault()} style={{ width: '100%', height: '60%', objectFit: (component as any).imageFit || 'cover', userSelect: 'none' }} />}<div style={{ padding: 16, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}><div style={{ fontSize: 18, fontWeight: 'bold', color: (component as any).titleColor || '#1f2937', marginBottom: 8 }}>{(component as any).cardTitle || component.title || '卡片标题'}</div><div style={{ fontSize: 14, color: (component as any).descColor || '#6b7280' }}>{(component as any).description || '卡片描述'}</div></div></div></div>;
    }
    case 'accordion':
      return <div style={style}><div style={{ ...fillStyle, backgroundColor: '#fff', borderRadius: component.borderRadius || 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}><div onClick={() => setIsOpen(!isOpen)} style={{ padding: 16, backgroundColor: (component as any).accordionTitleColor || '#f3f4f6', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>{(component as any).accordionTitle || '点击展开'}<span style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>▼</span></div>{isOpen && <div style={{ padding: 16, color: (component as any).accordionContentColor || '#374151', flex: 1 }}>{(component as any).accordionContent || '隐藏内容'}</div>}</div></div>;
    case 'quiz':
      return <div style={style}><div onClick={() => setIsOpen(!isOpen)} style={{ ...fillStyle, backgroundColor: '#fff', borderRadius: component.borderRadius || 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', padding: 16, display: 'flex', flexDirection: 'column', justifyContent: 'center', cursor: 'pointer' }}><div style={{ fontWeight: 'bold', color: (component as any).questionColor || '#1f2937', marginBottom: 12 }}>{component.question || '问题'}</div><div style={{ color: (component as any).answerColor || '#059669', backgroundColor: '#d1fae5', padding: 12, borderRadius: 4, opacity: isOpen ? 1 : 0.5 }}>{isOpen ? (component as any).answer || '答案' : '点击查看答案'}</div></div></div>;
    case 'choice': {
      const options = (component as any).options || ['选项 A', '选项 B', '选项 C', '选项 D'];
      const correctIdx = (component as any).correctIndex ?? 0;
      return <div style={style}><div style={{ ...fillStyle, backgroundColor: '#fff', borderRadius: 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', padding: 16, display: 'flex', flexDirection: 'column', justifyContent: 'center', overflow: 'auto' }}><div style={{ fontWeight: 'bold', marginBottom: 12, color: (component as any).questionColor || '#1f2937' }}>{component.question || '请选择正确答案：'}</div><div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{options.map((opt: string, i: number) => { const isCorrect = i === correctIdx; let bgColor = '#fff', borderColor = '#e5e7eb'; if (showResult && selectedOption === i) { bgColor = isCorrect ? '#d1fae5' : '#fee2e2'; borderColor = isCorrect ? '#10b981' : '#ef4444'; } return <div key={i} onClick={() => checkChoice(i)} style={{ padding: '10px 14px', border: `2px solid ${borderColor}`, borderRadius: 8, cursor: 'pointer', color: '#374151', backgroundColor: bgColor, transition: 'all 0.2s' }}>○ {opt}</div>; })}</div></div></div>;
    }
    case 'fillBlank': {
      const blanks = (component as any).blanks || [];
      return <div style={style}><div style={{ ...fillStyle, backgroundColor: '#fff', borderRadius: 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', padding: 16, display: 'flex', flexDirection: 'column', justifyContent: 'center', overflow: 'auto' }}><div style={{ color: component.color || '#374151', marginBottom: 12 }}>{component.content || '填空题内容'}</div><div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>{blanks.map((blank: any) => <input key={blank.id} id={`blank-${blank.id}`} placeholder={blank.hint || '请填写...'} value={blankValues[blank.id] || ''} onChange={(e) => setBlankValues({...blankValues, [blank.id]: e.target.value})} style={{ border: '1px solid #d1d5db', borderRadius: 4, padding: '6px 10px', width: 120, fontSize: 14 }} />)}</div><button onClick={checkFillBlanks} style={{ padding: '8px 16px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', alignSelf: 'flex-start' }}>检查答案</button></div></div>;
    }
    case 'trueFalse': {
      const correctBool = (component as any).correctBool ?? true;
      return <div style={style}><div style={{ ...fillStyle, backgroundColor: '#fff', borderRadius: 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', padding: 16, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}><div style={{ marginBottom: 12, color: component.color || '#1f2937' }}>{(component as any).statement || '请判断对错：'}</div><div style={{ display: 'flex', gap: 12 }}><button onClick={() => checkTrueFalse(true)} style={{ padding: '10px 24px', border: `2px solid ${showTfResult && selectedAnswer === true ? (correctBool ? '#10b981' : '#ef4444') : '#10b981'}`, borderRadius: 8, backgroundColor: showTfResult && selectedAnswer === true ? (correctBool ? '#d1fae5' : '#fee2e2') : '#fff', color: '#10b981', cursor: 'pointer', fontWeight: 'bold' }}>√ 正确</button><button onClick={() => checkTrueFalse(false)} style={{ padding: '10px 24px', border: `2px solid ${showTfResult && selectedAnswer === false ? (!correctBool ? '#10b981' : '#ef4444') : '#ef4444'}`, borderRadius: 8, backgroundColor: showTfResult && selectedAnswer === false ? (!correctBool ? '#d1fae5' : '#fee2e2') : '#fff', color: '#ef4444', cursor: 'pointer', fontWeight: 'bold' }}>× 错误</button></div></div></div>;
    }
    case 'sortable': {
      const containerHeight = 150;
      return <div style={style}><div style={{ ...fillStyle, backgroundColor: '#fff', borderRadius: 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', padding: 16, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}><div style={{ fontWeight: 'bold', marginBottom: 12 }}>请按正确顺序排列：</div><div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }} onMouseMove={(e) => handleSortMouseMove(e, containerHeight)} onMouseUp={handleSortMouseUp} onMouseLeave={() => { setDragIdx(null); setDropIndicator(null); }}>{sortItems.map((item: string, i: number) => { const isDragging = dragIdx === i; const isDropTarget = dropIndicator === i && dragIdx !== null && dragIdx !== i; return <div key={i} onMouseDown={() => handleSortMouseDown(i)} style={{ padding: '10px 14px', border: `2px solid ${isDropTarget ? '#3b82f6' : '#e5e7eb'}`, borderRadius: 8, backgroundColor: isDragging ? '#e0f2fe' : (isDropTarget ? '#f0f9ff' : '#f9fafb'), cursor: 'grab', display: 'flex', userSelect: 'none', alignItems: 'center', gap: 8, transform: isDragging ? 'scale(0.98)' : 'scale(1)', transition: isDragging ? 'none' : 'all 0.15s' }}>☰ {item}</div>; })}</div></div></div>;
    }
    case 'drawing':
      return <div style={style}><div style={{ ...fillStyle, backgroundColor: '#fff', borderRadius: 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}><div style={{ padding: 8, borderBottom: '1px solid #e5e7eb', display: 'flex', gap: 8, alignItems: 'center', background: '#f9fafb' }}><input type="color" value={brushColor} onChange={(e) => setBrushColor(e.target.value)} style={{ width: 28, height: 28, border: 'none', cursor: 'pointer' }} /><input type="range" min="1" max="20" value={brushSize} onChange={(e) => setBrushSize(Number(e.target.value))} style={{ width: 70 }} /><button onClick={() => setIsErasing(!isErasing)} style={{ padding: '4px 8px', fontSize: 12, border: `1px solid ${isErasing ? '#3b82f6' : '#d1d5db'}`, borderRadius: 4, backgroundColor: isErasing ? '#eff6ff' : '#fff', cursor: 'pointer' }}>🧹 橡皮</button><button onClick={clearCanvas} style={{ padding: '4px 8px', fontSize: 12, border: '1px solid #d1d5db', borderRadius: 4, backgroundColor: '#fff', cursor: 'pointer' }}>🗑️ 清空</button></div><canvas ref={canvasRef} width={380} height={150} onMouseDown={startDraw} onMouseMove={draw} onMouseUp={endDraw} onMouseLeave={endDraw} style={{ flex: 1, backgroundColor: '#ffffff', cursor: 'crosshair' }} /></div></div>;
    case 'checklist':
      return <div style={style}><div style={{ ...fillStyle, backgroundColor: '#fff', borderRadius: 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', padding: 16, display: 'flex', flexDirection: 'column', justifyContent: 'center', overflow: 'auto' }}>{checklist.map((item: any) => <label key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', cursor: 'pointer' }}><input type="checkbox" checked={item.checked} onChange={(e) => { const newList = checklist.map((c: any) => c.id === item.id ? {...c, checked: e.target.checked} : c); setChecklist(newList); }} style={{ width: 18, height: 18 }} /><span style={{ color: item.checked ? '#9ca3af' : '#374151', textDecoration: item.checked ? 'line-through' : 'none', transition: 'all 0.2s' }}>{item.text}</span></label>)}</div></div>;
    case 'tabs': {
      const tabs = (component as any).tabs || [{ id: '1', label: '标签 1', content: '内容 1' }, { id: '2', label: '标签 2', content: '内容 2' }];
      const currentTab = tabs.find((t: any) => t.id === activeTab) || tabs[0];
      return <div style={style}><div style={{ ...fillStyle, backgroundColor: '#fff', borderRadius: 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}><div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb' }}>{tabs.map((tab: any) => <div key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ padding: '12px 16px', borderBottom: tab.id === activeTab ? '2px solid #3b82f6' : '2px solid transparent', color: tab.id === activeTab ? '#3b82f6' : '#6b7280', cursor: 'pointer', fontWeight: tab.id === activeTab ? 'bold' : 'normal', transition: 'all 0.2s' }}>{tab.label}</div>)}</div><div style={{ padding: 16, flex: 1, color: '#374151', display: 'flex', alignItems: 'center' }}>{currentTab?.content || '标签页内容'}</div></div></div>;
    }
    case 'timeline': {
      const steps = (component as any).steps || [{ id: '1', title: '步骤 1', description: '描述' }, { id: '2', title: '步骤 2', description: '描述' }];
      return <div style={style}><div style={{ ...fillStyle, backgroundColor: '#fff', borderRadius: 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', padding: 16, display: 'flex', flexDirection: 'column', justifyContent: 'center', overflow: 'auto' }}><div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>{steps.map((step: any, i: number) => <div key={step.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}><div style={{ width: 24, height: 24, borderRadius: '50%', backgroundColor: '#3b82f6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0 }}>{i + 1}</div><div><div style={{ fontWeight: 'bold', color: '#1f2937' }}>{step.title}</div>{step.description && <div style={{ fontSize: 12, color: '#6b7280' }}>{step.description}</div>}</div></div>)}</div></div></div>;
    }
    case 'progress':
      return <div style={style}><div style={{ ...fillStyle, padding: 16, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 8 }}><div style={{ fontSize: 14, color: '#6b7280', textAlign: 'center' }}>{(component as any).progress || 0}%</div><div style={{ width: '100%', height: 12, backgroundColor: '#e5e7eb', borderRadius: 6, overflow: 'hidden' }}><div style={{ width: `${(component as any).progress || 0}%`, height: '100%', backgroundColor: (component as any).progressColor || '#3b82f6', borderRadius: 6, transition: 'width 0.3s' }} /></div></div></div>;
    case 'video':
      return <div style={style}><video src={(component as any).videoUrl} poster={(component as any).poster} controls style={{ ...fillStyle, borderRadius: component.borderRadius || 8, objectFit: 'cover' }} /></div>;
    case 'audio':
      return <div style={style}><div style={{ ...fillStyle, backgroundColor: '#fff', borderRadius: 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}><div style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0, fontSize: 20 }}>▶</div><div style={{ flex: 1 }}><div style={{ fontWeight: 'bold', marginBottom: 4 }}>音频播放器</div><audio src={component.src} controls style={{ width: '100%' }} /></div></div></div>;
    case 'quote': {
      const borderColor = (component as any).borderColor || '#3b82f6';
      return <div style={style}><div style={{ ...fillStyle, padding: 20, borderLeft: `4px solid ${borderColor}`, backgroundColor: '#f9fafb', borderRadius: 8, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>{(component as any).quoteIcon && <div style={{ fontSize: 24, color: borderColor, marginBottom: 8 }}>❝</div>}<div style={{ fontSize: 16, fontStyle: 'italic', color: '#374151', marginBottom: 12 }}>"{component.quoteText || '引用内容'}"</div>{(component as any).quoteAuthor && <div style={{ fontSize: 14, color: '#6b7280', textAlign: 'right' }}>— {(component as any).quoteAuthor}</div>}</div></div>;
    }
    case 'code': {
      const copyCode = () => { navigator.clipboard.writeText((component as any).code || '// 代码'); setCopied(true); setTimeout(() => setCopied(false), 2000); };
      return <div style={style}><div style={{ ...fillStyle, backgroundColor: '#1f2937', borderRadius: 8, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}><div style={{ padding: '8px 12px', backgroundColor: '#111827', color: '#9ca3af', fontSize: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span>{(component as any).language || 'javascript'}</span><button onClick={copyCode} style={{ padding: '4px 10px', backgroundColor: copied ? '#10b981' : '#374151', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>{copied ? '✓ 已复制' : '📋 复制'}</button></div><pre style={{ padding: 16, margin: 0, color: '#e5e7eb', fontSize: 14, fontFamily: 'monospace', overflow: 'auto', flex: 1 }}>{(component as any).code || '// 代码'}</pre></div></div>;
    }
    case 'table': {
      const headers = (component as any).tableHeaders || ['列1', '列2'];
      const data = (component as any).tableData || [['数据1', '数据2'], ['数据3', '数据4']];
      const zebra = (component as any).zebraStripe;
      return <div style={style}><div style={{ ...fillStyle, overflow: 'auto', backgroundColor: '#fff', borderRadius: 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}><table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}><thead><tr style={{ backgroundColor: '#f9fafb' }}>{headers.map((h: string, i: number) => <th key={i} style={{ padding: 12, textAlign: 'left', borderBottom: '2px solid #e5e7eb', fontWeight: 'bold' }}>{h}</th>)}</tr></thead><tbody>{data.map((row: string[], i: number) => <tr key={i} style={{ backgroundColor: zebra && i % 2 === 1 ? '#f9fafb' : '#fff' }}>{row.map((cell: string, j: number) => <td key={j} style={{ padding: 12, borderBottom: '1px solid #e5e7eb' }}>{cell}</td>)}</tr>)}</tbody></table></div></div>;
    }
    case 'tag': {
      const tagColors: Record<string, { bg: string; text: string }> = { default: { bg: '#f3f4f6', text: '#374151' }, success: { bg: '#d1fae5', text: '#059669' }, warning: { bg: '#fef3c7', text: '#d97706' }, error: { bg: '#fee2e2', text: '#dc2626' }, info: { bg: '#dbeafe', text: '#2563eb' } };
      const colors = tagColors[(component as any).tagStyle || 'default'];
      return <div style={style}><div style={{ ...fillStyle, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ padding: '4px 12px', backgroundColor: colors.bg, color: colors.text, borderRadius: 9999, fontSize: 14, fontWeight: 500 }}>{(component as any).tagText || '标签'}</span></div></div>;
    }
    case 'alert': {
      const alertColors: Record<string, { bg: string; border: string; title: string; icon: string }> = { success: { bg: '#d1fae5', border: '#10b981', title: '#065f46', icon: '✓' }, warning: { bg: '#fef3c7', border: '#f59e0b', title: '#92400e', icon: '⚠' }, error: { bg: '#fee2e2', border: '#ef4444', title: '#991b1b', icon: '✕' }, info: { bg: '#dbeafe', border: '#3b82f6', title: '#1e40af', icon: 'ℹ' } };
      const alert = alertColors[(component as any).alertType || 'info'];
      return <div style={style}><div style={{ ...fillStyle, padding: 16, backgroundColor: alert.bg, borderLeft: `4px solid ${alert.border}`, borderRadius: 8, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}><div style={{ fontWeight: 'bold', color: alert.title, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}><span>{alert.icon}</span> {(component as any).alertTitle || '提示'}</div><div style={{ color: '#374151', fontSize: 14 }}>{(component as any).alertContent || '提示内容'}</div></div></div>;
    }
    default:
      return <div style={style}><div style={{ ...fillStyle, backgroundColor: '#f3f4f6', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>{component.type}</div></div>;
  }
}
