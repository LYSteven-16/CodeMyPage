import { useState, useRef, forwardRef } from 'react';
import { ComponentPanel } from './components/Editor/ComponentPanel';
import type { WidgetProps, ComponentPanelItem } from './types';
import { Download, Eye, Trash2, Copy, ArrowUp, ArrowDown, Grid3X3, Move, Save, Upload } from 'lucide-react';

interface GridSettings {
  dotSize: number;
  dotColor: string;
  dotSpacing: number;
  snapToGrid: boolean;
  canvasBackground: string;
  canvasBorderRadius: number;
  dotGridBackground: string;
}

const CANVAS_WIDTH = 1000;
const CANVAS_MIN_HEIGHT = 1600;

function App() {
  const [components, setComponents] = useState< WidgetProps[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [showGridSettings, setShowGridSettings] = useState(false);
  const workAreaRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number; componentX: number; componentY: number; scrollX: number; scrollY: number } | null>(null);
  const [resizeStart, setResizeStart] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

  const [gridSettings, setGridSettings] = useState<GridSettings>({
    dotSize: 2,
    dotColor: '#c0c0c0',
    dotSpacing: 20,
    snapToGrid: true,
    canvasBackground: '#ffffff',
    canvasBorderRadius: 0,
    dotGridBackground: '#f3f4f6'
  });

  const gridBackground = {
    backgroundColor: gridSettings.dotGridBackground,
    backgroundImage: `radial-gradient(circle, ${gridSettings.dotColor} ${gridSettings.dotSize}px, transparent ${gridSettings.dotSize}px)`,
    backgroundSize: `${gridSettings.dotSpacing}px ${gridSettings.dotSpacing}px`
  };

  const generateId = () => `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const handleAddComponent = (item: ComponentPanelItem) => {
    
    const newComponent: WidgetProps = {
      id: generateId(),
      type: item.type,
      order: components.length,
      x: 100,
      y: 100,
      ...item.defaultProps,
    };
    setComponents([...components, newComponent]);
    setSelectedId(newComponent.id);
  };

  const handleExport = () => {
    const renderComponentHTML = (comp: WidgetProps): string => {
      const left = comp.x || 0;
      const top = comp.y || 0;
      const width = comp.width || 300;
      const height = comp.height || 200;
      
      switch (comp.type) {
        case 'heading':
          return `<div style="color:${comp.color || '#1f2937'};font-size:${comp.level === 'h1' ? '2.5rem' : '1.5rem'};font-weight:bold;position:absolute;left:${left}px;top:${top}px">${comp.text || ''}</div>`;
        case 'text':
          return `<div style="font-size:${comp.fontSize || 16}px;color:${comp.color || '#374151'};position:absolute;left:${left}px;top:${top}px;width:${width}px;height:${height}px">${comp.content || ''}</div>`;
        case 'image':
          return `<img src="${comp.src || ''}" style="width:${width}px;height:${height}px;position:absolute;left:${left}px;top:${top}px;border-radius:${comp.borderRadius || 0}px;object-fit:cover">`;
        case 'button':
          return `<div style="background-color:${comp.bgColor || '#3b82f6'};color:${comp.textColor || '#fff'};border-radius:${comp.borderRadius || 8}px;padding:12px 24px;position:absolute;left:${left}px;top:${top}px;width:${width}px;height:${height}px;display:flex;align-items:center;justify-content:center">${comp.buttonText || '按钮'}</div>`;
        case 'card':
          return `<div style="position:absolute;left:${left}px;top:${top}px;width:${width}px;height:${height}px;background:#fff;border-radius:${comp.borderRadius || 12}px;box-shadow:0 2px 8px rgba(0,0,0,0.1);overflow:hidden;display:flex;flex-direction:column">${comp.imageUrl ? `<img src="${comp.imageUrl}" style="width:100%;height:60%;object-fit:${comp.imageFit || 'cover'}">` : ''}<div style="padding:16px;height:40%;display:flex;flex-direction:column"><div style="font-size:18px;font-weight:bold;color:${comp.titleColor || '#1f2937'};margin-bottom:8px">${comp.title || ''}</div><div style="font-size:14px;color:${comp.descColor || '#6b7280'}">${comp.description || ''}</div></div></div>`;
        case 'accordion':
          return `<div style="position:absolute;left:${left}px;top:${top}px;width:${width}px;height:${height}px;background:#fff;border-radius:${comp.borderRadius || 8}px;box-shadow:0 2px 4px rgba(0,0,0,0.1);overflow:hidden;display:flex;flex-direction:column"><div style="padding:16px;background:${comp.accordionTitleColor || '#f3f4f6'};font-weight:bold;height:50%">${comp.accordionTitle || ''}</div><div style="padding:16px;color:${comp.accordionContentColor || '#374151'};height:50%">${comp.accordionContent || ''}</div></div>`;
        case 'quiz':
          return `<div style="position:absolute;left:${left}px;top:${top}px;width:${width}px;height:${height}px;background:#fff;border-radius:${comp.borderRadius || 8}px;box-shadow:0 2px 4px rgba(0,0,0,0.1);padding:16px;display:flex;flex-direction:column"><div style="font-weight:bold;color:${comp.questionColor || '#1f2937'};margin-bottom:12px">${comp.question || ''}</div><div style="color:${comp.answerColor || '#059669'};background:#d1fae5;padding:12px;border-radius:4px">${comp.answer || ''}</div></div>`;
        default: return '';
      }
    };

    const html = `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>我的网页</title><script src="https://cdn.tailwindcss.com"></script><style>body{margin:0;min-height:100vh;position:relative;background:${gridSettings.dotGridBackground}}.page-container{position:relative;width:${CANVAS_WIDTH}px;margin:0 auto;background:${gridSettings.canvasBackground};min-height:${CANVAS_MIN_HEIGHT}px;border-radius:${gridSettings.canvasBorderRadius}px}</style></head><body><div class="page-container">${components.map(c => renderComponentHTML(c)).join('\n')}</div></body></html>`;
    const b = new Blob([html], { type: 'text/html' });
    const u = URL.createObjectURL(b);
    const a = document.createElement('a'); a.href = u; a.download = 'my-page.html'; a.click();
  };

  const handleSave = () => {
    const projectData = {
      version: '1.0',
      components,
      gridSettings,
      savedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'codemypage-project.json'; a.click();
    URL.revokeObjectURL(url);
  };

  const handleLoad = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.components) {
          setComponents(data.components);
          setSelectedId(null);
        }
        if (data.gridSettings) {
          setGridSettings(data.gridSettings);
        }
      } catch {
        alert('文件格式错误');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleWidgetDragStart = (e: React.MouseEvent, id: string) => {
    setSelectedId(id);
    setIsDragging(true);
    const component = components.find(c => c.id === id);
    if (component && workAreaRef.current) {
      setDragStart({
        x: e.clientX,
        y: e.clientY,
        componentX: component.x || 0,
        componentY: component.y || 0,
        scrollX: workAreaRef.current.scrollLeft,
        scrollY: workAreaRef.current.scrollTop
      });
    }
  };

  const handleWidgetDrag = (e: React.MouseEvent) => {
    if (!isDragging || !dragStart || !workAreaRef.current) return;
    
    const currentScrollX = workAreaRef.current.scrollLeft;
    const currentScrollY = workAreaRef.current.scrollTop;
    const scrollDeltaX = currentScrollX - dragStart.scrollX;
    const scrollDeltaY = currentScrollY - dragStart.scrollY;

    const zoomRatio = zoom / 100;
    const deltaX = (e.clientX - dragStart.x) / zoomRatio;
    const deltaY = (e.clientY - dragStart.y) / zoomRatio;

    let newX = dragStart.componentX + deltaX + scrollDeltaX;
    let newY = dragStart.componentY + deltaY + scrollDeltaY;

    if (gridSettings.snapToGrid) {
      const spacing = gridSettings.dotSpacing;
      newX = Math.round(newX / spacing) * spacing;
      newY = Math.round(newY / spacing) * spacing;
    }

    newX = Math.max(0, newX);
    newY = Math.max(0, newY);

    setComponents(components.map(c => 
      c.id === selectedId ? { ...c, x: newX, y: newY } : c
    ));
  };

  const handleWidgetDragEnd = () => {
    setIsDragging(false);
    setDragStart(null);
  };

  const handleResizeStart = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedId(id);
    setIsResizing(true);
    const component = components.find(c => c.id === id);
    if (component) {
      setResizeStart({
        x: e.clientX,
        y: e.clientY,
        width: component.width || 300,
        height: component.height || 200
      });
    }
  };

  const handleResize = (e: React.MouseEvent) => {
    if (!isResizing || !resizeStart) return;

    const zoomRatio = zoom / 100;
    const deltaX = (e.clientX - resizeStart.x) / zoomRatio;
    const deltaY = (e.clientY - resizeStart.y) / zoomRatio;

    let newWidth = Math.max(50, resizeStart.width + deltaX);
    let newHeight = Math.max(50, resizeStart.height + deltaY);

    if (gridSettings.snapToGrid) {
      const spacing = gridSettings.dotSpacing;
      newWidth = Math.round(newWidth / spacing) * spacing;
      newHeight = Math.round(newHeight / spacing) * spacing;
    }

    setComponents(components.map(c => 
      c.id === selectedId ? { ...c, width: newWidth, height: newHeight } : c
    ));
  };

  const handleResizeEnd = () => {
    setIsResizing(false);
    setResizeStart(null);
  };

  const [editingComponent, setEditingComponent] = useState<{ id: string; field: string; value: string } | null>(null);

  const handleDoubleClick = (id: string, field: string, currentValue: string) => {
    setEditingComponent({ id, field, value: currentValue });
  };

  const handleEditSave = () => {
    if (editingComponent) {
      handleUpdateProperty(editingComponent.id, { [editingComponent.field]: editingComponent.value });
      setEditingComponent(null);
    }
  };

  const handleMoveUp = (id: string) => {
    const idx = components.findIndex(c => c.id === id);
    if (idx > 0) {
      const newComponents = [...components];
      [newComponents[idx - 1], newComponents[idx]] = [newComponents[idx], newComponents[idx - 1]];
      setComponents(newComponents);
    }
  };

  const handleMoveDown = (id: string) => {
    const idx = components.findIndex(c => c.id === id);
    if (idx < components.length - 1) {
      const newComponents = [...components];
      [newComponents[idx], newComponents[idx + 1]] = [newComponents[idx + 1], newComponents[idx]];
      setComponents(newComponents);
    }
  };

  const handleDuplicate = (id: string) => {
    const component = components.find(c => c.id === id);
    if (component) {
      const newComponent: WidgetProps = {
        ...component,
        id: generateId(),
        x: (component.x || 0) + 20,
        y: (component.y || 0) + 20
      };
      setComponents([...components, newComponent]);
      setSelectedId(newComponent.id);
    }
  };

  const handleDelete = (id: string) => {
    setComponents(components.filter((c) => c.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const handleUpdateProperty = (id: string, updates: Partial<WidgetProps>) => {
    setComponents(components.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  const handleGridChange = (updates: Partial<GridSettings>) => {
    setGridSettings(prev => ({ ...prev, ...updates }));
  };

  const selectedComponent = components.find((c) => c.id === selectedId);

  const renderEditModal = () => {
    if (!editingComponent) return null;
    
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setEditingComponent(null)}>
        <div className="bg-white rounded-xl p-6 w-96 shadow-xl" onClick={(e) => e.stopPropagation()}>
          <h3 className="text-lg font-semibold mb-4">编辑文字</h3>
          <textarea
            value={editingComponent.value}
            onChange={(e) => setEditingComponent({ ...editingComponent, value: e.target.value })}
            className="w-full border rounded-lg p-3 h-32 mb-4"
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <button onClick={() => setEditingComponent(null)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">取消</button>
            <button onClick={handleEditSave} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">保存</button>
          </div>
        </div>
      </div>
    );
  };

  if (showPreview) {
    const previewHeight = Math.max(CANVAS_MIN_HEIGHT, ...components.map((c: WidgetProps) => (c.y || 0) + (c.height || 200) + 200));
    
    return (
      <div className="min-h-screen" style={{ backgroundColor: gridSettings.dotGridBackground }}>
        <div className="bg-white border-b px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-semibold">预览模式</h1>
          <button onClick={() => setShowPreview(false)} className="px-4 py-2 bg-gray-200 rounded-lg">返回编辑</button>
        </div>
        <div className="py-8 px-4 flex justify-center">
          <div style={{ position: 'relative', width: CANVAS_WIDTH, minHeight: previewHeight, backgroundColor: gridSettings.canvasBackground, borderRadius: gridSettings.canvasBorderRadius, margin: '0 auto' }}>
            {components.map(comp => {
              const width = comp.width || 300;
              const height = comp.height || 200;
              const style: React.CSSProperties = { position: 'absolute', left: comp.x || 0, top: comp.y || 0, width, height };
              if (comp.type === 'heading') return <div key={comp.id} style={{ ...style, color: comp.color, fontSize: comp.level === 'h1' ? '2.5rem' : '1.5rem' }}>{comp.text}</div>;
              if (comp.type === 'text') return <div key={comp.id} style={{ ...style, fontSize: comp.fontSize || 16, color: comp.color || '#374151' }}>{comp.content}</div>;
              if (comp.type === 'image') return <img key={comp.id} src={comp.src} alt={comp.alt} style={{ ...style, borderRadius: comp.borderRadius, objectFit: 'cover' }} />;
              if (comp.type === 'button') return <div key={comp.id} style={{ ...style, backgroundColor: comp.bgColor, color: comp.textColor, borderRadius: comp.borderRadius, padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{comp.buttonText}</div>;
              if (comp.type === 'card') return (
                <div key={comp.id} style={{ ...style, backgroundColor: '#fff', borderRadius: comp.borderRadius || 12, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  {comp.imageUrl && <img src={comp.imageUrl} alt="" style={{ width: '100%', height: '60%', objectFit: comp.imageFit || 'cover' }} />}
                  <div style={{ padding: 16, height: '40%', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ fontSize: 18, fontWeight: 'bold', color: comp.titleColor || '#1f2937', marginBottom: 8 }}>{comp.title || '卡片标题'}</div>
                    <div style={{ fontSize: 14, color: comp.descColor || '#6b7280' }}>{comp.description || '卡片描述'}</div>
                  </div>
                </div>
              );
              if (comp.type === 'accordion') return (
                <div key={comp.id} style={{ ...style, backgroundColor: '#fff', borderRadius: comp.borderRadius || 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ padding: 16, backgroundColor: comp.accordionTitleColor || '#f3f4f6', fontWeight: 'bold', height: '50%' }}>{comp.accordionTitle || '点击展开'}</div>
                  <div style={{ padding: 16, color: comp.accordionContentColor || '#374151', height: '50%' }}>{comp.accordionContent || '隐藏内容'}</div>
                </div>
              );
              if (comp.type === 'quiz') return (
                <div key={comp.id} style={{ ...style, backgroundColor: '#fff', borderRadius: comp.borderRadius || 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', padding: 16, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontWeight: 'bold', color: comp.questionColor || '#1f2937', marginBottom: 12 }}>{comp.question || '问题'}</div>
                  <div style={{ color: comp.answerColor || '#059669', backgroundColor: '#d1fae5', padding: 12, borderRadius: 4 }}>{comp.answer || '答案'}</div>
                </div>
              );
              return null;
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {renderEditModal()}
      <div className="h-screen flex flex-col" onClick={() => setShowGridSettings(false)}>
        <div className="h-14 bg-white border-b flex items-center justify-between px-4">
          <h1 className="text-xl font-bold text-blue-600">CodeMyPage</h1>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg px-2">
              <button onClick={() => setZoom(Math.max(25, zoom - 25))} className="px-2 py-1 text-gray-600 hover:text-gray-800 font-bold">−</button>
              <span className="text-sm w-12 text-center">{zoom}%</span>
              <button onClick={() => setZoom(Math.min(200, zoom + 25))} className="px-2 py-1 text-gray-600 hover:text-gray-800 font-bold">+</button>
            </div>
            <button onClick={() => setShowPreview(true)} className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg"><Eye size={18} /> 预览</button>
            <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg"><Save size={18} /> 保存</button>
            <label className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg cursor-pointer hover:bg-orange-600"><Upload size={18} /> 导入<input type="file" accept=".json" onChange={handleLoad} className="hidden" /></label>
            <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg"><Download size={18} /> 导出HTML</button>
          </div>
        </div>
        <div className="flex-1 flex overflow-hidden">
          <ComponentPanel onAdd={handleAddComponent} />
          <WorkArea 
            ref={workAreaRef}
            canvasRef={canvasRef}
            components={components} 
            selectedId={selectedId} 
            onSelect={setSelectedId} 
            onDelete={handleDelete} 
            gridBackground={gridBackground}
            canvasBackground={gridSettings.canvasBackground}
            canvasBorderRadius={gridSettings.canvasBorderRadius}
            zoom={zoom}
            onDoubleClick={handleDoubleClick}
            onDragStart={handleWidgetDragStart}
            onDrag={handleWidgetDrag}
            onDragEnd={handleWidgetDragEnd}
            isDragging={isDragging}
            selectedComponentId={selectedId}
            onResizeStart={handleResizeStart}
            onResize={handleResize}
            onResizeEnd={handleResizeEnd}
            isResizing={isResizing}
          />
        </div>

        {selectedComponent && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-lg border">
              <button onClick={() => handleMoveUp(selectedId || "")} className="p-2 hover:bg-gray-100 rounded-full" title="上移一层"><ArrowUp size={18} /></button>
              <button onClick={() => handleMoveDown(selectedId || "")} className="p-2 hover:bg-gray-100 rounded-full" title="下移一层"><ArrowDown size={18} /></button>
              <div className="w-px h-6 bg-gray-200"></div>
              <button onClick={() => handleDuplicate(selectedId || "")} className="p-2 hover:bg-gray-100 rounded-full" title="复制"><Copy size={18} /></button>
              <button onClick={() => handleDelete(selectedId || "")} className="p-2 hover:bg-red-50 text-red-500 rounded-full" title="删除"><Trash2 size={18} /></button>
              <div className="w-px h-6 bg-gray-200"></div>
              <button onClick={() => setSelectedId(null)} className="px-3 py-1 hover:bg-gray-100 rounded-full text-sm">取消选择</button>
              {selectedComponent.type === 'card' && (
                <>
                  <div className="w-px h-6 bg-gray-200"></div>
                  <select 
                    value={selectedComponent.imageFit || 'cover'}
                    onChange={(e) => handleUpdateProperty(selectedId || "", { imageFit: e.target.value as 'cover' | 'contain' | 'fill' })}
                    className="border rounded-full px-2 py-1 text-sm"
                  >
                    <option value="cover">裁切</option>
                    <option value="contain">完整</option>
                    <option value="fill">拉伸</option>
                  </select>
                </>
              )}
            </div>
          </div>
        )}

        <div className="fixed bottom-6 right-6 z-50">
          <button 
            className="w-12 h-12 flex items-center justify-center bg-white rounded-full shadow-lg border cursor-pointer hover:bg-gray-50"
            onClick={(e) => { e.stopPropagation(); setShowGridSettings(!showGridSettings); }}
            title="画布设置"
          >
            <Grid3X3 size={22} />
          </button>
          {showGridSettings && (
            <div className="absolute bottom-full mb-2 right-0 bg-white rounded-xl shadow-lg border p-4 w-72" onClick={(e) => e.stopPropagation()}>
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm">
                  <input 
                    type="checkbox" 
                    checked={gridSettings.snapToGrid} 
                    onChange={(e) => handleGridChange({ snapToGrid: e.target.checked })}
                    className="w-4 h-4"
                  />
                  对齐网格
                </label>
                <div className="flex items-center gap-2 text-sm">
                  <span className="w-12">间距:</span>
                  <input 
                    type="range" 
                    min="0" 
                    max="60" 
                    value={gridSettings.dotSpacing}
                    onChange={(e) => handleGridChange({ dotSpacing: parseInt(e.target.value) })}
                    className="flex-1"
                  />
                  <span className="w-10 text-right text-xs">{gridSettings.dotSpacing}px</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="w-12">画布:</span>
                  <input 
                    type="color" 
                    value={gridSettings.canvasBackground} 
                    onChange={(e) => handleGridChange({ canvasBackground: e.target.value })}
                    className="w-8 h-8 rounded cursor-pointer border"
                  />
                  <span className="text-xs text-gray-500">{gridSettings.canvasBackground}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="w-12">背景:</span>
                  <input 
                    type="color" 
                    value={gridSettings.dotGridBackground} 
                    onChange={(e) => handleGridChange({ dotGridBackground: e.target.value })}
                    className="w-8 h-8 rounded cursor-pointer border"
                  />
                  <span className="text-xs text-gray-500">{gridSettings.dotGridBackground}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="w-12">圆角:</span>
                  <input 
                    type="range" 
                    min="0" 
                    max="60" 
                    value={gridSettings.canvasBorderRadius}
                    onChange={(e) => handleGridChange({ canvasBorderRadius: parseInt(e.target.value) })}
                    className="flex-1"
                  />
                  <span className="w-10 text-right text-xs">{gridSettings.canvasBorderRadius}px</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

const WorkArea = forwardRef<HTMLDivElement, any>(({ 
  components, 
  selectedId, 
  onSelect, 
  
  gridBackground,
  canvasBackground,
  canvasBorderRadius = 0,
  zoom = 100,
  onDoubleClick,
  onDragStart,
  onDrag,
  onDragEnd,
  isDragging,
  selectedComponentId,
  canvasRef,
  onResizeStart,
  onResize,
  onResizeEnd,
  isResizing
}, ref) => {
  const canvasHeight = Math.max(CANVAS_MIN_HEIGHT, ...components.map((c: WidgetProps) => (c.y || 0) + (c.height || 200) + 200));
  
  return (
    <div 
      ref={ref}
      className="flex-1 overflow-auto p-8" 
      style={gridBackground} 
      onClick={() => onSelect(null)}
      onMouseMove={(e) => { if (isResizing) onResize && onResize(e); else if (isDragging) onDrag && onDrag(e); }}
      onMouseUp={() => { if (isResizing) { onResizeEnd && onResizeEnd(); } else if (isDragging) { onDragEnd && onDragEnd(); } }}
      onMouseLeave={() => { if (isResizing) { onResizeEnd && onResizeEnd(); } else if (isDragging) { onDragEnd && onDragEnd(); } }}
    >
      <div 
        ref={canvasRef}
        className="relative mx-auto" 
        style={{ width: CANVAS_WIDTH, minHeight: canvasHeight, backgroundColor: canvasBackground, borderRadius: canvasBorderRadius, boxShadow: '0 4px 6px rgba(0,0,0,0.1)', zoom: `${zoom}%` }}
      >
        {components.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <div className="text-4xl mb-2">📦</div>
              <p>点击左侧组件添加到画布</p>
            </div>
          </div>
        ) : (
          components.map((c: WidgetProps) => (
            <DraggableWidget 
              key={c.id} 
              component={c} 
              isSelected={selectedId === c.id} 
              onSelect={() => onSelect(c.id)} 
             
              onDoubleClick={onDoubleClick}
              onDragStart={onDragStart}
              onResizeStart={onResizeStart}
              isDragging={isDragging && selectedComponentId === c.id}
            />
          ))
        )}
      </div>
    </div>
  );
});

function DraggableWidget({ component, isSelected, onSelect, onDoubleClick, onDragStart, onResizeStart, isDragging }: any) {
  const style: React.CSSProperties = { 
    position: 'absolute', 
    left: component.x || 0, 
    top: component.y || 0, 
    width: component.width || 300,
    height: component.height || 200,
    opacity: isDragging ? 0.5 : 1, 
    cursor: 'move', 
    zIndex: isSelected ? 100 : 1 
  };

  const getEditableField = () => {
    switch (component.type) {
      case 'heading': return { field: 'text', value: component.text || '' };
      case 'text': return { field: 'content', value: component.content || '' };
      case 'button': return { field: 'buttonText', value: component.buttonText || '' };
      case 'card': return { field: 'title', value: component.title || '' };
      case 'accordion': return { field: 'accordionTitle', value: component.accordionTitle || '' };
      case 'quiz': return { field: 'question', value: component.question || '' };
      default: return null;
    }
  };

  const editableField = getEditableField();

  const rc = () => {
    if (component.type === 'heading') return <div style={{ color: component.color || '#1f2937', fontSize: component.level === 'h1' ? '2.5rem' : '1.5rem', fontWeight: 'bold' }}>{component.text}</div>;
    if (component.type === 'text') return <div style={{ fontSize: component.fontSize || 16, color: component.color || '#374151', width: '100%', height: '100%' }}>{component.content}</div>;
    if (component.type === 'image') return <img src={component.src} alt={component.alt} style={{ width: '100%', height: '100%', borderRadius: component.borderRadius, objectFit: 'cover' }} />;
    if (component.type === 'button') return <div style={{ backgroundColor: component.bgColor, color: component.textColor, borderRadius: component.borderRadius, padding: '12px 24px', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{component.buttonText}</div>;
    if (component.type === 'card') return (
      <div style={{ width: '100%', height: '100%', backgroundColor: '#fff', borderRadius: component.borderRadius || 12, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {component.imageUrl && <img src={component.imageUrl} alt="" style={{ width: '100%', height: '60%', objectFit: component.imageFit || 'cover' }} />}
        <div style={{ padding: 16, height: '40%', display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 18, fontWeight: 'bold', color: component.titleColor || '#1f2937', marginBottom: 8 }}>{component.title || '卡片标题'}</div>
          <div style={{ fontSize: 14, color: component.descColor || '#6b7280' }}>{component.description || '卡片描述'}</div>
        </div>
      </div>
    );
    if (component.type === 'accordion') return (
      <div style={{ width: '100%', height: '100%', backgroundColor: '#fff', borderRadius: component.borderRadius || 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <div style={{ padding: 16, backgroundColor: component.accordionTitleColor || '#f3f4f6', fontWeight: 'bold' }}>{component.accordionTitle || '点击展开'}</div>
        <div style={{ padding: 16, color: component.accordionContentColor || '#374151' }}>{component.accordionContent || '隐藏内容'}</div>
      </div>
    );
    if (component.type === 'quiz') return (
      <div style={{ width: '100%', height: '100%', backgroundColor: '#fff', borderRadius: component.borderRadius || 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', padding: 16 }}>
        <div style={{ fontWeight: 'bold', color: component.questionColor || '#1f2937', marginBottom: 12 }}>{component.question || '问题'}</div>
        <div style={{ color: component.answerColor || '#059669', backgroundColor: '#d1fae5', padding: 12, borderRadius: 4 }}>{component.answer || '答案'}</div>
      </div>
    );
    return <div>未知</div>;
  };

  const needsDragHandle = component.type === 'image' || component.type === 'button';

  const handleComponentMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDragStart) onDragStart(e, component.id);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (editableField && onDoubleClick) {
      onDoubleClick(component.id, editableField.field, editableField.value);
    }
  };

  return (
    <div 
      style={style} 
      className={isSelected ? 'ring-2 ring-blue-500' : ''} 
      onClick={(e) => { e.stopPropagation(); onSelect(); }}
      onDoubleClick={handleDoubleClick}
      onMouseDown={handleComponentMouseDown}
    >
      {rc()}
      {needsDragHandle && (
        <div 
          style={{
            position: 'absolute', left: -10, top: -10, width: 20, height: 20,
            backgroundColor: '#3b82f6', borderRadius: '50%', cursor: 'move',
            border: '2px solid white', zIndex: 10, display: 'flex',
            alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
          }}
          onMouseDown={(e) => { e.stopPropagation(); onDragStart && onDragStart(e, component.id); }}
        >
          <Move size={10} color="white" />
        </div>
      )}
      {isSelected && (
        <div 
          style={{
            position: 'absolute', right: -6, bottom: -6, width: 12, height: 12,
            backgroundColor: '#3b82f6', borderRadius: '50%', cursor: 'se-resize',
            border: '2px solid white'
          }}
          onMouseDown={(e) => { e.stopPropagation(); onResizeStart && onResizeStart(e, component.id); }}
        />
      )}
    </div>
  );
}

export default App;
