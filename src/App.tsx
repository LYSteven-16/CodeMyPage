import React, { useState, useRef, forwardRef } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ComponentPanel } from './components/Editor/ComponentPanel';
import { ComponentEditor } from './components/Editor/ComponentEditor';
import { ComponentRenderer } from './components/ComponentRenderer';
import { PreviewPage } from './PreviewPage';
import type { WidgetProps, ComponentPanelItem } from './types';
import { Download, Eye, Trash2, Copy, ArrowUp, ArrowDown, Grid3X3, Move, Save, Upload, X, AlertTriangle, Zap, FileText, Github } from 'lucide-react';

type ExportOption = 'interactive' | 'github' | 'static';

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
  // 检测是否是预览模式
  const isPreviewMode = window.location.pathname.endsWith('/preview');
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
  const [showStaticWarning, setShowStaticWarning] = useState(false);
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

  const renderComponentToHTML = (comp: WidgetProps): string => {
    const style: React.CSSProperties = {
      position: 'absolute',
      left: comp.x || 0,
      top: comp.y || 0,
      width: comp.width || 300,
      height: comp.height || 200
    };
    return renderToStaticMarkup(<ComponentRenderer component={comp} style={style} mode="preview" />);
  };

  const INTERACTION_SCRIPTS = `
    window.toggleAccordion=function(id){var h=document.getElementById('accordion-header-'+id),c=document.getElementById('accordion-content-'+id),i=document.getElementById('accordion-icon-'+id);if(!h||!c||!i)return;var collapsed=h.getAttribute('data-collapsed')==='true';if(collapsed){c.style.maxHeight=c.scrollHeight+'px';c.style.opacity='1';i.style.transform='rotate(180deg)';h.style.borderBottom='1px solid #e5e7eb';h.setAttribute('data-collapsed','false');}else{c.style.maxHeight='0';c.style.opacity='0';i.style.transform='rotate(0deg)';h.style.borderBottom='none';h.setAttribute('data-collapsed','true');}};
    document.querySelectorAll('[id^="accordion-header-"]').forEach(function(h){var c=document.getElementById(h.id.replace('header-','content-'));if(c){c.style.maxHeight='0';c.style.opacity='0';c.style.overflow='hidden';c.style.transition='max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease';}});
    window.toggleQuiz=function(id){var a=document.getElementById('quiz-answer-'+id);if(!a)return;if(a.innerHTML==='点击查看答案'||a.getAttribute('data-shown')!=='true'){a.style.opacity='1';a.innerHTML=a.getAttribute('data-answer')||'答案';a.setAttribute('data-shown','true');}else{a.style.opacity='0.5';a.innerHTML='点击查看答案';a.setAttribute('data-shown','false');}};
    window.selectChoice=function(id,idx){var result=document.getElementById('choice-result-'+id);if(!result)return;var opts=result.parentElement.querySelectorAll('[id^="choice-opt-"]');opts.forEach(function(opt){opt.style.background='#fff';opt.style.borderColor='#e5e7eb';opt.style.color='#374151';opt.innerHTML='○ '+opt.textContent.replace(/^[✓✗]\\s*/,'');});var correct=parseInt(result.parentElement.getAttribute('data-correct')||'0');opts[correct].style.background='#d1fae5';opts[correct].style.borderColor='#10b981';opts[correct].innerHTML='✓ '+opts[correct].textContent.replace(/^[✓✗]\\s*/,'');if(idx===correct){opts[idx].style.background='#d1fae5';opts[idx].style.borderColor='#10b981';opts[idx].innerHTML='✓ '+opts[idx].textContent.replace(/^[✓✗]\\s*/,'');result.innerHTML='<span style="color:#059669">✓ 回答正确！</span>';}else{opts[idx].style.background='#fee2e2';opts[idx].style.borderColor='#ef4444';opts[idx].innerHTML='✗ '+opts[idx].textContent.replace(/^[✓✗]\\s*/,'');result.innerHTML='<span style="color:#dc2626">✗ 回答错误，再试试！</span>';}};
    window.answerTF=function(id,answer,btn){var container=document.getElementById('truefalse-'+id);var isCorrect=container.getAttribute('data-correct')==='true';var result=document.getElementById('truefalse-result-'+id);var trueBtn=document.getElementById('tf-true-'+id);var falseBtn=document.getElementById('tf-false-'+id);trueBtn.style.background='#fff';trueBtn.style.borderColor='#e5e7eb';falseBtn.style.background='#fff';falseBtn.style.borderColor='#e5e7eb';if(answer===isCorrect){btn.style.background='#d1fae5';btn.style.borderColor='#10b981';result.innerHTML='<span style="color:#059669">✓ 回答正确！</span>';}else{btn.style.background='#fee2e2';btn.style.borderColor='#ef4444';result.innerHTML='<span style="color:#dc2626">✗ 回答错误！</span>';}};
    window.setDrawMode=function(id,mode){var penBtn=document.getElementById('pen-btn-'+id);var eraserBtn=document.getElementById('eraser-btn-'+id);var canvas=document.getElementById('canvas-'+id);if(!canvas)return;canvas.setAttribute('data-mode',mode);if(mode==='pen'){if(penBtn){penBtn.style.background='#fff';penBtn.style.color='#8B4513';penBtn.style.borderColor='#fff';}if(eraserBtn){eraserBtn.style.background='#A0522D';eraserBtn.style.color='#fff';eraserBtn.style.borderColor='#A0522D';}}else{if(eraserBtn){eraserBtn.style.background='#fff';eraserBtn.style.color='#8B4513';eraserBtn.style.borderColor='#fff';}if(penBtn){penBtn.style.background='#A0522D';penBtn.style.color='#fff';penBtn.style.borderColor='#A0522D';}}};
    window.clearDrawing=function(id){var canvas=document.getElementById('canvas-'+id);if(!canvas)return;var ctx=canvas.getContext('2d');ctx.clearRect(0,0,canvas.width,canvas.height);};
    (function(){function initCanvas(id){var canvas=document.getElementById('canvas-'+id);if(!canvas)return;var ctx=canvas.getContext('2d');var drawing=false;var lastX=0,lastY=0;function resize(){var container=canvas.parentElement;canvas.width=container.offsetWidth;canvas.height=container.offsetHeight;}resize();window.addEventListener('resize',resize);function getPos(e){var rect=canvas.getBoundingClientRect();if(e.touches)return{x:e.touches[0].clientX-rect.left,y:e.touches[0].clientY-rect.top};return{x:e.clientX-rect.left,y:e.clientY-rect.top};}canvas.addEventListener('mousedown',function(e){drawing=true;var pos=getPos(e);lastX=pos.x;lastY=pos.y;});canvas.addEventListener('mousemove',function(e){if(!drawing)return;var pos=getPos(e);ctx.beginPath();ctx.moveTo(lastX,lastY);ctx.lineTo(pos.x,pos.y);var mode=canvas.getAttribute('data-mode');if(mode==='eraser'){ctx.strokeStyle='#1a472a';ctx.lineWidth=30;}else{ctx.strokeStyle=document.getElementById('color-'+id).value;ctx.lineWidth=parseInt(document.getElementById('size-'+id).value);}ctx.lineCap='round';ctx.lineJoin='round';ctx.stroke();lastX=pos.x;lastY=pos.y;});canvas.addEventListener('mouseup',function(){drawing=false;});canvas.addEventListener('mouseleave',function(){drawing=false;});canvas.addEventListener('touchstart',function(e){e.preventDefault();drawing=true;var pos=getPos(e);lastX=pos.x;lastY=pos.y;},{passive:false});canvas.addEventListener('touchmove',function(e){e.preventDefault();if(!drawing)return;var pos=getPos(e);ctx.beginPath();ctx.moveTo(lastX,lastY);ctx.lineTo(pos.x,pos.y);var mode=canvas.getAttribute('data-mode');if(mode==='eraser'){ctx.strokeStyle='#1a472a';ctx.lineWidth=30;}else{ctx.strokeStyle=document.getElementById('color-'+id).value;ctx.lineWidth=parseInt(document.getElementById('size-'+id).value);}ctx.lineCap='round';ctx.lineJoin='round';ctx.stroke();lastX=pos.x;lastY=pos.y;},{passive:false});canvas.addEventListener('touchend',function(){drawing=false;});}document.querySelectorAll('[id^="canvas-"]').forEach(function(c){initCanvas(c.id.replace('canvas-',''));});})();
    window.switchTab=function(id,index){var container=document.getElementById('tabs-'+id);if(!container)return;var tabs=container.querySelectorAll('.tab-btn');var contents=container.querySelectorAll('.tab-content');tabs.forEach(function(tab,i){if(i===index){tab.style.borderBottom='2px solid #3b82f6';tab.style.color='#3b82f6';tab.style.fontWeight='bold';}else{tab.style.borderBottom='2px solid transparent';tab.style.color='#6b7280';tab.style.fontWeight='normal';}});contents.forEach(function(content,i){content.style.display=i===index?'block':'none';});};
    window.toggleCheck=function(id,idx){var checkbox=document.getElementById('check-'+id+'-'+idx);var textSpan=checkbox.nextElementSibling;var status=document.getElementById('check-status-'+id+'-'+idx);if(checkbox.checked){textSpan.style.textDecoration='line-through';textSpan.style.color='#9ca3af';if(status)status.textContent='已完成';}else{textSpan.style.textDecoration='none';textSpan.style.color='#374151';if(status)status.textContent='';}};
  `;

  const generateHTML = () => {
    const canvasHeight = Math.max(CANVAS_MIN_HEIGHT, ...components.map((c: WidgetProps) => (c.y || 0) + (c.height || 200) + 200));
    const initScript = `
      document.addEventListener('DOMContentLoaded', function() {
        document.querySelectorAll('[id^="accordion-header-"]').forEach(function(h) {
          var c = document.getElementById(h.id.replace('header-', 'content-'));
          if(c) {
            c.style.maxHeight = '0';
            c.style.opacity = '0';
            c.style.overflow = 'hidden';
            c.style.transition = 'max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease';
          }
        });
        
        document.querySelectorAll('[id^="accordion-header-"]').forEach(function(h) {
          h.addEventListener('click', function() {
            var id = h.id.replace('accordion-header-', '');
            window.toggleAccordion(id);
          });
        });
        
        document.querySelectorAll('[id^="quiz-show-"]').forEach(function(btn) {
          btn.addEventListener('click', function() {
            var id = btn.id.replace('quiz-show-', '');
            window.toggleQuiz(id);
          });
        });
        
        document.querySelectorAll('[id^="choice-opt-"]').forEach(function(opt) {
          opt.style.cursor = 'pointer';
          opt.addEventListener('click', function() {
            var resultEl = opt.parentElement.querySelector('[id^="choice-result-"]');
            if(resultEl) {
              var id = resultEl.id.replace('choice-result-', '');
              var match = opt.id.match(/^choice-opt-.+-(\d+)$/);
              if(match) {
                var idx = parseInt(match[1]);
                window.selectChoice(id, idx);
              }
            }
          });
        });
        
        document.querySelectorAll('[id^="tf-true-"], [id^="tf-false-"]').forEach(function(btn) {
          btn.addEventListener('click', function() {
            var id = btn.id.replace('tf-true-', '').replace('tf-false-', '');
            var answer = btn.id.includes('true');
            window.answerTF(id, answer, btn);
          });
        });
        
        document.querySelectorAll('.tab-btn').forEach(function(tab, index) {
          tab.style.cursor = 'pointer';
          tab.addEventListener('click', function() {
            var tabsContainer = tab.closest('[id^="tabs-"]');
            if(tabsContainer) {
              var id = tabsContainer.id.replace('tabs-', '');
              window.switchTab(id, index);
            }
          });
        });
        
        document.querySelectorAll('[id^="check-"]').forEach(function(cb) {
          if(cb.type === 'checkbox') {
            cb.addEventListener('change', function() {
              var match = cb.id.match(/^check-(.+)-(\d+)$/);
              if(match) {
                var id = match[1];
                var idx = parseInt(match[2]);
                window.toggleCheck(id, idx);
              }
            });
          }
        });
        
        document.querySelectorAll('[id^="canvas-"]').forEach(function(canvas) {
          var id = canvas.id.replace('canvas-', '');
          if(typeof initCanvas === 'function') initCanvas(id);
        });
      });
    `;
    return `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>我的网页</title><script src="https://cdn.tailwindcss.com"></script><style>body{margin:0;min-height:100vh;position:relative;background:${gridSettings.dotGridBackground}}.page-container{position:relative;width:${CANVAS_WIDTH}px;margin:0 auto;background:${gridSettings.canvasBackground};min-height:${canvasHeight}px;border-radius:${gridSettings.canvasBorderRadius}px}</style></head><body><div class="page-container">${components.map(c => renderComponentToHTML(c)).join('\n')}</div><script>${INTERACTION_SCRIPTS}${initScript}</script></body></html>`;
  };

  const generateInteractiveHTML = () => {
    try {
      setExportLoading(true);
      setExportError(null);
      
      const html = generateHTML();
      
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'my-page.html'; a.click();
      URL.revokeObjectURL(url);
      
      setExportLoading(false);
    } catch (error: any) {
      console.error('Export failed:', error);
      setExportLoading(false);
      setExportError(error.message || '导出失败');
      alert(error.message || '导出失败');
    }
  };


  const generateGitHubPagesHTML = () => {
    try {
      const html = generateHTML();
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'github-pages.html'; a.click();
      URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Export failed:', error);
      alert(error.message || '导出失败');
    }
  };

  const handleExportStatic = () => {
    const html = generateHTML();
    const b = new Blob([html], { type: 'text/html' });
    const u = URL.createObjectURL(b);
    const a = document.createElement('a'); a.href = u; a.download = 'my-page-static.html'; a.click();
    setShowStaticWarning(false);
    setShowExportModal(false);
  };

  const handleExport = (option: ExportOption) => {
    if (option === 'static') {
      setShowStaticWarning(true);
    } else if (option === 'interactive') {
      generateInteractiveHTML();
    } else if (option === 'github') {
      generateGitHubPagesHTML();
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
              window.open('/CodeMyPage/preview', '_blank');
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
        <StaticWarningModal
          isOpen={showStaticWarning}
          onClose={() => setShowStaticWarning(false)}
          onConfirm={handleExportStatic}
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
      <ComponentRenderer component={component} style={innerStyle} />
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
                <h3 className="font-bold text-gray-800">完整交互单文件</h3>
                <p className="text-sm text-gray-500">双击打开即可使用</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 ml-13">
              导出一个包含完整 React 运行时的 HTML 文件，所有组件功能均可正常使用。文件较大（约1-2MB），但无需任何依赖。
            </p>
          </div>
          
          <div 
            className="p-4 border-2 border-gray-200 rounded-xl hover:border-purple-500 cursor-pointer transition-colors"
            onClick={() => onSelect('github')}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                <Github size={20} color="white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">一键部署 GitHub Pages</h3>
                <p className="text-sm text-gray-500">免费托管到互联网</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 ml-13">
              导出一个可一键部署到 GitHub Pages 的文件，包含详细的部署说明。免费托管，可通过链接分享给任何人。
            </p>
          </div>
          
          <div 
            className="p-4 border-2 border-gray-200 rounded-xl hover:border-gray-400 cursor-pointer transition-colors"
            onClick={() => onSelect('static')}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gray-500 rounded-lg flex items-center justify-center">
                <FileText size={20} color="white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">纯静态网页</h3>
                <p className="text-sm text-gray-500">仅保留视觉效果</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 ml-13">
              导出纯静态 HTML，视觉效果完整，但所有交互功能（如点击、输入、拖拽）将不可用。
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

const StaticWarningModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}> = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
              <AlertTriangle size={24} className="text-amber-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">导出纯静态网页</h2>
              <p className="text-sm text-gray-500">重要提示</p>
            </div>
          </div>
          
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-amber-800">
              <strong>您即将导出一个纯静态网页。</strong>
            </p>
            <ul className="text-sm text-amber-700 mt-2 space-y-1 list-disc list-inside">
              <li>所有组件的交互功能将不可用</li>
              <li>黑板无法写字、排序无法拖拽</li>
              <li>按钮点击、输入框输入等都无法使用</li>
              <li>仅保留静态视觉效果</li>
            </ul>
          </div>
          
          <p className="text-sm text-gray-600 mb-6">
            如果您需要保留交互功能，请选择「完整交互单文件」选项。
          </p>
          
          <div className="flex gap-3">
            <button 
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button 
              onClick={onConfirm}
              className="flex-1 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
            >
              确认导出
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
