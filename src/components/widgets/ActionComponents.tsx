import React from 'react';
import type { WidgetProps } from '../../types';

export const DrawingRenderer: React.FC<{ component: WidgetProps; style: React.CSSProperties }> = ({ component, style }) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = React.useState(false);
  const [brushColor, setBrushColor] = React.useState((component as any).brushColor || '#ffffff');
  const [brushSlider, setBrushSlider] = React.useState((component as any).brushSize || 3);
  const [isErasing, setIsErasing] = React.useState(false);
  const [canvasSize, setCanvasSize] = React.useState({ width: 380, height: 200 });
  
  const getActualBrushSize = (sliderValue: number) => {
    return Math.round(Math.min(20, Math.pow(sliderValue / 10, 2) * 5 + 1));
  };
  
  const getBrushPreviewSize = (brushSize: number) => {
    return 2 * Math.pow(brushSize, 0.843);
  };
  
  React.useEffect(() => {
    const updateCanvasSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setCanvasSize({
          width: Math.floor(rect.width),
          height: Math.floor(rect.height)
        });
      }
    };
    
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);
  
  React.useEffect(() => {
    const canvasId = (component as any).id || 'drawing-' + Math.random();
    const savedImage = sessionStorage.getItem(`drawing_${canvasId}`);
    if (savedImage && canvasRef.current) {
      const img = new Image();
      img.onload = () => {
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx && canvasRef.current) {
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          ctx.drawImage(img, 0, 0);
        }
      };
      img.src = savedImage;
    }
  }, [canvasSize]);
  
  const saveCanvasImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const dataUrl = canvas.toDataURL('image/png');
    const canvasId = (component as any).id || 'drawing-' + Math.random();
    try {
      sessionStorage.setItem(`drawing_${canvasId}`, dataUrl);
    } catch (e) {
      console.error('Failed to save drawing:', e);
    }
    return dataUrl;
  };
  
  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };
  
  const startDraw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    setIsDrawing(true);
    const pos = getMousePos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };
  
  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const pos = getMousePos(e);
    ctx.strokeStyle = isErasing ? '#2d5a3d' : brushColor;
    ctx.lineWidth = isErasing ? 20 : getActualBrushSize(brushSlider);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };
  
  const endDraw = () => {
    setIsDrawing(false);
    saveCanvasImage();
  };
  
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    saveCanvasImage();
  };
  
  return (
    <div style={style}>
      <div 
        ref={containerRef}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: '100%',
          height: '100%',
          backgroundColor: '#2d5a3d',
          borderRadius: 8,
          boxShadow: `
            inset 0 0 60px rgba(0,0,0,0.3),
            0 8px 32px rgba(0,0,0,0.3),
            0 2px 8px rgba(0,0,0,0.2)
          `,
          border: '12px solid #8b5a2b',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        <div style={{
          padding: '6px 12px',
          borderBottom: '1px solid #1e3d29',
          display: 'flex',
          gap: 12,
          alignItems: 'center',
          background: 'linear-gradient(to bottom, #1a3323, #243d2d)',
          flexShrink: 0,
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              background: 'repeating-conic-gradient(#444 0% 25%, #3a3a3a 0% 50%) 50% / 8px 8px',
              border: '2px solid rgba(255,255,255,0.2)',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden',
              flexShrink: 0
            }}>
              <div style={{
                width: getBrushPreviewSize(getActualBrushSize(brushSlider)),
                height: getBrushPreviewSize(getActualBrushSize(brushSlider)),
                borderRadius: '50%',
                backgroundColor: brushColor,
                boxShadow: '0 0 3px rgba(0,0,0,0.4)',
                transition: 'all 0.05s ease'
              }} />
              <input
                type="color"
                value={brushColor}
                onChange={(e) => setBrushColor(e.target.value)}
                style={{ 
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  cursor: 'pointer',
                  opacity: 0
                }}
              />
            </div>
            <input
              type="range"
              min="1"
              max="20"
              value={brushSlider}
              onChange={(e) => setBrushSlider(Number(e.target.value))}
              onInput={(e) => {
                e.stopPropagation();
                setBrushSlider(Number((e.target as HTMLInputElement).value));
              }}
              onMouseDown={(e) => e.stopPropagation()}
              onMouseMove={(e) => e.stopPropagation()}
              style={{ 
                width: 120,
                accentColor: brushColor
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={() => setIsErasing(!isErasing)}
              style={{
                padding: '6px 14px',
                fontSize: 13,
                border: `2px solid ${isErasing ? '#ffeb3b' : '#5a8a5f'}`,
                borderRadius: 6,
                backgroundColor: isErasing ? '#ffeb3b' : '#2d5a3d',
                color: isErasing ? '#333' : '#fff',
                cursor: 'pointer',
                fontFamily: 'Georgia, serif',
                boxShadow: isErasing ? '0 2px 8px rgba(255,235,59,0.4)' : '0 2px 4px rgba(0,0,0,0.2)',
                transition: 'all 0.2s'
              }}
            >
              {isErasing ? '✓ 橡皮' : '橡皮'}
            </button>
            <button
              onClick={clearCanvas}
              style={{
                padding: '6px 14px',
                fontSize: 13,
                border: '2px solid #8b5a2b',
                borderRadius: 6,
                backgroundColor: '#2d5a3d',
                color: '#fff',
                cursor: 'pointer',
                fontFamily: 'Georgia, serif',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                transition: 'all 0.2s'
              }}
            >
              清空
            </button>
          </div>
        </div>
        <canvas
          ref={canvasRef}
          width={canvasSize.width}
          height={canvasSize.height}
          onMouseDown={(e) => {
            e.stopPropagation();
            startDraw(e);
          }}
          onMouseMove={(e) => {
            e.stopPropagation();
            draw(e);
          }}
          onMouseUp={(e) => {
            e.stopPropagation();
            endDraw();
          }}
          onMouseLeave={(e) => {
            e.stopPropagation();
            endDraw();
          }}
          style={{
            flex: 1,
            backgroundColor: '#2d5a3d',
            cursor: 'crosshair'
          }}
        />
      </div>
    </div>
  );
};

export const DrawingPreviewRenderer: React.FC<{ component: WidgetProps; style: React.CSSProperties }> = ({ component, style }) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = React.useState(false);
  const [brushColor, setBrushColor] = React.useState('#ffffff');
  const [brushSlider, setBrushSlider] = React.useState(3);
  const [isErasing, setIsErasing] = React.useState(false);
  const [canvasSize, setCanvasSize] = React.useState({ width: 380, height: 200 });
  
  const getActualBrushSize = (sliderValue: number) => {
    return Math.round(Math.min(20, Math.pow(sliderValue / 10, 2) * 5 + 1));
  };
  
  const getBrushPreviewSize = (brushSize: number) => {
    return 2 * Math.pow(brushSize, 0.843);
  };
  
  const canvasId = (component as any).id || 'drawing-' + Math.random();
  
  React.useEffect(() => {
    const updateCanvasSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setCanvasSize({
          width: Math.floor(rect.width),
          height: Math.floor(rect.height)
        });
      }
    };
    
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);
  
  React.useEffect(() => {
    const savedImage = sessionStorage.getItem(`drawing_${canvasId}`);
    if (savedImage && canvasRef.current) {
      const img = new Image();
      img.onload = () => {
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx && canvasRef.current) {
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          ctx.drawImage(img, 0, 0);
        }
      };
      img.src = savedImage;
    }
  }, [canvasSize, canvasId]);
  
  const saveCanvasImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const dataUrl = canvas.toDataURL('image/png');
    try {
      sessionStorage.setItem(`drawing_${canvasId}`, dataUrl);
    } catch (e) {
      console.error('Failed to save drawing:', e);
    }
    return dataUrl;
  };
  
  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };
  
  const startDraw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    setIsDrawing(true);
    const pos = getMousePos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };
  
  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const pos = getMousePos(e);
    ctx.strokeStyle = isErasing ? '#2d5a3d' : brushColor;
    ctx.lineWidth = isErasing ? 20 : getActualBrushSize(brushSlider);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };
  
  const endDraw = () => {
    setIsDrawing(false);
    saveCanvasImage();
  };
  
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    saveCanvasImage();
  };
  
  return (
    <div style={style}>
      <div 
        ref={containerRef}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: '100%',
          height: '100%',
          backgroundColor: '#2d5a3d',
          borderRadius: 8,
          boxShadow: `
            inset 0 0 60px rgba(0,0,0,0.3),
            0 8px 32px rgba(0,0,0,0.3),
            0 2px 8px rgba(0,0,0,0.2)
          `,
          border: '12px solid #8b5a2b',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        <div style={{
          padding: '6px 12px',
          borderBottom: '1px solid #1e3d29',
          display: 'flex',
          gap: 12,
          alignItems: 'center',
          background: 'linear-gradient(to bottom, #1a3323, #243d2d)',
          flexShrink: 0,
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              background: 'repeating-conic-gradient(#444 0% 25%, #3a3a3a 0% 50%) 50% / 8px 8px',
              border: '2px solid rgba(255,255,255,0.2)',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden',
              flexShrink: 0
            }}>
              <div style={{
                width: getBrushPreviewSize(getActualBrushSize(brushSlider)),
                height: getBrushPreviewSize(getActualBrushSize(brushSlider)),
                borderRadius: '50%',
                backgroundColor: brushColor,
                boxShadow: '0 0 3px rgba(0,0,0,0.4)',
                transition: 'all 0.05s ease'
              }} />
              <input
                type="color"
                value={brushColor}
                onChange={(e) => setBrushColor(e.target.value)}
                style={{ 
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  cursor: 'pointer',
                  opacity: 0
                }}
              />
            </div>
            <input
              type="range"
              min="1"
              max="20"
              value={brushSlider}
              onChange={(e) => setBrushSlider(Number(e.target.value))}
              onInput={(e) => {
                e.stopPropagation();
                setBrushSlider(Number((e.target as HTMLInputElement).value));
              }}
              onMouseDown={(e) => e.stopPropagation()}
              onMouseMove={(e) => e.stopPropagation()}
              style={{ 
                width: 120,
                accentColor: brushColor
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={() => setIsErasing(!isErasing)}
              style={{
                padding: '6px 14px',
                fontSize: 13,
                border: `2px solid ${isErasing ? '#ffeb3b' : '#5a8a5f'}`,
                borderRadius: 6,
                backgroundColor: isErasing ? '#ffeb3b' : '#2d5a3d',
                color: isErasing ? '#333' : '#fff',
                cursor: 'pointer',
                fontFamily: 'Georgia, serif',
                boxShadow: isErasing ? '0 2px 8px rgba(255,235,59,0.4)' : '0 2px 4px rgba(0,0,0,0.2)',
                transition: 'all 0.2s'
              }}
            >
              {isErasing ? '✓ 橡皮' : '橡皮'}
            </button>
            <button
              onClick={clearCanvas}
              style={{
                padding: '6px 14px',
                fontSize: 13,
                border: '2px solid #8b5a2b',
                borderRadius: 6,
                backgroundColor: '#2d5a3d',
                color: '#fff',
                cursor: 'pointer',
                fontFamily: 'Georgia, serif',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                transition: 'all 0.2s'
              }}
            >
              清空
            </button>
          </div>
        </div>
        <canvas
          ref={canvasRef}
          width={canvasSize.width}
          height={canvasSize.height}
          onMouseDown={(e) => {
            e.stopPropagation();
            startDraw(e);
          }}
          onMouseMove={(e) => {
            e.stopPropagation();
            draw(e);
          }}
          onMouseUp={(e) => {
            e.stopPropagation();
            endDraw();
          }}
          onMouseLeave={(e) => {
            e.stopPropagation();
            endDraw();
          }}
          style={{
            flex: 1,
            backgroundColor: '#2d5a3d',
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
