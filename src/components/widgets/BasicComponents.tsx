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
  const [isHovered, setIsHovered] = React.useState(false);
  const link = (component as any).link || '';
  const handleClick = link ? () => window.open(link, (component as any).openNewTab ? '_blank' : '_self') : undefined;
  
  return (
    <div style={style}>
      <div 
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: '100%',
          height: '100%',
          backgroundColor: component.bgColor,
          color: component.textColor,
          borderRadius: component.borderRadius || 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '12px 24px',
          cursor: link ? 'pointer' : 'default',
          transform: isHovered ? 'scale(0.98)' : 'scale(1)',
          boxShadow: isHovered 
            ? '0 4px 12px rgba(0,0,0,0.15)' 
            : '0 2px 6px rgba(0,0,0,0.08)',
          transition: 'all 0.2s cubic-bezier(0.25, 0.1, 0.25, 1)',
          opacity: isHovered ? 0.95 : 1
        }}
      >
        {component.buttonText}
      </div>
    </div>
  );
};

export const CardRenderer: React.FC<{ component: WidgetProps; style: React.CSSProperties }> = ({ component, style }) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const link = (component as any).link || '';
  const handleClick = link ? () => window.open(link, (component as any).openNewTab ? '_blank' : '_self') : undefined;
  
  return (
    <div style={style}>
      <div 
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: '100%',
          height: '100%',
          backgroundColor: '#fff',
          borderRadius: component.borderRadius || 12,
          boxShadow: isHovered 
            ? '0 12px 24px rgba(0,0,0,0.12), 0 4px 8px rgba(0,0,0,0.08)' 
            : '0 2px 8px rgba(0,0,0,0.08)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          cursor: link ? 'pointer' : 'default',
          transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
          transition: 'all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)'
        }}
      >
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
              userSelect: 'none',
              transition: 'transform 0.3s ease',
              transform: isHovered ? 'scale(1.02)' : 'scale(1)'
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

export const AccordionRenderer: React.FC<{ component: WidgetProps; style: React.CSSProperties; mode?: 'edit' | 'preview' }> = ({ component, style, mode = 'edit' }) => {
  const [isCollapsed, setIsCollapsed] = React.useState(mode === 'preview');
  const [isHovered, setIsHovered] = React.useState(false);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = React.useState(0);
  
  React.useEffect(() => {
    const measureHeight = () => {
      if (contentRef.current) {
        const el = contentRef.current;
        const originalVisibility = el.style.visibility;
        const originalPosition = el.style.position;
        const originalMaxHeight = el.style.maxHeight;
        
        el.style.visibility = 'hidden';
        el.style.position = 'absolute';
        el.style.maxHeight = 'none';
        
        const h = el.scrollHeight;
        
        el.style.visibility = originalVisibility;
        el.style.position = originalPosition;
        el.style.maxHeight = originalMaxHeight;
        
        setContentHeight(h);
      }
    };
    
    measureHeight();
    
    const observer = new ResizeObserver(measureHeight);
    if (contentRef.current) observer.observe(contentRef.current);
    return () => observer.disconnect();
  }, []);
  
  const titleBarHeight = 52;
  
  return (
    <div 
      style={{
        ...style,
        height: isCollapsed ? titleBarHeight : titleBarHeight + contentHeight,
        overflow: 'hidden',
        transition: 'height 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        zIndex: isCollapsed ? (style.zIndex || 1) : 1000
      }}
    >
      <div style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
        backgroundColor: '#fff',
        borderRadius: component.borderRadius || 8,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        border: '1px solid #e5e7eb'
      }}>
        <div 
          id={`accordion-header-${component.id}`}
          data-collapsed={isCollapsed ? 'true' : 'false'}
          onClick={() => {
            setIsCollapsed(!isCollapsed);
            if (mode === 'preview' && typeof window !== 'undefined') {
              (window as any).toggleAccordion?.(component.id);
            }
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{
            height: titleBarHeight,
            padding: '0 16px',
            backgroundColor: isHovered 
              ? ((component as any).accordionTitleColor ? '#e8e8e8' : '#e5e7eb')
              : ((component as any).accordionTitleColor || '#f3f4f6'),
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            userSelect: 'none',
            transition: 'background-color 0.2s ease',
            borderBottom: isCollapsed ? 'none' : '1px solid #e5e7eb'
          }}
        >
          <span style={{
            fontWeight: 600,
            fontSize: 15,
            color: '#1f2937',
            letterSpacing: '0.01em'
          }}>
            {(component as any).accordionTitle || '点击展开'}
          </span>
          <div 
            id={`accordion-icon-${component.id}`}
            style={{
              width: 24,
              height: 24,
              borderRadius: 6,
              backgroundColor: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
              transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.2s ease',
              transform: isCollapsed ? 'rotate(0deg)' : 'rotate(180deg)'
            }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M3 4.5L6 7.5L9 4.5" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
        <div 
          id={`accordion-content-${component.id}`}
          ref={contentRef}
          style={{
            padding: 16,
            color: (component as any).accordionContentColor || '#374151',
            overflow: 'hidden',
            whiteSpace: 'pre-line',
            wordBreak: 'break-word'
          }}
        >
          {(component as any).accordionContent || '隐藏内容'}
        </div>
      </div>
    </div>
  );
};
