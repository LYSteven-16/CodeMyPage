import React from 'react';
import type { WidgetProps } from '../../types';

interface CanvasProps {
  components: WidgetProps[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
}

// 简单的渲染组件函数
const renderComponent = (component: WidgetProps) => {
  switch (component.type) {
    case 'heading': {
      const sizes: Record<string, string> = { h1: 'text-4xl', h2: 'text-3xl', h3: 'text-2xl' };
      const level = component.level || 'h1';
      return (
        <div style={{ color: component.color || '#1f2937' }} className={`${sizes[level]} font-bold mb-4`}>
          {component.text || '标题'}
        </div>
      );
    }
    case 'text':
      return (
        <p 
          style={{ fontSize: component.fontSize || 16, color: component.color || '#374151' }} 
          className="mb-4 leading-relaxed"
        >
          {component.content || ''}
        </p>
      );
    case 'image':
      return (
        <img 
          src={component.src || ''} 
          alt={component.alt || ''} 
          style={{ 
            width: component.width || 300, 
            height: component.height || 200, 
            borderRadius: component.borderRadius || 0 
          }} 
          className="object-cover mb-4"
        />
      );
    case 'button':
      return (
        <a 
          href={component.link === '#' ? '#' : component.link}
          style={{ 
            backgroundColor: component.bgColor || '#3b82f6', 
            color: component.textColor || '#ffffff', 
            borderRadius: component.borderRadius || 8 
          }}
          className="inline-block px-6 py-3 mb-4 font-medium"
        >
          {component.buttonText || '按钮'}
        </a>
      );
    case 'card':
      return (
        <div 
          style={{ borderRadius: component.borderRadius || 12 }} 
          className="bg-white shadow-md overflow-hidden mb-4"
        >
          {component.imageUrl && (
            <img src={component.imageUrl} alt={component.title || ''} className="w-full h-40 object-cover" />
          )}
          <div className="p-4">
            <h3 style={{ color: component.titleColor || '#1f2937' }} className="text-xl font-semibold mb-2">
              {component.title || ''}
            </h3>
            <p style={{ color: component.descColor || '#6b7280' }}>
              {component.description || ''}
            </p>
          </div>
        </div>
      );
    case 'accordion':
      return (
        <div className="border border-gray-200 rounded-lg overflow-hidden mb-4">
          <div 
            style={{ color: component.accordionTitleColor || '#374151' }}
            className="bg-gray-50 px-4 py-3 font-medium"
          >
            {component.accordionTitle || '点击展开'}
          </div>
        </div>
      );
    case 'quiz':
      return (
        <div className="border border-gray-200 rounded-lg overflow-hidden mb-4">
          <div 
            style={{ color: component.questionColor || '#1e40af', backgroundColor: '#eff6ff' }}
            className="px-4 py-3"
          >
            ❓ {component.question || '问题'}
          </div>
        </div>
      );
    case 'container':
      return (
        <div 
          style={{ 
            backgroundColor: component.backgroundColor || '#f9fafb', 
            padding: component.padding || 16, 
            borderRadius: component.borderRadius || 8 
          }}
          className="min-h-[80px] mb-4"
        >
          <span className="text-gray-400 text-sm">容器区域</span>
        </div>
      );
    default:
      return <div className="mb-4">未知组件</div>;
  }
};

export const Canvas: React.FC<CanvasProps> = ({
  components,
  selectedId,
  onSelect,
  onDelete,
  onMoveUp,
  onMoveDown,
}) => {
  const sortedComponents = [...components].sort((a, b) => a.order - b.order);

  return (
    <div onClick={(e) => e.stopPropagation()}>
      {sortedComponents.map((component) => (
        <div
          key={component.id}
          className={`relative group mb-2 ${selectedId === component.id ? 'ring-2 ring-blue-500 ring-offset-2 rounded-lg' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(component.id);
          }}
        >
          {/* 组件内容 */}
          <div className={selectedId === component.id ? 'rounded-lg overflow-hidden' : ''}>
            {renderComponent(component)}
          </div>
          
          {/* 操作按钮 - 选中时显示 */}
          {selectedId === component.id && (
            <div className="absolute -top-8 right-0 flex gap-1 bg-blue-500 rounded-t-lg overflow-hidden z-10">
              <button
                onClick={(e) => { e.stopPropagation(); onMoveUp(component.id); }}
                className="px-2 py-1 bg-blue-500 text-white text-xs hover:bg-blue-600"
                title="上移"
              >
                ↑
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onMoveDown(component.id); }}
                className="px-2 py-1 bg-blue-500 text-white text-xs hover:bg-blue-600"
                title="下移"
              >
                ↓
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(component.id); }}
                className="px-2 py-1 bg-red-500 text-white text-xs hover:bg-red-600"
                title="删除"
              >
                ✕
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
