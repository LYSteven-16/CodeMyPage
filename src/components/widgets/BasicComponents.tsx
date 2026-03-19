import React from 'react';
import type { WidgetProps } from '../../types';

export const HeadingRenderer: React.FC<{ component: WidgetProps; style: React.CSSProperties }> = ({ component, style }) => {
  return (
    <div style={style}>
      <div style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
        color: component.color || '#1f2937',
        fontSize: component.level === 'h1' ? '2.5rem' : '1.5rem',
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center'
      }}>
        {component.text}
      </div>
    </div>
  );
};

export const TextRenderer: React.FC<{ component: WidgetProps; style: React.CSSProperties }> = ({ component, style }) => {
  return (
    <div style={style}>
      <div style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
        fontSize: component.fontSize || 16,
        color: component.color || '#374151',
        display: 'flex',
        alignItems: 'center'
      }}>
        {component.content}
      </div>
    </div>
  );
};

export const ImageRenderer: React.FC<{ component: WidgetProps; style: React.CSSProperties }> = ({ component, style }) => {
  return (
    <div style={style}>
      <img 
        src={component.src} 
        alt={component.alt} 
        draggable={false} 
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: '100%',
          height: '100%',
          borderRadius: component.borderRadius,
          objectFit: 'cover',
          userSelect: 'none'
        }} 
      />
    </div>
  );
};

export const ButtonRenderer: React.FC<{ component: WidgetProps; style: React.CSSProperties }> = ({ component, style }) => {
  const link = (component as any).link || '';
  const handleClick = link ? () => window.open(link, (component as any).openNewTab ? '_blank' : '_self') : undefined;
  
  return (
    <div style={style}>
      <div 
        onClick={handleClick} 
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: '100%',
          height: '100%',
          backgroundColor: component.bgColor,
          color: component.textColor,
          borderRadius: component.borderRadius,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '12px 24px',
          cursor: link ? 'pointer' : 'default'
        }}
      >
        {component.buttonText}
      </div>
    </div>
  );
};

export const CardRenderer: React.FC<{ component: WidgetProps; style: React.CSSProperties }> = ({ component, style }) => {
  const link = (component as any).link || '';
  const handleClick = link ? () => window.open(link, (component as any).openNewTab ? '_blank' : '_self') : undefined;
  
  return (
    <div style={style} onClick={handleClick}>
      <div style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
        backgroundColor: '#fff',
        borderRadius: component.borderRadius || 12,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        cursor: link ? 'pointer' : 'default'
      }}>
        {(component as any).imageUrl && (
          <img 
            src={(component as any).imageUrl} 
            alt="" 
            draggable={false} 
            onDragStart={(e) => e.preventDefault()} 
            style={{
              width: '100%',
              height: '60%',
              objectFit: (component as any).imageFit || 'cover',
              userSelect: 'none'
            }} 
          />
        )}
        <div style={{ padding: 16, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{
            fontSize: 18,
            fontWeight: 'bold',
            color: (component as any).titleColor || '#1f2937',
            marginBottom: 8
          }}>
            {(component as any).cardTitle || component.title || '卡片标题'}
          </div>
          <div style={{
            fontSize: 14,
            color: (component as any).descColor || '#6b7280'
          }}>
            {(component as any).description || '卡片描述'}
          </div>
        </div>
      </div>
    </div>
  );
};

export const AccordionRenderer: React.FC<{ component: WidgetProps; style: React.CSSProperties }> = ({ component, style }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  
  return (
    <div style={style}>
      <div style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
        backgroundColor: '#fff',
        borderRadius: component.borderRadius || 8,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div 
          onClick={() => setIsOpen(!isOpen)} 
          style={{
            padding: 16,
            backgroundColor: (component as any).accordionTitleColor || '#f3f4f6',
            fontWeight: 'bold',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          {(component as any).accordionTitle || '点击展开'}
          <span style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>
            ▼
          </span>
        </div>
        {isOpen && (
          <div style={{
            padding: 16,
            color: (component as any).accordionContentColor || '#374151',
            flex: 1
          }}>
            {(component as any).accordionContent || '隐藏内容'}
          </div>
        )}
      </div>
    </div>
  );
};
