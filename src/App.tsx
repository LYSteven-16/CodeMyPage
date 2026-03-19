import React, { useState, useRef, forwardRef } from 'react';
import { ComponentPanel } from './components/Editor/ComponentPanel';
import { ComponentEditor } from './components/Editor/ComponentEditor';
import { PreviewPage } from './PreviewPage';
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

  const generateHTML = () => {
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
          return `<img src="${comp.src || ''}" draggable="false" ondragstart="return false" style="width:${width}px;height:${height}px;position:absolute;left:${left}px;top:${top}px;border-radius:${comp.borderRadius || 0}px;object-fit:cover;user-select:none">`;
        case 'button':
          return comp.link ? `<a href="${comp.link}" ${comp.openNewTab ? 'target="_blank"' : ''} style="display:block;background-color:${comp.bgColor || '#3b82f6'};color:${comp.textColor || '#fff'};border-radius:${comp.borderRadius || 8}px;padding:12px 24px;position:absolute;left:${left}px;top:${top}px;width:${width}px;height:${height}px;display:flex;align-items:center;justify-content:center;text-decoration:none">${comp.buttonText || '按钮'}</a>` : `<div style="background-color:${comp.bgColor || '#3b82f6'};color:${comp.textColor || '#fff'};border-radius:${comp.borderRadius || 8}px;padding:12px 24px;position:absolute;left:${left}px;top:${top}px;width:${width}px;height:${height}px;display:flex;align-items:center;justify-content:center;cursor:pointer">${comp.buttonText || '按钮'}</div>`;
        case 'card':
          return comp.link ? `<a href="${comp.link}" ${comp.openNewTab ? 'target="_blank"' : ''} style="display:block;text-decoration:none;position:absolute;left:${left}px;top:${top}px;width:${width}px;height:${height}px;background:#fff;border-radius:${comp.borderRadius || 12}px;box-shadow:0 2px 8px rgba(0,0,0,0.1);overflow:hidden;display:flex;flex-direction:column">${comp.imageUrl ? `<img src="${comp.imageUrl}" draggable="false" style="width:100%;height:60%;object-fit:${comp.imageFit || 'cover'};user-select:none">` : ''}<div style="padding:16px;height:40%;display:flex;flex-direction:column"><div style="font-size:18px;font-weight:bold;color:${comp.titleColor || '#1f2937'};margin-bottom:8px">${comp.title || ''}</div><div style="font-size:14px;color:${comp.descColor || '#6b7280'}">${comp.description || ''}</div></div></a>` : `<div style="position:absolute;left:${left}px;top:${top}px;width:${width}px;height:${height}px;background:#fff;border-radius:${comp.borderRadius || 12}px;box-shadow:0 2px 8px rgba(0,0,0,0.1);overflow:hidden;display:flex;flex-direction:column">${comp.imageUrl ? `<img src="${comp.imageUrl}" draggable="false" style="width:100%;height:60%;object-fit:${comp.imageFit || 'cover'};user-select:none">` : ''}<div style="padding:16px;height:40%;display:flex;flex-direction:column"><div style="font-size:18px;font-weight:bold;color:${comp.titleColor || '#1f2937'};margin-bottom:8px">${comp.title || ''}</div><div style="font-size:14px;color:${comp.descColor || '#6b7280'}">${comp.description || ''}</div></div></div>`;
        case 'accordion':
          return `<div style="position:absolute;left:${left}px;top:${top}px;width:${width}px;height:${height}px;background:#fff;border-radius:${comp.borderRadius || 8}px;box-shadow:0 2px 4px rgba(0,0,0,0.1);overflow:hidden" id="accordion-${comp.id}"><div onclick="toggleAccordion('${comp.id}')" style="padding:16px;background:${comp.accordionTitleColor || '#f3f4f6'};font-weight:bold;cursor:pointer;display:flex;justify-content:space-between;align-items:center">${comp.accordionTitle || '点击展开'}<span id="accordion-icon-${comp.id}" style="transition:transform 0.2s">▼</span></div><div id="accordion-content-${comp.id}" style="padding:16px;color:${comp.accordionContentColor || '#374151'};max-height:0;overflow:hidden;transition:max-height 0.3s">${comp.accordionContent || '隐藏内容'}</div></div><script>window.toggleAccordion=function(id){var c=document.getElementById('accordion-content-'+id),i=document.getElementById('accordion-icon-'+id);c.style.maxHeight=c.style.maxHeight==='0px'||c.style.maxHeight===''?c.scrollHeight+'px':'0';i.style.transform=c.style.maxHeight==='0px'||c.style.maxHeight===''?'rotate(180deg)':'rotate(0)';};</script>`;
        case 'quiz':
          return `<div style="position:absolute;left:${left}px;top:${top}px;width:${width}px;height:${height}px;background:#fff;border-radius:${comp.borderRadius || 8}px;box-shadow:0 2px 4px rgba(0,0,0,0.1);padding:16px" id="quiz-${comp.id}"><div style="font-weight:bold;color:${comp.questionColor || '#1f2937'};margin-bottom:12px">${comp.question || '问题'}</div><button onclick="showAnswer('${comp.id}')" id="quiz-btn-${comp.id}" style="padding:8px 16px;background:#3b82f6;color:#fff;border:none;border-radius:6px;cursor:pointer">显示答案</button><div id="quiz-answer-${comp.id}" style="margin-top:12px;display:none;color:${comp.answerColor || '#059669'};background:#d1fae5;padding:12px;border-radius:4px">${comp.answer || '答案'}</div></div><script>window.showAnswer=function(id){document.getElementById('quiz-answer-'+id).style.display='block';document.getElementById('quiz-btn-'+id).style.display='none';};</script>`;
        case 'choice':
          return `<div style="position:absolute;left:${left}px;top:${top}px;width:${width}px;height:${height}px;background:#fff;border-radius:${comp.borderRadius || 8}px;box-shadow:0 2px 4px rgba(0,0,0,0.1);padding:16px" id="choice-${comp.id}"><div style="font-weight:bold;margin-bottom:12px">${comp.question || '请选择'}</div><div style="display:flex;flex-direction:column;gap:8">${(comp.options || ['选项A','选项B']).map((opt, i) => `<div onclick="selectChoice('${comp.id}',this,${i===0})" style="padding:8px 12px;border:1px solid #e5e7eb;border-radius:6px;cursor:pointer">${opt}</div>`).join('')}</div><div id="choice-result-${comp.id}" style="margin-top:12px"></div></div><script>window.selectChoice=function(id,el,isCorrect){var result=document.getElementById('choice-result-'+id);if(isCorrect){el.style.background='#d1fae5';el.style.borderColor='#059669';result.innerHTML='<span style="color:#059669">✓ 回答正确！</span>';}else{el.style.background='#fee2e2';el.style.borderColor='#dc2626';result.innerHTML='<span style="color:#dc2626">✗ 回答错误，再试试！</span>';}};</script>`;
        case 'fillBlank':
          return `<div style="position:absolute;left:${left}px;top:${top}px;width:${width}px;height:${height}px;background:#fff;border-radius:${comp.borderRadius || 8}px;box-shadow:0 2px 4px rgba(0,0,0,0.1);padding:16px"><div style="font-weight:bold;margin-bottom:12px">填空题</div><input type="text" placeholder="请输入答案" id="fillblank-${comp.id}" style="width:100%;padding:8px 12px;border:1px solid #e5e7eb;border-radius:6px;margin-bottom:8px"><button onclick="checkFillBlank('${comp.id}')" style="padding:8px 16px;background:#3b82f6;color:#fff;border:none;border-radius:6px;cursor:pointer">检查答案</button><div id="fillblank-result-${comp.id}" style="margin-top:8px"></div></div><script>window.checkFillBlank=function(id){var input=document.getElementById('fillblank-'+id),result=document.getElementById('fillblank-result-'+id);result.innerHTML=input.value?'<span style="color:#3b82f6">答案已提交: '+input.value+'</span>':'<span style="color:#dc2626">请输入答案</span>';};</script>`;
        case 'trueFalse':
          return `<div style="position:absolute;left:${left}px;top:${top}px;width:${width}px;height:${height}px;background:#fff;border-radius:${comp.borderRadius || 8}px;box-shadow:0 2px 4px rgba(0,0,0,0.1);padding:16px" id="truefalse-${comp.id}"><div style="font-weight:bold;margin-bottom:12px">${comp.statement || '判断题'}</div><div style="display:flex;gap:12"><button onclick="answerTrueFalse('${comp.id}',true,this)" style="padding:8px 24px;border:1px solid #e5e7eb;border-radius:6px;background:#fff;cursor:pointer">√ 正确</button><button onclick="answerTrueFalse('${comp.id}',false,this)" style="padding:8px 24px;border:1px solid #e5e7eb;border-radius:6px;background:#fff;cursor:pointer">× 错误</button></div><div id="truefalse-result-${comp.id}" style="margin-top:12px"></div></div><script>window.answerTrueFalse=function(id,answer,btn){var result=document.getElementById('truefalse-result-'+id);btn.style.background='#dbeafe';btn.style.borderColor='#3b82f6';result.innerHTML=answer?'<span style="color:#059669">✓ 正确！</span>':'<span style="color:#dc2626">✗ 错误！</span>';};</script>`;
        case 'sortable':
          return `<div style="position:absolute;left:${left}px;top:${top}px;width:${width}px;height:${height}px;background:#fff;border-radius:${comp.borderRadius || 8}px;box-shadow:0 2px 4px rgba(0,0,0,0.1);padding:16px" id="sortable-${comp.id}"><div style="font-weight:bold;margin-bottom:12px">${comp.title || '排序题'}</div><div id="sortable-list-${comp.id}" onmousedown="startDrag(event,this)"><div class="sort-item" style="padding:8px 12px;border:1px solid #e5e7eb;border-radius:6px;margin-bottom:8px;cursor:move;user-select:none"><span>☰</span> 项目1</div><div class="sort-item" style="padding:8px 12px;border:1px solid #e5e7eb;border-radius:6px;margin-bottom:8px;cursor:move;user-select:none"><span>☰</span> 项目2</div><div class="sort-item" style="padding:8px 12px;border:1px solid #e5e7eb;border-radius:6px;cursor:move;user-select:none"><span>☰</span> 项目3</div></div></div><script>var dragEl=null,clone=null,offsetX=0,offsetY=0;function startDrag(e,container){if(e.target.tagName==='BUTTON')return;var target=e.target.closest('.sort-item');if(!target)return;dragEl=target;clone=target.cloneNode(true);clone.style.position='absolute';clone.style.width=target.offsetWidth+'px';clone.style.background='#e0f2fe';clone.style.opacity='0.8';offsetX=e.clientX-target.offsetLeft;offsetY=e.clientY-target.offsetTop;container.appendChild(clone);target.style.visibility='hidden';document.addEventListener('mousemove',onDrag);document.addEventListener('mouseup',endDrag);}function onDrag(e){if(!clone)return;clone.style.left=(e.clientX-offsetX)+'px';clone.style.top=(e.clientY-offsetY)+'px';}function endDrag(e){if(!clone||!dragEl)return;document.removeEventListener('mousemove',onDrag);document.removeEventListener('mouseup',endDrag);var container=document.getElementById('sortable-${comp.id}').querySelector('div');var items=Array.from(container.children).filter(function(el){return el.classList.contains('sort-item');});var mouseY=e.clientY;var closest=null,minDist=Infinity;items.forEach(function(item){if(item===dragEl)return;var rect=item.getBoundingClientRect();var dist=Math.abs(rect.top+rect.height/2-mouseY);if(dist<minDist){minDist=dist;closest=item;}});if(closest){var next=closest.getBoundingClientRect().top+closest.offsetHeight/2<mouseY?closest.nextSibling:closest;container.insertBefore(dragEl,next);}dragEl.style.visibility='visible';clone.remove();clone=null;dragEl=null;}</script>`;
        case 'drawing':
          return `<div id="drawing-${comp.id}" style="position:absolute;left:${left}px;top:${top}px;width:${width}px;height:${height}px;background:#fff;border-radius:${comp.borderRadius || 8}px;box-shadow:0 2px 4px rgba(0,0,0,0.1);overflow:hidden;display:flex;flex-direction:column"><div style="display:flex;gap:8;padding:8px;background:#f3f4f6;border-bottom:1px solid #e5e7eb;align-items:center"><button onclick="setDrawMode('${comp.id}','pen')" style="padding:4px 8px;border:1px solid #d1d5db;border-radius:4px;background:#fff;cursor:pointer">✏️ 画笔</button><button onclick="setDrawMode('${comp.id}','eraser')" style="padding:4px 8px;border:1px solid #d1d5db;border-radius:4px;background:#fff;cursor:pointer">🧹 橡皮</button><button onclick="clearDrawing('${comp.id}')" style="padding:4px 8px;border:1px solid #d1d5db;border-radius:4px;background:#fff;cursor:pointer">🗑️ 清空</button><input type="color" id="color-${comp.id}" value="${comp.brushColor || '#000000'}" style="width:30px;height:30px;border:none;cursor:pointer"><input type="range" id="size-${comp.id}" min="1" max="20" value="${comp.brushSize || 3}" style="width:80px"></div><canvas id="canvas-${comp.id}" style="flex:1;cursor:crosshair;background:#fafafa"></canvas></div><script>(function(){var c=document.getElementById('canvas-${comp.id}'),ctx=c.getContext('2d'),drawing=false,mode='pen',lastX=0,lastY=0;c.width=c.offsetWidth;c.height=c.offsetHeight;function draw(e){if(!drawing)return;var rect=c.getBoundingClientRect(),x=e.clientX-rect.left,y=e.clientY-rect.top;ctx.beginPath();ctx.moveTo(lastX,lastY);ctx.lineTo(x,y);ctx.strokeStyle=mode==='eraser'?'#fafafa':document.getElementById('color-${comp.id}').value;ctx.lineWidth=mode==='eraser'?20:parseInt(document.getElementById('size-${comp.id}').value);ctx.lineCap='round';ctx.stroke();lastX=x;lastY=y;}c.addEventListener('mousedown',function(e){drawing=true;var rect=c.getBoundingClientRect();lastX=e.clientX-rect.left;lastY=e.clientY-rect.top;});c.addEventListener('mousemove',draw);c.addEventListener('mouseup',function(){drawing=false;});c.addEventListener('mouseout',function(){drawing=false;});window.setDrawMode=function(id,m){mode=m;};window.clearDrawing=function(){ctx.clearRect(0,0,c.width,c.height);};})();</script>`;
        case 'checklist':
          return `<div style="position:absolute;left:${left}px;top:${top}px;width:${width}px;height:${height}px;background:#fff;border-radius:${comp.borderRadius || 8}px;box-shadow:0 2px 4px rgba(0,0,0,0.1);padding:16px" id="checklist-${comp.id}"><div style="font-weight:bold;margin-bottom:12px">${comp.title || '待办清单'}</div><div style="display:flex;flex-direction:column;gap:8"><label style="display:flex;align-items:center;gap:8;cursor:pointer"><input type="checkbox" onchange="this.nextElementSibling.style.textDecoration=this.checked?'line-through':'none';this.nextElementSibling.style.color=this.checked?'#9ca3af':'#374151'" style="width:18px;height:18px"><span style="color:#374151">待办1</span></label><label style="display:flex;align-items:center;gap:8;cursor:pointer"><input type="checkbox" onchange="this.nextElementSibling.style.textDecoration=this.checked?'line-through':'none';this.nextElementSibling.style.color=this.checked?'#9ca3af':'#374151'" style="width:18px;height:18px"><span style="color:#374151">待办2</span></label></div></div>`;
        case 'tabs':
          return `<div style="position:absolute;left:${left}px;top:${top}px;width:${width}px;height:${height}px;background:#fff;border-radius:${comp.borderRadius || 8}px;box-shadow:0 2px 4px rgba(0,0,0,0.1);overflow:hidden" id="tabs-${comp.id}"><div style="display:flex;border-bottom:1px solid #e5e7eb"><div onclick="switchTab('${comp.id}',0,this)" style="padding:12px 20px;border-bottom:2px solid #3b82f6;color:#3b82f6;font-weight:bold;cursor:pointer">标签1</div><div onclick="switchTab('${comp.id}',1,this)" style="padding:12px 20px;color:#6b7280;cursor:pointer">标签2</div></div><div id="tab-content-${comp.id}" style="padding:16px">内容1</div></div><script>window.switchTab=function(id,idx,el){var d=document.getElementById('tabs-'+id),cs=d.querySelectorAll('div[onclick]');cs.forEach(function(c,i){if(i<2){c.style.borderBottom=i===idx?'2px solid #3b82f6':'none';c.style.color=i===idx?'#3b82f6':'#6b7280';c.style.fontWeight=i===idx?'bold':'normal';}});var contents=['内容1','内容2'];document.getElementById('tab-content-'+id).innerHTML=contents[idx];};</script>`;
        case 'timeline':
          return `<div style="position:absolute;left:${left}px;top:${top}px;width:${width}px;height:${height}px;background:#fff;border-radius:${comp.borderRadius || 8}px;box-shadow:0 2px 4px rgba(0,0,0,0.1);padding:16px"><div style="font-weight:bold;margin-bottom:12px">${comp.title || '时间线'}</div><div style="display:flex;flex-direction:column;gap:12;border-left:2px solid #e5e7eb;padding-left:16px"><div style="position:relative"><div style="width:12px;height:12px;border-radius:50%;background:#3b82f6;position:absolute;left:-21px;top:4px"></div><div style="font-weight:bold;color:#1f2937">步骤1</div></div><div style="position:relative"><div style="width:12px;height:12px;border-radius:50%;background:#d1d5db;position:absolute;left:-21px;top:4px"></div><div style="color:#6b7280">步骤2</div></div></div></div>`;
        case 'progress':
          return `<div style="position:absolute;left:${left}px;top:${top}px;width:${width}px;height:${height}px;background:#fff;border-radius:${comp.borderRadius || 8}px;box-shadow:0 2px 4px rgba(0,0,0,0.1);padding:16px" id="progress-${comp.id}"><div style="display:flex;justify-content:space-between;margin-bottom:8px"><span style="font-weight:bold">${comp.title || '进度'}</span><span id="progress-text-${comp.id}" style="color:#6b7280">${comp.progress || 50}%</span></div><input type="range" min="0" max="100" value="${comp.progress || 50}" oninput="document.getElementById('progress-text-${comp.id}').innerText=this.value+'%';this.previousElementSibling.querySelector('div').style.width=this.value+'%'" style="width:100%;height:8px;-webkit-appearance:none;background:#e5e7eb;border-radius:4px;outline:none"><div style="width:${comp.progress || 50}%;height:8px;background:${comp.progressColor || '#3b82f6'};border-radius:4px;margin-top:-8px;pointer-events:none"></div></div>`;
        case 'video':
          return `<div style="position:absolute;left:${left}px;top:${top}px;width:${width}px;height:${height}px;background:#000;border-radius:${comp.borderRadius || 8}px;overflow:hidden"><video src="${comp.src || ''}" style="width:100%;height:100%;object-fit:cover" controls></video></div>`;
        case 'audio':
          return `<div style="position:absolute;left:${left}px;top:${top}px;width:${width}px;height:${height}px;background:#fff;border-radius:${comp.borderRadius || 8}px;box-shadow:0 2px 4px rgba(0,0,0,0.1);padding:16px"><div style="display:flex;align-items:center;gap:12"><div style="width:48px;height:48px;border-radius:8px;background:#f3f4f6;display:flex;align-items:center;justify-content:center">🎵</div><div style="flex:1"><div style="font-weight:bold;margin-bottom:4px">音频标题</div><audio src="${comp.src || ''}" style="width:100%" controls></audio></div></div></div>`;
        case 'quote':
          return `<div style="position:absolute;left:${left}px;top:${top}px;width:${width}px;height:${height}px;background:#f9fafb;border-left:4px solid #3b82f6;padding:16px;border-radius:${comp.borderRadius || 8}px"><div style="font-size:16px;font-style:italic;color:#374151;margin-bottom:8px">"引用内容"</div><div style="font-size:14px;color:#6b7280;text-align:right">— 作者</div></div>`;
        case 'code':
          return `<div style="position:absolute;left:${left}px;top:${top}px;width:${width}px;height:${height}px;background:#1f2937;border-radius:${comp.borderRadius || 8}px;overflow:hidden;display:flex;flex-direction:column"><div style="display:flex;justify-content:space-between;align-items:center;padding:8px 12px;background:#111827;border-bottom:1px solid #374151"><span style="color:#9ca3af;font-size:12px">代码</span><button onclick="copyCode('${comp.id}')" style="padding:4px 8px;background:#374151;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:12px">复制</button></div><pre id="code-${comp.id}" style="flex:1;padding:16px;overflow:auto;color:#e5e7eb;font-size:14px;font-family:monospace;margin:0">${comp.code || '// 代码'}</pre></div><script>window.copyCode=function(id){navigator.clipboard.writeText(document.getElementById('code-'+id).innerText);alert('已复制到剪贴板！');};</script>`;
        case 'table':
          return `<div style="position:absolute;left:${left}px;top:${top}px;width:${width}px;height:${height}px;background:#fff;border-radius:${comp.borderRadius || 8}px;box-shadow:0 2px 4px rgba(0,0,0,0.1);overflow:hidden"><table style="width:100%;border-collapse:collapse"><thead><tr style="background:#f9fafb"><th style="padding:12px;text-align:left;border-bottom:1px solid #e5e7eb;font-weight:bold">列1</th><th style="padding:12px;text-align:left;border-bottom:1px solid #e5e7eb;font-weight:bold">列2</th></tr></thead><tbody><tr><td style="padding:12px;border-bottom:1px solid #e5e7eb">内容1</td><td style="padding:12px;border-bottom:1px solid #e5e7eb">内容2</td></tr><tr style="background:#f9fafb"><td style="padding:12px;border-bottom:1px solid #e5e7eb">内容3</td><td style="padding:12px;border-bottom:1px solid #e5e7eb">内容4</td></tr></tbody></table></div>`;
        case 'tag':
          return `<div style="position:absolute;left:${left}px;top:${top}px;width:${width}px;height:${height}px;display:flex;gap:8;flex-wrap:wrap"><span style="padding:4px 12px;border-radius:16px;background:#dbeafe;color:#1e40af;font-size:14px">标签1</span><span style="padding:4px 12px;border-radius:16px;background:#d1fae5;color:#065f46;font-size:14px">标签2</span></div>`;
        case 'alert':
          return `<div style="position:absolute;left:${left}px;top:${top}px;width:${width}px;height:${height}px;padding:16px;border-radius:${comp.borderRadius || 8}px;background:#dbeafe;border-left:4px solid #3b82f6"><div style="font-weight:bold;margin-bottom:4px;color:#1e40af">提示</div><div style="color:#1e40af;font-size:14px">内容</div></div>`;
        default: return '';
      }
    };

    const canvasHeight = Math.max(CANVAS_MIN_HEIGHT, ...components.map((c: WidgetProps) => (c.y || 0) + (c.height || 200) + 200));
    return `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>我的网页</title><script src="https://cdn.tailwindcss.com"></script><style>body{margin:0;min-height:100vh;position:relative;background:${gridSettings.dotGridBackground}}.page-container{position:relative;width:${CANVAS_WIDTH}px;margin:0 auto;background:${gridSettings.canvasBackground};min-height:${canvasHeight}px;border-radius:${gridSettings.canvasBorderRadius}px}</style></head><body><div class="page-container">${components.map(c => renderComponentHTML(c)).join('\n')}</div></body></html>`;
  };

  const handleExport = () => {
    const html = generateHTML();
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
        <div className="py-8 px-4 flex justify-center overflow-auto">
          <div style={{ position: 'relative', width: CANVAS_WIDTH, minHeight: previewHeight, backgroundColor: gridSettings.canvasBackground, borderRadius: gridSettings.canvasBorderRadius, margin: '0 auto' }}>
            {components.map(comp => {
              const width = comp.width || 300;
              const height = comp.height || 200;
              const style: React.CSSProperties = { position: 'absolute', left: comp.x || 0, top: comp.y || 0, width, height };
              if (comp.type === 'heading') return <div key={comp.id} style={{ ...style, color: comp.color, fontSize: comp.level === 'h1' ? '2.5rem' : '1.5rem' }}>{comp.text}</div>;
              if (comp.type === 'text') return <div key={comp.id} style={{ ...style, fontSize: comp.fontSize || 16, color: comp.color || '#374151' }}>{comp.content}</div>;
              if (comp.type === 'image') return <img key={comp.id} src={comp.src} alt={comp.alt} style={{ ...style, borderRadius: comp.borderRadius, objectFit: 'cover' }} />;
              if (comp.type === 'button') return <div key={comp.id} style={{ ...style, backgroundColor: comp.bgColor, color: comp.textColor, borderRadius: comp.borderRadius, padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{comp.buttonText}</div>;
              if (comp.type === 'card') return <div key={comp.id} style={{ ...style, backgroundColor: '#fff', borderRadius: 12, padding: 16 }}>{comp.title || '卡片'}</div>;
              if (comp.type === 'accordion') return <div key={comp.id} style={{ ...style, backgroundColor: '#fff', borderRadius: 8, padding: 16 }}>{comp.accordionTitle || '折叠'}</div>;
              if (comp.type === 'quiz') return <div key={comp.id} style={{ ...style, backgroundColor: '#fff', borderRadius: 8, padding: 16 }}>问答</div>;
              if (comp.type === 'choice') return <div key={comp.id} style={{ ...style, backgroundColor: '#fff', borderRadius: 8, padding: 16 }}>选择</div>;
              if (comp.type === 'fillBlank') return <div key={comp.id} style={{ ...style, backgroundColor: '#fff', borderRadius: 8, padding: 16 }}>填空</div>;
              if (comp.type === 'trueFalse') return <div key={comp.id} style={{ ...style, backgroundColor: '#fff', borderRadius: 8, padding: 16 }}>判断</div>;
              if (comp.type === 'sortable') return <div key={comp.id} style={{ ...style, backgroundColor: '#fff', borderRadius: 8, padding: 16 }}>排序</div>;
              if (comp.type === 'drawing') return <div key={comp.id} style={{ ...style, backgroundColor: '#fff', borderRadius: 8, padding: 16 }}>画板</div>;
              if (comp.type === 'checklist') return <div key={comp.id} style={{ ...style, backgroundColor: '#fff', borderRadius: 8, padding: 16 }}>清单</div>;
              if (comp.type === 'tabs') return <div key={comp.id} style={{ ...style, backgroundColor: '#fff', borderRadius: 8, padding: 16 }}>标签</div>;
              if (comp.type === 'timeline') return <div key={comp.id} style={{ ...style, backgroundColor: '#fff', borderRadius: 8, padding: 16 }}>时间</div>;
              if (comp.type === 'progress') return <div key={comp.id} style={{ ...style, backgroundColor: '#fff', borderRadius: 8, padding: 16 }}>进度</div>;
              if (comp.type === 'video') return <div key={comp.id} style={{ ...style, backgroundColor: '#000', borderRadius: 8, padding: 16, color: '#fff' }}>视频</div>;
              if (comp.type === 'audio') return <div key={comp.id} style={{ ...style, backgroundColor: '#fff', borderRadius: 8, padding: 16 }}>音频</div>;
              if (comp.type === 'quote') return <div key={comp.id} style={{ ...style, backgroundColor: '#f9fafb', borderLeft: '4px solid #3b82f6', padding: 16, borderRadius: 8 }}>引用</div>;
              if (comp.type === 'code') return <div key={comp.id} style={{ ...style, backgroundColor: '#1f2937', borderRadius: 8, padding: 16, color: '#fff' }}>代码</div>;
              if (comp.type === 'table') return <div key={comp.id} style={{ ...style, backgroundColor: '#fff', borderRadius: 8, padding: 16 }}>表格</div>;
              if (comp.type === 'tag') return <div key={comp.id} style={{ ...style, display: 'flex', gap: 8 }}>标签</div>;
              if (comp.type === 'alert') return <div key={comp.id} style={{ ...style, backgroundColor: '#dbeafe', borderRadius: 8, padding: 16 }}>提示</div>;
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
              const html = generateHTML();
              sessionStorage.setItem('previewHtml', html);
              window.open('/CodeMyPage/preview', '_blank');
            }} className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg"><Eye size={18} /> 预览</button>
            <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg"><Save size={18} /> 保存</button>
            <label className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg cursor-pointer hover:bg-orange-600"><Upload size={18} /> 导入<input type="file" accept=".json" onChange={handleLoad} className="hidden" /></label>
            <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg"><Download size={18} /> 导出HTML</button>
          </div>
        </div>
        <div className={`flex-1 flex overflow-hidden transition-all ${showComponentEditor ? 'mr-80' : ''}`} onClick={() => { setShowGridSettings(false); setShowBgSettings(false); setShowCanvasSettings(false); }}>
          <ComponentPanel onAdd={handleAddComponent} />
          <WorkArea 
            onClick={() => { setShowGridSettings(false); setShowBgSettings(false); setShowCanvasSettings(false); }}
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

  const rc = () => {
    // 标题
    if (component.type === 'heading') return <div style={{ color: component.color || '#1f2937', fontSize: component.level === 'h1' ? '2.5rem' : '1.5rem', fontWeight: 'bold' }}>{component.text}</div>;
    // 文本
    if (component.type === 'text') return <div style={{ fontSize: component.fontSize || 16, color: component.color || '#374151', width: '100%', height: '100%' }}>{component.content}</div>;
    // 图片
    if (component.type === 'image') return <img src={component.src} alt={component.alt} draggable={false} style={{ width: '100%', height: '100%', borderRadius: component.borderRadius, objectFit: 'cover', userSelect: 'none' }} />;
    // 按钮
    if (component.type === 'button') return <div style={{ backgroundColor: component.bgColor, color: component.textColor, borderRadius: component.borderRadius, padding: '12px 24px', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{component.buttonText}</div>;
    // 卡片
    if (component.type === 'card') return (
      <div style={{ width: '100%', height: '100%', backgroundColor: '#fff', borderRadius: component.borderRadius || 12, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {component.imageUrl && <img src={component.imageUrl} alt="" style={{ width: '100%', height: '60%', objectFit: component.imageFit || 'cover' }} />}
        <div style={{ padding: 16, height: '40%', display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 18, fontWeight: 'bold', color: component.titleColor || '#1f2937', marginBottom: 8 }}>{component.cardTitle || component.title || '卡片标题'}</div>
          <div style={{ fontSize: 14, color: component.descColor || '#6b7280' }}>{component.description || '卡片描述'}</div>
        </div>
      </div>
    );
    // 折叠面板
    if (component.type === 'accordion') return (
      <div style={{ width: '100%', height: '100%', backgroundColor: '#fff', borderRadius: component.borderRadius || 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <div style={{ padding: 16, backgroundColor: component.accordionTitleColor || '#f3f4f6', fontWeight: 'bold' }}>{component.accordionTitle || '点击展开'}</div>
        <div style={{ padding: 16, color: component.accordionContentColor || '#374151' }}>{component.accordionContent || '隐藏内容'}</div>
      </div>
    );
    // 问答（选择题展示）
    if (component.type === 'quiz') return (
      <div style={{ width: '100%', height: '100%', backgroundColor: '#fff', borderRadius: component.borderRadius || 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', padding: 16 }}>
        <div style={{ fontWeight: 'bold', color: component.questionColor || '#1f2937', marginBottom: 12 }}>{component.question || '问题'}</div>
        <div style={{ color: component.answerColor || '#059669', backgroundColor: '#d1fae5', padding: 12, borderRadius: 4 }}>{component.answer || '答案'}</div>
      </div>
    );
    // 选择题
    if (component.type === 'choice') return (
      <div style={{ width: '100%', height: '100%', padding: 16, backgroundColor: '#fff', borderRadius: 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <div style={{ fontWeight: 'bold', marginBottom: 12, color: component.questionColor || '#1f2937' }}>{component.question || '请选择正确答案：'}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {(component.options || ['选项 A', '选项 B', '选项 C', '选项 D']).map((opt: string, i: number) => (
            <div key={i} style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 6, cursor: 'pointer', color: '#374151' }}>○ {opt}</div>
          ))}
        </div>
      </div>
    );
    // 填空题
    if (component.type === 'fillBlank') return (
      <div style={{ width: '100%', height: '100%', padding: 16, backgroundColor: '#fff', borderRadius: 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <div style={{ color: component.color || '#374151' }}>{component.content || '填空题内容'}</div>
        <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {(component.blanks || []).map((blank: any) => (
            <input key={blank.id} placeholder="请填写..." style={{ border: '1px solid #d1d5db', borderRadius: 4, padding: '4px 8px', width: 120 }} />
          ))}
        </div>
      </div>
    );
    // 判断题
    if (component.type === 'trueFalse') return (
      <div style={{ width: '100%', height: '100%', padding: 16, backgroundColor: '#fff', borderRadius: 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <div style={{ marginBottom: 12, color: component.color || '#1f2937' }}>{component.statement || '请判断对错：'}</div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button style={{ padding: '8px 24px', border: '2px solid #10b981', borderRadius: 6, backgroundColor: '#fff', color: '#10b981', cursor: 'pointer' }}>√ 正确</button>
          <button style={{ padding: '8px 24px', border: '2px solid #ef4444', borderRadius: 6, backgroundColor: '#fff', color: '#ef4444', cursor: 'pointer' }}>× 错误</button>
        </div>
      </div>
    );
    // 排序题
    if (component.type === 'sortable') return (
      <div style={{ width: '100%', height: '100%', padding: 16, backgroundColor: '#fff', borderRadius: 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
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
    // 画板
    if (component.type === 'drawing') return (
      <div style={{ width: '100%', height: '100%', backgroundColor: '#fff', borderRadius: 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}>
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
    // 清单
    if (component.type === 'checklist') return (
      <div style={{ width: '100%', height: '100%', padding: 16, backgroundColor: '#fff', borderRadius: 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        {(component.checklistItems || [{ id: '1', text: '待办事项 1' }, { id: '2', text: '待办事项 2' }]).map((item: any) => (
          <label key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', cursor: 'pointer' }}>
            <input type="checkbox" defaultChecked={item.checked} style={{ width: 18, height: 18 }} />
            <span style={{ color: item.checked ? '#9ca3af' : '#374151', textDecoration: item.checked ? 'line-through' : 'none' }}>{item.text}</span>
          </label>
        ))}
      </div>
    );
    // 标签页
    if (component.type === 'tabs') return (
      <div style={{ width: '100%', height: '100%', backgroundColor: '#fff', borderRadius: 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}>
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
    // 时间线
    if (component.type === 'timeline') return (
      <div style={{ width: '100%', height: '100%', padding: 16, backgroundColor: '#fff', borderRadius: 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
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
    // 进度条
    if (component.type === 'progress') return (
      <div style={{ width: '100%', height: '100%', padding: 16, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 8 }}>
        {component.showPercent && <div style={{ fontSize: 14, color: '#6b7280', textAlign: 'center' }}>{component.progress || 0}%</div>}
        <div style={{ width: '100%', height: 12, backgroundColor: '#e5e7eb', borderRadius: 6, overflow: 'hidden' }}>
          <div style={{ width: `${component.progress || 0}%`, height: '100%', backgroundColor: component.progressColor || '#3b82f6', borderRadius: 6, transition: 'width 0.3s' }} />
        </div>
      </div>
    );
    // 视频
    if (component.type === 'video') return (
      <video 
        src={component.videoUrl} 
        poster={component.poster} 
        controls 
        style={{ width: '100%', height: '100%', borderRadius: component.borderRadius || 8, objectFit: 'cover' }} 
      />
    );
    // 音频
    if (component.type === 'audio') return (
      <div style={{ width: '100%', height: '100%', padding: 16, backgroundColor: '#fff', borderRadius: 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>▶</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 'bold', marginBottom: 4 }}>音频播放器</div>
          <div style={{ height: 4, backgroundColor: '#e5e7eb', borderRadius: 2 }}>
            <div style={{ width: '30%', height: '100%', backgroundColor: '#3b82f6', borderRadius: 2 }} />
          </div>
        </div>
      </div>
    );
    // 引用
    if (component.type === 'quote') return (
      <div style={{ width: '100%', height: '100%', padding: 20, borderLeft: '4px solid #3b82f6', backgroundColor: '#f9fafb', borderRadius: 8 }}>
        {component.quoteIcon && <div style={{ fontSize: 24, color: '#3b82f6', marginBottom: 8 }}>❝</div>}
        <div style={{ fontSize: 16, fontStyle: 'italic', color: '#374151', marginBottom: 12 }}>"{component.quoteText || '引用内容'}"</div>
        {component.quoteAuthor && <div style={{ fontSize: 14, color: '#6b7280', textAlign: 'right' }}>{component.quoteAuthor}</div>}
      </div>
    );
    // 代码
    if (component.type === 'code') return (
      <div style={{ width: '100%', height: '100%', backgroundColor: '#1f2937', borderRadius: 8, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '8px 12px', backgroundColor: '#111827', color: '#9ca3af', fontSize: 12, display: 'flex', justifyContent: 'space-between' }}>
          <span>{component.language || 'javascript'}</span>
          {component.showCopy && <span style={{ cursor: 'pointer' }}>📋 复制</span>}
        </div>
        <pre style={{ padding: 16, margin: 0, color: '#e5e7eb', fontSize: 14, fontFamily: 'monospace', overflow: 'auto', flex: 1 }}>{component.code || '// 代码内容'}</pre>
      </div>
    );
    // 表格
    if (component.type === 'table') return (
      <div style={{ width: '100%', height: '100%', overflow: 'auto', backgroundColor: '#fff', borderRadius: 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
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
    // 标签
    if (component.type === 'tag') {
      const tagColors: Record<string, { bg: string; text: string }> = {
        default: { bg: '#f3f4f6', text: '#374151' },
        success: { bg: '#d1fae5', text: '#059669' },
        warning: { bg: '#fef3c7', text: '#d97706' },
        error: { bg: '#fee2e2', text: '#dc2626' },
        info: { bg: '#dbeafe', text: '#2563eb' }
      };
      const colors = tagColors[component.tagStyle || 'default'];
      return <span style={{ padding: '4px 12px', backgroundColor: colors.bg, color: colors.text, borderRadius: 9999, fontSize: 14, fontWeight: 500, display: 'inline-flex', alignItems: 'center' }}>{component.tagText || '标签'}</span>;
    }
    // 提示框
    if (component.type === 'alert') {
      const alertColors: Record<string, { bg: string; border: string; title: string; icon: string }> = {
        success: { bg: '#d1fae5', border: '#10b981', title: '#065f46', icon: '✓' },
        warning: { bg: '#fef3c7', border: '#f59e0b', title: '#92400e', icon: '⚠' },
        error: { bg: '#fee2e2', border: '#ef4444', title: '#991b1b', icon: '✕' },
        info: { bg: '#dbeafe', border: '#3b82f6', title: '#1e40af', icon: 'ℹ' }
      };
      const alert = alertColors[component.alertType || 'info'];
      return (
        <div style={{ width: '100%', height: '100%', padding: 16, backgroundColor: alert.bg, borderLeft: `4px solid ${alert.border}`, borderRadius: 8 }}>
          <div style={{ fontWeight: 'bold', color: alert.title, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>{alert.icon}</span> {component.alertTitle || '提示'}
          </div>
          <div style={{ color: '#374151', fontSize: 14 }}>{component.alertContent || '提示内容'}</div>
        </div>
      );
    }
    return <div style={{ color: '#9ca3af', textAlign: 'center', padding: 20 }}>未知组件</div>;
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
