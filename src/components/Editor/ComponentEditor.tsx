import { useState } from 'react';
import type { WidgetProps } from '../../types';
import { Settings, X } from 'lucide-react';

interface Props {
  component: WidgetProps;
  onUpdate: (updates: Partial<WidgetProps>) => void;
  onClose: () => void;
}

export function ComponentEditor({ component, onUpdate, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<'content' | 'style' | 'action'>('content');

  const renderContentEditor = () => {
    switch (component.type) {
      case 'heading':
        return (
          <>
            <PropertyInput label="标题文字" value={component.text || ''} onChange={(v) => onUpdate({ text: v })} />
            <PropertySelect label="级别" value={component.level || 'h1'} options={[
              { value: 'h1', label: 'H1 大标题' },
              { value: 'h2', label: 'H2 副标题' },
              { value: 'h3', label: 'H3 小标题' }
            ]} onChange={(v) => onUpdate({ level: v as 'h1' | 'h2' | 'h3' })} />
          </>
        );
      case 'text':
        return (
          <>
            <PropertyTextarea label="文本内容" value={component.content || ''} onChange={(v) => onUpdate({ content: v })} rows={4} />
            <PropertyInput label="字体大小" type="number" value={component.fontSize || 16} onChange={(v) => onUpdate({ fontSize: parseInt(v) })} suffix="px" />
            <PropertyColor label="文字颜色" value={component.color || '#333333'} onChange={(v) => onUpdate({ color: v })} />
            <PropertySelect label="对齐方式" value={component.textAlign || 'left'} options={[
              { value: 'left', label: '左对齐' },
              { value: 'center', label: '居中' },
              { value: 'right', label: '右对齐' }
            ]} onChange={(v) => onUpdate({ textAlign: v as 'left' | 'center' | 'right' })} />
          </>
        );
      case 'image':
        return (
          <>
            <PropertyInput label="图片地址" value={component.src || ''} onChange={(v) => onUpdate({ src: v })} placeholder="https://..." />
            <PropertyInput label="图片说明" value={component.alt || ''} onChange={(v) => onUpdate({ alt: v })} placeholder="alt 文字" />
            <PropertyInput label="跳转链接" value={component.link || ''} onChange={(v) => onUpdate({ link: v })} placeholder="https://..." />
            <PropertySelect label="适应模式" value={component.objectFit || 'cover'} options={[
              { value: 'cover', label: '裁切填充' },
              { value: 'contain', label: '完整显示' },
              { value: 'fill', label: '拉伸填充' }
            ]} onChange={(v) => onUpdate({ objectFit: v as 'cover' | 'contain' | 'fill' })} />
            <PropertyInput label="圆角" type="number" value={component.borderRadius || 0} onChange={(v) => onUpdate({ borderRadius: parseInt(v) })} suffix="px" />
            <PropertyToggle label="点击放大灯箱" checked={component.enableLightbox || false} onChange={(v) => onUpdate({ enableLightbox: v })} />
          </>
        );
      case 'button':
        return (
          <>
            <PropertyInput label="按钮文字" value={component.buttonText || ''} onChange={(v) => onUpdate({ buttonText: v })} />
            <PropertyInput label="跳转链接" value={component.link || ''} onChange={(v) => onUpdate({ link: v })} placeholder="https://..." />
            <PropertyToggle label="新窗口打开" checked={component.openNewTab || false} onChange={(v) => onUpdate({ openNewTab: v })} />
            <PropertyColor label="背景颜色" value={component.bgColor || '#3b82f6'} onChange={(v) => onUpdate({ bgColor: v })} />
            <PropertyColor label="文字颜色" value={component.textColor || '#ffffff'} onChange={(v) => onUpdate({ textColor: v })} />
            <PropertyInput label="圆角" type="number" value={component.borderRadius || 8} onChange={(v) => onUpdate({ borderRadius: parseInt(v) })} suffix="px" />
          </>
        );
      case 'card':
        return (
          <>
            <PropertyInput label="卡片标题" value={component.cardTitle || component.title || ''} onChange={(v) => onUpdate({ cardTitle: v })} />
            <PropertyTextarea label="描述内容" value={component.description || ''} onChange={(v) => onUpdate({ description: v })} rows={3} />
            <PropertyInput label="图片地址" value={component.imageUrl || ''} onChange={(v) => onUpdate({ imageUrl: v })} placeholder="https://..." />
            <PropertyColor label="标题颜色" value={component.titleColor || '#1f2937'} onChange={(v) => onUpdate({ titleColor: v })} />
            <PropertyColor label="描述颜色" value={component.descColor || '#6b7280'} onChange={(v) => onUpdate({ descColor: v })} />
            <PropertySelect label="图片适应" value={component.imageFit || 'cover'} options={[
              { value: 'cover', label: '裁切填充' },
              { value: 'contain', label: '完整显示' },
              { value: 'fill', label: '拉伸填充' }
            ]} onChange={(v) => onUpdate({ imageFit: v as 'cover' | 'contain' | 'fill' })} />
            <PropertyInput label="圆角" type="number" value={component.borderRadius || 12} onChange={(v) => onUpdate({ borderRadius: parseInt(v) })} suffix="px" />
            <PropertyInput label="标签" value={component.badge || ''} onChange={(v) => onUpdate({ badge: v })} placeholder="如：重点、新增" />
          </>
        );
      case 'choice':
        return (
          <>
            <PropertyTextarea label="问题" value={component.question || ''} onChange={(v) => onUpdate({ question: v })} rows={2} />
            <PropertyOptions label="选项" value={component.options || []} onChange={(v) => onUpdate({ options: v })} />
            <PropertyInput label="正确答案" type="number" value={(component.correctAnswer as number) || 0} onChange={(v) => onUpdate({ correctAnswer: parseInt(v) })} suffix="(序号从0开始)" />
            <PropertySelect label="题型" value={component.questionType || 'single'} options={[
              { value: 'single', label: '单选题' },
              { value: 'multiple', label: '多选题' }
            ]} onChange={(v) => onUpdate({ questionType: v as 'single' | 'multiple' })} />
            <PropertyToggle label="显示反馈" checked={component.showFeedback !== false} onChange={(v) => onUpdate({ showFeedback: v })} />
          </>
        );
      case 'fillBlank':
        return (
          <>
            <PropertyTextarea label="带空格的文本" value={component.content || ''} onChange={(v) => onUpdate({ content: v })} rows={3} placeholder="用 ___ 表示填空位置" />
            <PropertyBlanks label="填空答案" value={component.blanks || []} onChange={(v) => onUpdate({ blanks: v })} />
          </>
        );
      case 'trueFalse':
        return (
          <>
            <PropertyTextarea label="判断题目" value={component.statement || ''} onChange={(v) => onUpdate({ statement: v })} rows={2} />
            <PropertySelect label="正确答案" value={component.correctBool ? 'true' : 'false'} options={[
              { value: 'true', label: '正确' },
              { value: 'false', label: '错误' }
            ]} onChange={(v) => onUpdate({ correctBool: v === 'true' })} />
            <PropertyToggle label="显示反馈" checked={component.showFeedback !== false} onChange={(v) => onUpdate({ showFeedback: v })} />
          </>
        );
      case 'sortable':
        return (
          <>
            <PropertySortable label="排序项目" value={component.sortableItems || []} onChange={(v) => onUpdate({ sortableItems: v })} />
          </>
        );
      case 'drawing':
        return (
          <>
            <PropertyColor label="画笔颜色" value={component.brushColor || '#000000'} onChange={(v) => onUpdate({ brushColor: v })} />
            <PropertyInput label="画笔粗细" type="range" min={1} max={20} value={component.brushSize || 3} onChange={(v) => onUpdate({ brushSize: parseInt(v) })} suffix="px" />
            <PropertyToggle label="显示工具栏" checked={component.showToolbar !== false} onChange={(v) => onUpdate({ showToolbar: v })} />
          </>
        );
      case 'checklist':
        return (
          <>
            <PropertyChecklist label="清单项目" value={component.checklistItems || []} onChange={(v) => onUpdate({ checklistItems: v })} />
          </>
        );
      case 'tabs':
        return (
          <>
            <PropertyTabs label="标签页" value={component.tabs || []} onChange={(v) => onUpdate({ tabs: v })} />
          </>
        );
      case 'timeline':
        return (
          <>
            <PropertyTimeline label="时间线步骤" value={component.steps || []} onChange={(v) => onUpdate({ steps: v })} />
            <PropertyInput label="当前步骤" type="number" value={component.currentStep || 1} onChange={(v) => onUpdate({ currentStep: parseInt(v) })} suffix="从1开始" />
          </>
        );
      case 'progress':
        return (
          <>
            <PropertyInput label="进度" type="range" min={0} max={100} value={component.progress || 0} onChange={(v) => onUpdate({ progress: parseInt(v) })} suffix="%" />
            <PropertyToggle label="显示百分比" checked={component.showPercent !== false} onChange={(v) => onUpdate({ showPercent: v })} />
            <PropertyColor label="进度颜色" value={component.progressColor || '#3b82f6'} onChange={(v) => onUpdate({ progressColor: v })} />
          </>
        );
      case 'video':
        return (
          <>
            <PropertyInput label="视频地址" value={component.videoUrl || ''} onChange={(v) => onUpdate({ videoUrl: v })} placeholder="mp4 文件地址" />
            <PropertyInput label="封面图片" value={component.poster || ''} onChange={(v) => onUpdate({ poster: v })} placeholder="视频封面图" />
            <PropertyToggle label="自动播放" checked={component.autoplay || false} onChange={(v) => onUpdate({ autoplay: v })} />
          </>
        );
      case 'audio':
        return (
          <>
            <PropertyInput label="音频地址" value={component.audioUrl || ''} onChange={(v) => onUpdate({ audioUrl: v })} placeholder="mp3 文件地址" />
            <PropertyInput label="封面图片" value={component.audioCover || ''} onChange={(v) => onUpdate({ audioCover: v })} placeholder="音频封面图" />
          </>
        );
      case 'quote':
        return (
          <>
            <PropertyTextarea label="引用内容" value={component.quoteText || ''} onChange={(v) => onUpdate({ quoteText: v })} rows={3} />
            <PropertyInput label="作者/来源" value={component.quoteAuthor || ''} onChange={(v) => onUpdate({ quoteAuthor: v })} />
            <PropertyToggle label="显示图标" checked={component.quoteIcon !== false} onChange={(v) => onUpdate({ quoteIcon: v })} />
          </>
        );
      case 'code':
        return (
          <>
            <PropertyTextarea label="代码内容" value={component.code || ''} onChange={(v) => onUpdate({ code: v })} rows={5} />
            <PropertyInput label="语言" value={component.language || 'javascript'} onChange={(v) => onUpdate({ language: v })} placeholder="javascript, python, html..." />
            <PropertyToggle label="显示复制按钮" checked={component.showCopy !== false} onChange={(v) => onUpdate({ showCopy: v })} />
          </>
        );
      case 'table':
        return (
          <>
            <PropertyTableHeaders label="表头" value={component.tableHeaders || []} onChange={(v) => onUpdate({ tableHeaders: v })} />
            <PropertyTableData label="表格数据" value={component.tableData || []} onChange={(v) => onUpdate({ tableData: v })} cols={component.tableHeaders?.length || 3} />
            <PropertyToggle label="斑马纹" checked={component.zebraStripe !== false} onChange={(v) => onUpdate({ zebraStripe: v })} />
          </>
        );
      case 'tag':
        return (
          <>
            <PropertyInput label="标签文字" value={component.tagText || ''} onChange={(v) => onUpdate({ tagText: v })} />
            <PropertySelect label="标签样式" value={component.tagStyle || 'default'} options={[
              { value: 'default', label: '灰色' },
              { value: 'success', label: '绿色' },
              { value: 'warning', label: '黄色' },
              { value: 'error', label: '红色' },
              { value: 'info', label: '蓝色' }
            ]} onChange={(v) => onUpdate({ tagStyle: v as 'default' | 'success' | 'warning' | 'error' | 'info' })} />
          </>
        );
      case 'alert':
        return (
          <>
            <PropertySelect label="提示类型" value={component.alertType || 'info'} options={[
              { value: 'success', label: '成功' },
              { value: 'warning', label: '警告' },
              { value: 'error', label: '错误' },
              { value: 'info', label: '信息' }
            ]} onChange={(v) => onUpdate({ alertType: v as 'success' | 'warning' | 'error' | 'info' })} />
            <PropertyInput label="提示标题" value={component.alertTitle || ''} onChange={(v) => onUpdate({ alertTitle: v })} />
            <PropertyTextarea label="提示内容" value={component.alertContent || ''} onChange={(v) => onUpdate({ alertContent: v })} rows={2} />
          </>
        );
      case 'accordion':
        return (
          <>
            <PropertyInput label="展开标题" value={component.accordionTitle || ''} onChange={(v) => onUpdate({ accordionTitle: v })} />
            <PropertyTextarea label="折叠内容" value={component.accordionContent || ''} onChange={(v) => onUpdate({ accordionContent: v })} rows={4} />
            <PropertyColor label="标题背景" value={component.accordionTitleColor || '#f3f4f6'} onChange={(v) => onUpdate({ accordionTitleColor: v })} />
            <PropertyColor label="内容颜色" value={component.accordionContentColor || '#374151'} onChange={(v) => onUpdate({ accordionContentColor: v })} />
          </>
        );
      default:
        return <div className="text-gray-400 text-sm">该组件无需编辑内容</div>;
    }
  };

  return (
    <div className="fixed top-14 right-0 bottom-0 w-80 bg-white border-l shadow-lg z-40 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center gap-2">
          <Settings size={18} />
          <span className="font-medium">组件属性</span>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
          <X size={18} />
        </button>
      </div>
      
      <div className="flex border-b">
        <button 
          className={`flex-1 py-2 text-sm font-medium ${activeTab === 'content' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('content')}
        >
          内容
        </button>
        <button 
          className={`flex-1 py-2 text-sm font-medium ${activeTab === 'style' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('style')}
        >
          样式
        </button>
        <button 
          className={`flex-1 py-2 text-sm font-medium ${activeTab === 'action' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('action')}
        >
          动作
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === 'content' && renderContentEditor()}
        {activeTab === 'style' && (
          <>
            <PropertyInput label="宽度" type="number" value={component.width || 300} onChange={(v) => onUpdate({ width: parseInt(v) })} suffix="px" />
            <PropertyInput label="高度" type="number" value={component.height || 200} onChange={(v) => onUpdate({ height: parseInt(v) })} suffix="px" />
            <PropertyColor label="背景颜色" value={component.color || ''} onChange={(v) => onUpdate({ color: v })} />
          </>
        )}
        {activeTab === 'action' && (
          <div className="text-gray-400 text-sm">点击按钮跳转、提交表单等交互功能开发中...</div>
        )}
      </div>
    </div>
  );
}

// 属性编辑器子组件
function PropertyInput({ label, type = 'text', value, onChange, placeholder, suffix, min, max }: {
  label: string; type?: string; value: string | number; onChange: (v: string) => void;
  placeholder?: string; suffix?: string; min?: number; max?: number;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          min={min}
          max={max}
          className="flex-1 border rounded px-2 py-1 text-sm"
        />
        {suffix && <span className="text-gray-400 text-sm">{suffix}</span>}
      </div>
    </div>
  );
}

function PropertyTextarea({ label, value, onChange, placeholder, rows = 3 }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; rows?: number;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full border rounded px-2 py-1 text-sm"
      />
    </div>
  );
}

function PropertySelect({ label, value, options, onChange }: {
  label: string; value: string; options: { value: string; label: string }[]; onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border rounded px-2 py-1 text-sm"
      >
        {options.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
    </div>
  );
}

function PropertyColor({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-8 rounded cursor-pointer"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 border rounded px-2 py-1 text-sm font-mono"
        />
      </div>
    </div>
  );
}

function PropertyToggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4"
      />
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  );
}

function PropertyOptions({ label, value, onChange }: { label: string; value: string[]; onChange: (v: string[]) => void }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="space-y-2">
        {(value.length > 0 ? value : ['']).map((opt, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-gray-400 text-sm w-4">{i + 1}.</span>
            <input
              value={opt}
              onChange={(e) => {
                const newOpts = [...value];
                newOpts[i] = e.target.value;
                onChange(newOpts);
              }}
              className="flex-1 border rounded px-2 py-1 text-sm"
            />
            <button
              onClick={() => onChange(value.filter((_, idx) => idx !== i))}
              className="text-red-500 text-sm px-1"
            >
              ×
            </button>
          </div>
        ))}
        <button
          onClick={() => onChange([...value, ''])}
          className="text-blue-600 text-sm"
        >
          + 添加选项
        </button>
      </div>
    </div>
  );
}

function PropertyBlanks({ label, value, onChange }: { label: string; value: { id: string; answer: string; hint?: string }[]; onChange: (v: { id: string; answer: string; hint?: string }[]) => void }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="space-y-2">
        {(value.length > 0 ? value : [{ id: '1', answer: '', hint: '' }]).map((blank, i) => (
          <div key={blank.id} className="border rounded p-2">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-gray-400 text-sm">填空 {i + 1}</span>
            </div>
            <input
              value={blank.answer}
              onChange={(e) => {
                const newBlanks = [...value];
                newBlanks[i] = { ...blank, answer: e.target.value };
                onChange(newBlanks);
              }}
              placeholder="正确答案"
              className="w-full border rounded px-2 py-1 text-sm mb-1"
            />
            <input
              value={blank.hint || ''}
              onChange={(e) => {
                const newBlanks = [...value];
                newBlanks[i] = { ...blank, hint: e.target.value };
                onChange(newBlanks);
              }}
              placeholder="提示（可选）"
              className="w-full border rounded px-2 py-1 text-sm"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function PropertySortable({ label, value, onChange }: { label: string; value: string[]; onChange: (v: string[]) => void }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="space-y-2">
        {value.map((item, i) => (
          <div key={i} className="flex items-center gap-2 border rounded px-2 py-1 bg-gray-50">
            <span className="text-gray-400 cursor-move">⋮⋮</span>
            <input
              value={item}
              onChange={(e) => {
                const newItems = [...value];
                newItems[i] = e.target.value;
                onChange(newItems);
              }}
              className="flex-1 bg-transparent text-sm"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function PropertyChecklist({ label, value, onChange }: { label: string; value: { id: string; text: string; checked?: boolean }[]; onChange: (v: { id: string; text: string; checked?: boolean }[]) => void }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="space-y-2">
        {(value.length > 0 ? value : [{ id: '1', text: '', checked: false }]).map((item, i) => (
          <div key={item.id} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={item.checked || false}
              onChange={(e) => {
                const newItems = [...value];
                newItems[i] = { ...item, checked: e.target.checked };
                onChange(newItems);
              }}
              className="w-4 h-4"
            />
            <input
              value={item.text}
              onChange={(e) => {
                const newItems = [...value];
                newItems[i] = { ...item, text: e.target.value };
                onChange(newItems);
              }}
              className="flex-1 border rounded px-2 py-1 text-sm"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function PropertyTabs({ label, value, onChange }: { label: string; value: { id: string; label: string; content: string }[]; onChange: (v: { id: string; label: string; content: string }[]) => void }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="space-y-3">
        {(value.length > 0 ? value : [{ id: '1', label: '标签1', content: '' }]).map((tab, i) => (
          <div key={tab.id} className="border rounded p-2">
            <div className="text-xs text-gray-400 mb-1">标签 {i + 1}</div>
            <input
              value={tab.label}
              onChange={(e) => {
                const newTabs = [...value];
                newTabs[i] = { ...tab, label: e.target.value };
                onChange(newTabs);
              }}
              placeholder="标签名称"
              className="w-full border rounded px-2 py-1 text-sm mb-1"
            />
            <textarea
              value={tab.content}
              onChange={(e) => {
                const newTabs = [...value];
                newTabs[i] = { ...tab, content: e.target.value };
                onChange(newTabs);
              }}
              placeholder="标签内容"
              rows={2}
              className="w-full border rounded px-2 py-1 text-sm"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function PropertyTimeline({ label, value, onChange }: { label: string; value: { id: string; title: string; description?: string }[]; onChange: (v: { id: string; title: string; description?: string }[]) => void }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="space-y-3">
        {(value.length > 0 ? value : [{ id: '1', title: '', description: '' }]).map((step, i) => (
          <div key={step.id} className="border rounded p-2">
            <div className="text-xs text-gray-400 mb-1">步骤 {i + 1}</div>
            <input
              value={step.title}
              onChange={(e) => {
                const newSteps = [...value];
                newSteps[i] = { ...step, title: e.target.value };
                onChange(newSteps);
              }}
              placeholder="步骤标题"
              className="w-full border rounded px-2 py-1 text-sm mb-1"
            />
            <input
              value={step.description || ''}
              onChange={(e) => {
                const newSteps = [...value];
                newSteps[i] = { ...step, description: e.target.value };
                onChange(newSteps);
              }}
              placeholder="步骤描述（可选）"
              className="w-full border rounded px-2 py-1 text-sm"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function PropertyTableHeaders({ label, value, onChange }: { label: string; value: string[]; onChange: (v: string[]) => void }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="space-y-1">
        {value.map((h, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              value={h}
              onChange={(e) => {
                const newHeaders = [...value];
                newHeaders[i] = e.target.value;
                onChange(newHeaders);
              }}
              className="flex-1 border rounded px-2 py-1 text-sm"
            />
          </div>
        ))}
        <button onClick={() => onChange([...value, ''])} className="text-blue-600 text-sm">+ 添加列</button>
      </div>
    </div>
  );
}

function PropertyTableData({ label, value, onChange, cols }: { label: string; value: string[][]; onChange: (v: string[][]) => void; cols: number }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="space-y-1">
        {value.map((row, i) => (
          <div key={i} className="flex gap-1">
            {row.map((cell, j) => (
              <input
                key={j}
                value={cell}
                onChange={(e) => {
                  const newData = [...value];
                  newData[i][j] = e.target.value;
                  onChange(newData);
                }}
                className="flex-1 border rounded px-2 py-1 text-sm"
              />
            ))}
          </div>
        ))}
        <button onClick={() => onChange([...value, Array(cols).fill('')]) } className="text-blue-600 text-sm">+ 添加行</button>
      </div>
    </div>
  );
}
