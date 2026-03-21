import React, { useState, useRef, forwardRef, useEffect } from 'react';
import { ComponentPanel } from './components/Editor/ComponentPanel';
import { ComponentEditor } from './components/Editor/ComponentEditor';
import { ComponentRenderer } from './components/ComponentRenderer';
import { PreviewPage } from './PreviewPage';
import type { WidgetProps, ComponentPanelItem } from './types';
import { Download, Eye, Trash2, Copy, ArrowUp, ArrowDown, Grid3X3, Move, Save, Upload, X, Zap, FileText } from 'lucide-react';

type ExportOption = 'interactive' | 'pdf';

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
  // 检测是否是预览模式（使用查询参数避免 GitHub Pages 404）
  const urlParams = new URLSearchParams(window.location.search);
  const isPreviewMode = urlParams.get('preview') === 'true';
  if (isPreviewMode) {
    return <PreviewPage />;
  }
  
  const [components, setComponents] = useState< WidgetProps[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [showGridSettings, setShowGridSettings] = useState(false);
  const [showBgSettings, setShowBgSettings] = useState(false);
  const [showCanvasSettings, setShowCanvasSettings] = useState(false);
  const [showComponentEditor, setShowComponentEditor] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
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

  useEffect(() => {
    const preventTouchGestures = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };
    
    let lastTouchEnd = 0;
    const preventDoubleTap = (e: TouchEvent) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    };
    
    document.addEventListener('touchstart', preventTouchGestures, { passive: false });
    document.addEventListener('touchmove', preventTouchGestures, { passive: false });
    document.addEventListener('touchend', preventDoubleTap, { passive: false });
    
    return () => {
      document.removeEventListener('touchstart', preventTouchGestures);
      document.removeEventListener('touchmove', preventTouchGestures);
      document.removeEventListener('touchend', preventDoubleTap);
    };
  }, []);

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


  const generateInteractiveHTML = async () => {
    try {
      setExportLoading(true);
      setExportError(null);
      
      const projectData = {
        components: JSON.parse(JSON.stringify(components)),
        gridSettings: JSON.parse(JSON.stringify(gridSettings)),
        canvasWidth: 1440,
        title: '我的网页'
      };
      
      const isProduction = import.meta.env.PROD;
      let html = '';
      
      if (isProduction) {
        const jsResponse = await fetch('/CodeMyPage/assets/export-entry.js');
        if (!jsResponse.ok) {
          throw new Error('无法获取导出资源，请确保已构建导出组件');
        }
        const jsContent = await jsResponse.text();
        
        let cssContent = '';
        try {
          const cssResponse = await fetch('/CodeMyPage/assets/export-entry.css');
          if (cssResponse.ok) {
            cssContent = await cssResponse.text();
          }
        } catch (e) {
          console.warn('CSS not found, continuing without it');
        }
        
        const title = projectData.title || '我的网页';
        html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    * { box-sizing: border-box; }
    body { 
      margin: 0; 
      min-height: 100vh; 
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    }
    .page-container { 
      position: relative; 
      margin: 0 auto; 
    }
  </style>
  <style>
${cssContent}
  </style>
</head>
<body>
  <div id="root"></div>
  <script>
    window.__PROJECT_DATA__ = ${JSON.stringify(projectData)};
  </script>
  <script src="https://unpkg.com/react@18/umd/react.production.min.js" crossorigin></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js" crossorigin></script>
  <script>
${jsContent}
  </script>
</body>
</html>`;
      } else {
        const response = await fetch('/CodeMyPage/api/export', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ projectData, type: 'interactive' })
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `导出失败: ${response.status}`);
        }
        
        html = await response.text();
      }
      
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'my-page-interactive.html'; a.click();
      URL.revokeObjectURL(url);
      
      setExportLoading(false);
    } catch (error: any) {
      console.error('Export failed:', error);
      setExportLoading(false);
      setExportError(error.message || '导出失败');
      alert(error.message || '导出失败');
    }
  };

  const generatePDF = async () => {
    try {
      setExportLoading(true);
      setExportError(null);

      const { generateVectorPDF } = await import('./utils/pdfRenderer');
      await generateVectorPDF(components, {
        dotGridBackground: gridSettings.dotGridBackground,
        canvasBackground: gridSettings.canvasBackground,
        canvasBorderRadius: gridSettings.canvasBorderRadius
      });

      setExportLoading(false);
      setShowExportModal(false);
    } catch (error: any) {
      console.error('PDF export failed:', error);
      setExportLoading(false);
      setExportError(error.message || 'PDF导出失败');
      alert(error.message || 'PDF导出失败');
    }
  };

  const handleExport = (option: ExportOption) => {
    if (option === 'interactive') {
      generateInteractiveHTML();
    } else if (option === 'pdf') {
      generatePDF();
    }
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
    if (editingComponent) return;
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
    
    const handleCloseWithSave = () => {
      if (editingComponent) {
        handleUpdateProperty(editingComponent.id, { [editingComponent.field]: editingComponent.value });
        setEditingComponent(null);
      }
    };
    
    return (
      <div 
        className="fixed inset-0 bg-black/50 flex items-center justify-center" 
        style={{ zIndex: 9999 }}
        onClick={handleCloseWithSave}
      >
        <div 
          className="bg-white rounded-xl p-6 w-96 shadow-2xl" 
          style={{ zIndex: 10000 }}
          onClick={(e) => e.stopPropagation()}
        >
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
        <div className="py-8 px-4 flex justify-center overflow-auto">
          <div style={{ position: 'relative', width: CANVAS_WIDTH, minHeight: previewHeight, backgroundColor: gridSettings.canvasBackground, borderRadius: gridSettings.canvasBorderRadius, margin: '0 auto' }}>
            {components.map(comp => {
              const width = comp.width || 300;
              const height = comp.height || 200;
              const style: React.CSSProperties = { position: 'absolute', left: comp.x || 0, top: comp.y || 0, width, height };
              return <ComponentRenderer key={comp.id} component={comp} style={style} />;
            })}
          </div>
        </div>
      </div>
    );
  }


  return (
    <>
      {renderEditModal()}
      <div className="h-screen flex flex-col">
        <div className="h-14 bg-white border-b flex items-center justify-between px-4" onClick={() => { setShowGridSettings(false); setShowBgSettings(false); setShowCanvasSettings(false); }}>
          <h1 className="text-xl font-bold text-blue-600">CodeMyPage</h1>
          <div className="flex items-center gap-2">
            {/* 网格设置 */}
            <div className="relative">
              <button 
                onClick={(e) => { e.stopPropagation(); setShowGridSettings(!showGridSettings); setShowBgSettings(false); setShowCanvasSettings(false); }}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full border ${showGridSettings ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-200'} hover:bg-gray-50`}
              >
                <Grid3X3 size={16} />
                <span className="text-sm">网格</span>
              </button>
              {showGridSettings && (
                <div className="absolute top-full mt-2 left-0 bg-white rounded-xl shadow-lg border p-3 w-64 z-50" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium">网格设置</span>
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={gridSettings.snapToGrid} onChange={(e) => handleGridChange({ snapToGrid: e.target.checked })} className="w-4 h-4 accent-blue-500" />
                      启用对齐
                    </label>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="w-14 text-gray-600">间距</span>
                      <input type="range" min="0" max="60" value={gridSettings.dotSpacing} onChange={(e) => handleGridChange({ dotSpacing: parseInt(e.target.value) })} className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                      <span className="w-12 text-right text-xs text-gray-500">{gridSettings.dotSpacing}px</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* 背景颜色 */}
            <div className="relative">
              <button 
                onClick={(e) => { e.stopPropagation(); setShowBgSettings(!showBgSettings); setShowGridSettings(false); setShowCanvasSettings(false); }}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full border ${showBgSettings ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-200'} hover:bg-gray-50`}
              >
                <div className="w-4 h-4 rounded border" style={{ backgroundColor: gridSettings.dotGridBackground }}></div>
                <span className="text-sm">背景</span>
              </button>
              {showBgSettings && (
                <div className="absolute top-full mt-2 left-0 bg-white rounded-xl shadow-lg border p-3 w-64 z-50" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">背景颜色</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600">颜色</span>
                    <input type="color" value={gridSettings.dotGridBackground} onChange={(e) => handleGridChange({ dotGridBackground: e.target.value })} className="w-10 h-10 rounded-lg cursor-pointer border-2 border-gray-200" />
                    <span className="text-xs text-gray-500 font-mono">{gridSettings.dotGridBackground}</span>
                  </div>
                </div>
              )}
            </div>
            
            {/* 画布颜色 */}
            <div className="relative">
              <button 
                onClick={(e) => { e.stopPropagation(); setShowCanvasSettings(!showCanvasSettings); setShowGridSettings(false); setShowBgSettings(false); }}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full border ${showCanvasSettings ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-200'} hover:bg-gray-50`}
              >
                <div className="w-4 h-4 rounded border" style={{ backgroundColor: gridSettings.canvasBackground }}></div>
                <span className="text-sm">画布</span>
              </button>
              {showCanvasSettings && (
                <div className="absolute top-full mt-2 left-0 bg-white rounded-xl shadow-lg border p-3 w-64 z-50" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">画布设置</span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-600 w-14">颜色</span>
                      <input type="color" value={gridSettings.canvasBackground} onChange={(e) => handleGridChange({ canvasBackground: e.target.value })} className="w-10 h-10 rounded-lg cursor-pointer border-2 border-gray-200" />
                      <span className="text-xs text-gray-500 font-mono">{gridSettings.canvasBackground}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 w-14">圆角</span>
                      <input type="range" min="0" max="60" value={gridSettings.canvasBorderRadius} onChange={(e) => handleGridChange({ canvasBorderRadius: parseInt(e.target.value) })} className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                      <span className="w-12 text-right text-xs text-gray-500">{gridSettings.canvasBorderRadius}px</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button onClick={() => {
              sessionStorage.setItem('previewComponents', JSON.stringify(components));
              sessionStorage.setItem('previewGridSettings', JSON.stringify(gridSettings));
              window.open('/CodeMyPage/?preview=true', '_blank');
            }} className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg"><Eye size={18} /> 预览</button>
            <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg"><Save size={18} /> 保存</button>
            <label className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg cursor-pointer hover:bg-orange-600"><Upload size={18} /> 导入<input type="file" accept=".json" onChange={handleLoad} className="hidden" /></label>
            <button onClick={() => setShowExportModal(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg"><Download size={18} /> 导出HTML</button>
          </div>
        </div>
        <div className={`flex-1 flex overflow-hidden transition-all ${showComponentEditor ? 'mr-80' : ''}`} onClick={() => { setShowGridSettings(false); setShowBgSettings(false); setShowCanvasSettings(false); setShowComponentEditor(false); }}>
          <ComponentPanel onAdd={handleAddComponent} />
          <WorkArea 
            onClick={() => { setShowGridSettings(false); setShowBgSettings(false); setShowCanvasSettings(false); setShowComponentEditor(false); }}
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
          <>
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
              <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-lg border">
                <button onClick={() => handleMoveUp(selectedId || "")} className="p-2 hover:bg-gray-100 rounded-full" title="上移一层"><ArrowUp size={18} /></button>
                <button onClick={() => handleMoveDown(selectedId || "")} className="p-2 hover:bg-gray-100 rounded-full" title="下移一层"><ArrowDown size={18} /></button>
                <div className="w-px h-6 bg-gray-200"></div>
                <button onClick={() => handleDuplicate(selectedId || "")} className="p-2 hover:bg-gray-100 rounded-full" title="复制"><Copy size={18} /></button>
                <button onClick={() => handleDelete(selectedId || "")} className="p-2 hover:bg-red-50 text-red-500 rounded-full" title="删除"><Trash2 size={18} /></button>
                <div className="w-px h-6 bg-gray-200"></div>
                <button 
                  onClick={() => setShowComponentEditor(!showComponentEditor)} 
                  className={`px-3 py-1 rounded-full text-sm ${showComponentEditor ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}`}
                >
                  属性
                </button>
                <button onClick={() => setSelectedId(null)} className="px-3 py-1 hover:bg-gray-100 rounded-full text-sm">取消</button>
              </div>
            </div>
            {showComponentEditor && (
              <ComponentEditor 
                component={selectedComponent} 
                onUpdate={(updates) => handleUpdateProperty(selectedId || "", updates)}
                onClose={() => setShowComponentEditor(false)}
              />
            )}
          </>
        )}

        {/* 右下角：画布尺寸 + 缩放 */}
        <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3">
          <div className="flex items-center gap-1 px-3 py-1.5 bg-white/90 rounded-full shadow border">
            <span className="text-xs text-gray-500">{CANVAS_WIDTH} × {CANVAS_MIN_HEIGHT}</span>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 bg-white/90 rounded-full shadow border">
            <button onClick={() => setZoom(Math.max(25, zoom - 25))} className="w-6 h-6 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-full font-bold">−</button>
            <span className="text-xs text-gray-600 w-10 text-center">{zoom}%</span>
            <button onClick={() => setZoom(Math.min(200, zoom + 25))} className="w-6 h-6 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-full font-bold">+</button>
          </div>
        </div>

        <ExportModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          onSelect={handleExport}
          loading={exportLoading}
          error={exportError}
        />
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
  
  const handlePointerMove = (e: React.PointerEvent) => {
    if (isResizing) {
      onResize && onResize(e as any);
    } else if (isDragging) {
      onDrag && onDrag(e as any);
    }
  };
  
  const handlePointerUp = () => {
    if (isResizing) {
      onResizeEnd && onResizeEnd();
    } else if (isDragging) {
      onDragEnd && onDragEnd();
    }
  };
  
  return (
    <div 
      ref={ref}
      className="flex-1 overflow-auto p-8" 
      style={gridBackground} 
      onClick={() => onSelect(null)}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onPointerCancel={handlePointerUp}
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
      case 'card': return { field: 'cardTitle', value: component.cardTitle || component.title || '' };
      case 'accordion': return { field: 'accordionTitle', value: component.accordionTitle || '' };
      case 'quiz': return { field: 'question', value: component.question || '' };
      case 'choice': return { field: 'question', value: component.question || '' };
      case 'fillBlank': return { field: 'content', value: component.content || '' };
      case 'trueFalse': return { field: 'statement', value: component.statement || '' };
      case 'quote': return { field: 'quoteText', value: component.quoteText || '' };
      case 'code': return { field: 'code', value: component.code || '' };
      case 'tag': return { field: 'tagText', value: component.tagText || '' };
      case 'alert': return { field: 'alertContent', value: component.alertContent || '' };
      default: return null;
    }
  };

  const editableField = getEditableField();

  const innerStyle: React.CSSProperties = {
    width: '100%',
    height: '100%'
  };

  const needsDragHandle = false;

  const handleComponentPointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    if (onDragStart) onDragStart(e as any, component.id);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (editableField && onDoubleClick) {
      onDoubleClick(component.id, editableField.field, editableField.value);
    }
  };

  return (
    <div 
      style={{...style, touchAction: 'none'}} 
      className={isSelected ? 'ring-2 ring-blue-500' : ''} 
      onClick={(e) => { e.stopPropagation(); onSelect(); }}
      onDoubleClick={handleDoubleClick}
      onPointerDown={handleComponentPointerDown}
    >
      <ComponentRenderer component={component} style={innerStyle} />
      {needsDragHandle && (
        <div 
          style={{
            position: 'absolute', left: -10, top: -10, width: 20, height: 20,
            backgroundColor: '#3b82f6', borderRadius: '50%', cursor: 'move',
            border: '2px solid white', zIndex: 10, display: 'flex',
            alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
          }}
          onPointerDown={(e) => { e.stopPropagation(); onDragStart && onDragStart(e as any, component.id); }}
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
          onPointerDown={(e) => { e.stopPropagation(); onResizeStart && onResizeStart(e as any, component.id); }}
        />
      )}
    </div>
  );
}

const ExportModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSelect: (option: ExportOption) => void;
  loading: boolean;
  error: string | null;
}> = ({ isOpen, onClose, onSelect, loading, error }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">导出选项</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full"><X size={20} /></button>
        </div>
        
        <div className="p-6 space-y-4">
          <div 
            className="p-4 border-2 border-blue-200 rounded-xl hover:border-blue-500 cursor-pointer transition-colors bg-blue-50/30"
            onClick={() => onSelect('interactive')}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <Zap size={20} color="white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">导出完整HTML</h3>
                <p className="text-sm text-gray-500">可分享的交互式网页</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 ml-13">
              导出一个包含完整 React 运行时的 HTML 文件，所有组件功能均可正常使用。可以直接双击打开浏览，也可上传到 GitHub Pages 或任意静态托管平台分享给任何人。
            </p>
          </div>
          
          <div 
            className="p-4 border-2 border-gray-200 rounded-xl hover:border-orange-500 cursor-pointer transition-colors"
            onClick={() => onSelect('pdf')}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                <FileText size={20} color="white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">导出PDF文件</h3>
                <p className="text-sm text-gray-500">完全静态的PDF文档</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 ml-13">
              将当前页面导出为 PDF 文件，完全静态快照，所有交互功能不可用，但适合打印或存档。
            </p>
          </div>
        </div>
        
        {loading && (
          <div className="px-6 pb-4">
            <div className="bg-blue-100 text-blue-700 px-4 py-3 rounded-lg text-sm">
              正在构建项目并生成文件，请稍候...
            </div>
          </div>
        )}
        {error && (
          <div className="px-6 pb-4">
            <div className="bg-red-100 text-red-700 px-4 py-3 rounded-lg text-sm">
              <strong>导出失败：</strong>{error}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
