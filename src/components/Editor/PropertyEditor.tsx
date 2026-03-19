import React from 'react';
import type { WidgetProps } from '../../types';

interface PageStyle {
  width: number;
  backgroundColor: string;
  borderRadius: number;
}

interface PropertyEditorProps {
  component: WidgetProps | null;
  pageStyle: PageStyle;
  onChange: (id: string, updates: Partial<WidgetProps>) => void;
  onPageStyleChange: (updates: Partial<PageStyle>) => void;
}

export const PropertyEditor: React.FC<PropertyEditorProps> = ({ 
  component, 
  pageStyle,
  onChange,
  onPageStyleChange
}) => {
  if (!component) {
    return (
      <div className="w-64 bg-white border-l border-gray-200 p-4 overflow-y-auto">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">属性编辑</h2>
        
        {/* 页面样式 */}
        <div className="mb-6 p-3 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-blue-800 mb-3">📄 页面属性</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">页面宽度</label>
              <input 
                type="number" 
                value={pageStyle.width}
                onChange={(e) => onPageStyleChange({ width: parseInt(e.target.value) })}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">背景颜色</label>
              <div className="flex gap-2">
                <input 
                  type="color" 
                  value={pageStyle.backgroundColor}
                  onChange={(e) => onPageStyleChange({ backgroundColor: e.target.value })}
                  className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input 
                  type="text" 
                  value={pageStyle.backgroundColor}
                  onChange={(e) => onPageStyleChange({ backgroundColor: e.target.value })}
                  className="flex-1 p-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">圆角</label>
              <input 
                type="range" 
                min="0" 
                max="50" 
                value={pageStyle.borderRadius}
                onChange={(e) => onPageStyleChange({ borderRadius: parseInt(e.target.value) })}
                className="w-full"
              />
              <span className="text-sm text-gray-500">{pageStyle.borderRadius}px</span>
            </div>
          </div>
        </div>
        
        <p className="text-gray-400 text-sm">选择一个组件来编辑属性</p>
      </div>
    );
  }

  const handleChange = (key: keyof WidgetProps, value: any) => {
    onChange(component.id, { [key]: value });
  };

  const renderFields = () => {
    switch (component.type) {
      case 'heading':
        return (
          <>
            <PropertyField label="标题级别">
              <select 
                value={component.level} 
                onChange={(e) => handleChange('level', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                <option value="h1">H1 - 大标题</option>
                <option value="h2">H2 - 副标题</option>
                <option value="h3">H3 - 小标题</option>
              </select>
            </PropertyField>
            <PropertyField label="标题文字">
              <input 
                type="text" 
                value={component.text || ''}
                onChange={(e) => handleChange('text', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </PropertyField>
            <PropertyField label="文字颜色">
              <div className="flex gap-2">
                <input 
                  type="color" 
                  value={component.color || '#1f2937'}
                  onChange={(e) => handleChange('color', e.target.value)}
                  className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input 
                  type="text" 
                  value={component.color || '#1f2937'}
                  onChange={(e) => handleChange('color', e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded-lg"
                />
              </div>
            </PropertyField>
          </>
        );

      case 'text':
        return (
          <>
            <PropertyField label="文字内容">
              <textarea 
                value={component.content || ''}
                onChange={(e) => handleChange('content', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg h-24"
              />
            </PropertyField>
            <PropertyField label="字号">
              <input 
                type="number" 
                value={component.fontSize || 16}
                onChange={(e) => handleChange('fontSize', parseInt(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </PropertyField>
            <PropertyField label="文字颜色">
              <div className="flex gap-2">
                <input 
                  type="color" 
                  value={component.color || '#374151'}
                  onChange={(e) => handleChange('color', e.target.value)}
                  className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input 
                  type="text" 
                  value={component.color || '#374151'}
                  onChange={(e) => handleChange('color', e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded-lg"
                />
              </div>
            </PropertyField>
          </>
        );

      case 'image':
        return (
          <>
            <PropertyField label="图片地址">
              <input 
                type="text" 
                value={component.src || ''}
                onChange={(e) => handleChange('src', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg"
                placeholder="https://..."
              />
            </PropertyField>
            <PropertyField label="图片描述">
              <input 
                type="text" 
                value={component.alt || ''}
                onChange={(e) => handleChange('alt', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </PropertyField>
            <PropertyField label="宽度">
              <input 
                type="number" 
                value={component.width || 300}
                onChange={(e) => handleChange('width', parseInt(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </PropertyField>
            <PropertyField label="高度">
              <input 
                type="number" 
                value={component.height || 200}
                onChange={(e) => handleChange('height', parseInt(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </PropertyField>
            <PropertyField label="圆角">
              <input 
                type="range" 
                min="0" 
                max="50" 
                value={component.borderRadius || 0}
                onChange={(e) => handleChange('borderRadius', parseInt(e.target.value))}
                className="w-full"
              />
              <span className="text-sm text-gray-500">{component.borderRadius || 0}px</span>
            </PropertyField>
          </>
        );

      case 'button':
        return (
          <>
            <PropertyField label="按钮文字">
              <input 
                type="text" 
                value={component.buttonText || ''}
                onChange={(e) => handleChange('buttonText', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </PropertyField>
            <PropertyField label="跳转地址">
              <input 
                type="text" 
                value={component.link || ''}
                onChange={(e) => handleChange('link', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg"
                placeholder="# 或 https://..."
              />
            </PropertyField>
            <PropertyField label="跳转方式">
              <select 
                value={component.openNewTab ? 'true' : 'false'}
                onChange={(e) => handleChange('openNewTab', e.target.value === 'true')}
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                <option value="false">当前页面跳转</option>
                <option value="true">新标签页打开</option>
              </select>
            </PropertyField>
            <PropertyField label="背景颜色">
              <div className="flex gap-2">
                <input 
                  type="color" 
                  value={component.bgColor || '#3b82f6'}
                  onChange={(e) => handleChange('bgColor', e.target.value)}
                  className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input 
                  type="text" 
                  value={component.bgColor || '#3b82f6'}
                  onChange={(e) => handleChange('bgColor', e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded-lg"
                />
              </div>
            </PropertyField>
            <PropertyField label="文字颜色">
              <div className="flex gap-2">
                <input 
                  type="color" 
                  value={component.textColor || '#ffffff'}
                  onChange={(e) => handleChange('textColor', e.target.value)}
                  className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input 
                  type="text" 
                  value={component.textColor || '#ffffff'}
                  onChange={(e) => handleChange('textColor', e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded-lg"
                />
              </div>
            </PropertyField>
            <PropertyField label="圆角">
              <input 
                type="range" 
                min="0" 
                max="30" 
                value={component.borderRadius || 0}
                onChange={(e) => handleChange('borderRadius', parseInt(e.target.value))}
                className="w-full"
              />
              <span className="text-sm text-gray-500">{component.borderRadius || 0}px</span>
            </PropertyField>
          </>
        );

      case 'card':
        return (
          <>
            <PropertyField label="标题">
              <input 
                type="text" 
                value={component.title || ''}
                onChange={(e) => handleChange('title', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </PropertyField>
            <PropertyField label="标题颜色">
              <div className="flex gap-2">
                <input 
                  type="color" 
                  value={component.titleColor || '#1f2937'}
                  onChange={(e) => handleChange('titleColor', e.target.value)}
                  className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input 
                  type="text" 
                  value={component.titleColor || '#1f2937'}
                  onChange={(e) => handleChange('titleColor', e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded-lg"
                />
              </div>
            </PropertyField>
            <PropertyField label="描述">
              <textarea 
                value={component.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg h-20"
              />
            </PropertyField>
            <PropertyField label="描述颜色">
              <div className="flex gap-2">
                <input 
                  type="color" 
                  value={component.descColor || '#6b7280'}
                  onChange={(e) => handleChange('descColor', e.target.value)}
                  className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input 
                  type="text" 
                  value={component.descColor || '#6b7280'}
                  onChange={(e) => handleChange('descColor', e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded-lg"
                />
              </div>
            </PropertyField>
            <PropertyField label="图片地址">
              <input 
                type="text" 
                value={component.imageUrl || ''}
                onChange={(e) => handleChange('imageUrl', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </PropertyField>
            <PropertyField label="圆角">
              <input 
                type="range" 
                min="0" 
                max="30" 
                value={component.borderRadius || 0}
                onChange={(e) => handleChange('borderRadius', parseInt(e.target.value))}
                className="w-full"
              />
              <span className="text-sm text-gray-500">{component.borderRadius || 0}px</span>
            </PropertyField>
          </>
        );

      case 'accordion':
        return (
          <>
            <PropertyField label="展开标题">
              <input 
                type="text" 
                value={component.accordionTitle || ''}
                onChange={(e) => handleChange('accordionTitle', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </PropertyField>
            <PropertyField label="标题颜色">
              <div className="flex gap-2">
                <input 
                  type="color" 
                  value={component.accordionTitleColor || '#374151'}
                  onChange={(e) => handleChange('accordionTitleColor', e.target.value)}
                  className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input 
                  type="text" 
                  value={component.accordionTitleColor || '#374151'}
                  onChange={(e) => handleChange('accordionTitleColor', e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded-lg"
                />
              </div>
            </PropertyField>
            <PropertyField label="隐藏内容">
              <textarea 
                value={component.accordionContent || ''}
                onChange={(e) => handleChange('accordionContent', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg h-24"
              />
            </PropertyField>
            <PropertyField label="内容颜色">
              <div className="flex gap-2">
                <input 
                  type="color" 
                  value={component.accordionContentColor || '#4b5563'}
                  onChange={(e) => handleChange('accordionContentColor', e.target.value)}
                  className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input 
                  type="text" 
                  value={component.accordionContentColor || '#4b5563'}
                  onChange={(e) => handleChange('accordionContentColor', e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded-lg"
                />
              </div>
            </PropertyField>
          </>
        );

      case 'quiz':
        return (
          <>
            <PropertyField label="问题">
              <textarea 
                value={component.question || ''}
                onChange={(e) => handleChange('question', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg h-20"
              />
            </PropertyField>
            <PropertyField label="问题颜色">
              <div className="flex gap-2">
                <input 
                  type="color" 
                  value={component.questionColor || '#1e40af'}
                  onChange={(e) => handleChange('questionColor', e.target.value)}
                  className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input 
                  type="text" 
                  value={component.questionColor || '#1e40af'}
                  onChange={(e) => handleChange('questionColor', e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded-lg"
                />
              </div>
            </PropertyField>
            <PropertyField label="答案">
              <textarea 
                value={component.answer || ''}
                onChange={(e) => handleChange('answer', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg h-20"
              />
            </PropertyField>
            <PropertyField label="答案颜色">
              <div className="flex gap-2">
                <input 
                  type="color" 
                  value={component.answerColor || '#166534'}
                  onChange={(e) => handleChange('answerColor', e.target.value)}
                  className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input 
                  type="text" 
                  value={component.answerColor || '#166534'}
                  onChange={(e) => handleChange('answerColor', e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded-lg"
                />
              </div>
            </PropertyField>
          </>
        );

      case 'container':
        return (
          <>
            <PropertyField label="背景颜色">
              <div className="flex gap-2">
                <input 
                  type="color" 
                  value={component.backgroundColor || '#f9fafb'}
                  onChange={(e) => handleChange('backgroundColor', e.target.value)}
                  className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input 
                  type="text" 
                  value={component.backgroundColor || '#f9fafb'}
                  onChange={(e) => handleChange('backgroundColor', e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded-lg"
                />
              </div>
            </PropertyField>
            <PropertyField label="内边距">
              <input 
                type="number" 
                value={component.padding || 16}
                onChange={(e) => handleChange('padding', parseInt(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </PropertyField>
            <PropertyField label="圆角">
              <input 
                type="range" 
                min="0" 
                max="30" 
                value={component.borderRadius || 0}
                onChange={(e) => handleChange('borderRadius', parseInt(e.target.value))}
                className="w-full"
              />
              <span className="text-sm text-gray-500">{component.borderRadius || 0}px</span>
            </PropertyField>
          </>
        );

      default:
        return <p className="text-gray-400 text-sm">该组件无可编辑属性</p>;
    }
  };

  return (
    <div className="w-64 bg-white border-l border-gray-200 p-4 overflow-y-auto">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">属性编辑</h2>
      <div className="space-y-4">
        <div className="text-sm text-gray-500 pb-2 border-b">
          组件类型：<span className="text-blue-500 font-medium">{component.type}</span>
        </div>
        {renderFields()}
      </div>
    </div>
  );
};

// 属性字段辅助组件
const PropertyField: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    {children}
  </div>
);
