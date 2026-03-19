import React from 'react';
import type { WidgetProps } from '../../types';

export const DrawingRenderer: React.FC<{ component: WidgetProps; style: React.CSSProperties }> = ({ component, style }) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = React.useState(false);
  const [brushColor, setBrushColor] = React.useState((component as any).brushColor || '#000000');
  const [brushSize, setBrushSize] = React.useState((component as any).brushSize || 3);
  const [isErasing, setIsErasing] = React.useState(false);
  
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
        <div style={{
          padding: 8,
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          gap: 8,
          alignItems: 'center',
          background: '#f9fafb'
        }}>
          <input
            type="color"
            value={brushColor}
            onChange={(e) => setBrushColor(e.target.value)}
            style={{ width: 28, height: 28, border: 'none', cursor: 'pointer' }}
          />
          <input
            type="range"
            min="1"
            max="20"
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            style={{ width: 70 }}
          />
          <button
            onClick={() => setIsErasing(!isErasing)}
            style={{
              padding: '4px 8px',
              fontSize: 12,
              border: `1px solid ${isErasing ? '#3b82f6' : '#d1d5db'}`,
              borderRadius: 4,
              backgroundColor: isErasing ? '#eff6ff' : '#fff',
              cursor: 'pointer'
            }}
          >
            🧹 橡皮
          </button>
          <button
            onClick={clearCanvas}
            style={{
              padding: '4px 8px',
              fontSize: 12,
              border: '1px solid #d1d5db',
              borderRadius: 4,
              backgroundColor: '#fff',
              cursor: 'pointer'
            }}
          >
            🗑️ 清空
          </button>
        </div>
        <canvas
          ref={canvasRef}
          width={380}
          height={150}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          style={{
            flex: 1,
            backgroundColor: '#ffffff',
            cursor: 'crosshair'
          }}
        />
      </div>
    </div>
  );
};

export const ChecklistRenderer: React.FC<{ component: WidgetProps; style: React.CSSProperties }> = ({ component, style }) => {
  const [checklist, setChecklist] = React.useState((component as any).checklistItems || []);
  
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
        {checklist.map((item: any) => (
          <label
            key={item.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '8px 0',
              cursor: 'pointer'
            }}
          >
            <input
              type="checkbox"
              checked={item.checked}
              onChange={(e) => {
                const newList = checklist.map((c: any) =>
                  c.id === item.id ? {...c, checked: e.target.checked} : c
                );
                setChecklist(newList);
              }}
              style={{ width: 18, height: 18 }}
            />
            <span style={{
              color: item.checked ? '#9ca3af' : '#374151',
              textDecoration: item.checked ? 'line-through' : 'none',
              transition: 'all 0.2s'
            }}>
              {item.text}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
};
