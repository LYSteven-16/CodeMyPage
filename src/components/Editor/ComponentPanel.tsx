import React from 'react';
import { componentPanelItems } from './componentPanelItems';
import { IconRenderer } from '../NewStyleRenderers';
import type { IconName } from '../NewStyleRenderers';

interface ComponentPanelProps {
  isInContainer?: boolean;
  containerId?: string;
  onAdd?: (item: typeof componentPanelItems[0]) => void;
}

export const ComponentPanel: React.FC<ComponentPanelProps> = ({ isInContainer = false, onAdd }) => {
  const getIcon = (iconName: string) => {
    return <IconRenderer name={iconName as IconName} size={18} />;
  };

  const availableItems = isInContainer 
    ? componentPanelItems.filter(item => ['heading', 'text', 'image', 'button'].includes(item.type))
    : componentPanelItems;

  const handleClick = (item: typeof componentPanelItems[0]) => {
    if (onAdd) {
      onAdd(item);
    }
  };

  return (
    <div className={`w-40 ${isInContainer ? 'bg-purple-50 border-purple-200' : 'bg-white'} border-r border-gray-200 p-3 overflow-y-auto`}>
      <h2 className="text-base font-semibold text-gray-800 mb-3">
        {isInContainer ? '容器组件' : '组件面板'}
      </h2>
      <p className="text-xs text-gray-500 mb-3">
        点击添加到画布
      </p>
      <div className="space-y-2">
        {availableItems.map((item) => (
          <div
            key={item.type}
            onClick={() => handleClick(item)}
            className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-colors"
          >
            <span className="text-blue-500">{getIcon(item.icon)}</span>
            <span className="text-gray-700 text-sm w-20 text-center leading-tight">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
