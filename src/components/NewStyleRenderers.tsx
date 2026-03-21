import React from 'react';
import type { WidgetProps } from '../types';

export const colors = {
  blue: '#007aff',
  green: '#34c759',
  red: '#ff3b30',
  orange: '#ff9500',
  yellow: '#ffcc00',
  pink: '#ff2d55',
  purple: '#5856d6',
  teal: '#5ac8fa',
  gray: '#8e8e93',
  lightGray: '#f5f5f7',
  borderColor: '#d2d2d7',
};

const baseStyle = {
  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", sans-serif',
  primaryColor: '#007aff',
  secondaryColor: '#5856d6',
  textColor: '#1d1d1f',
  mutedColor: '#86868b',
  background: '#ffffff',
  borderRadius: 12,
};

function getPadding(widget: WidgetProps, fallback: number = 16): string {
  const p = widget.padding;
  if (typeof p === 'number') return `${p}px`;
  if (p && typeof p === 'object') {
    return `${p.top || 0}px ${p.right || 0}px ${p.bottom || 0}px ${p.left || 0}px`;
  }
  return `${fallback}px`;
}

export const HeadingRenderer: React.FC<{ widget: WidgetProps }> = ({ widget }) => {
  const sizes: Record<string, number> = { h1: 34, h2: 28, h3: 22 };
  const size = sizes[widget.level as string] || 28;
  
  return (
    <div style={{
      position: 'absolute',
      left: widget.x || 0,
      top: widget.y || 0,
      width: widget.width || 'auto',
      minHeight: widget.height || 40,
      padding: getPadding(widget, 20),
    }}>
      <h1 style={{
        margin: 0,
        fontSize: size,
        fontWeight: 700,
        color: widget.color || baseStyle.textColor,
        fontFamily: baseStyle.fontFamily,
        letterSpacing: size > 28 ? -0.5 : -0.3,
        lineHeight: 1.2,
      }}>
        {widget.text}
      </h1>
    </div>
  );
};

export const TextRenderer: React.FC<{ widget: WidgetProps }> = ({ widget }) => {
  return (
    <div style={{
      position: 'absolute',
      left: widget.x || 0,
      top: widget.y || 0,
      width: widget.width || 'auto',
      minHeight: widget.height || 40,
      padding: getPadding(widget),
    }}>
      <div style={{
        margin: 0,
        fontSize: widget.fontSize || 15,
        color: widget.color || baseStyle.textColor,
        fontFamily: baseStyle.fontFamily,
        lineHeight: widget.lineHeight || 1.6,
        whiteSpace: 'pre-wrap',
      }}>
        {widget.content}
      </div>
    </div>
  );
};

export const ImageRenderer: React.FC<{ widget: WidgetProps }> = ({ widget }) => {
  const radius = widget.borderRadius || 12;
  
  return (
    <div style={{
      position: 'absolute',
      left: widget.x || 0,
      top: widget.y || 0,
      width: widget.width || 300,
      height: widget.height || 200,
      padding: getPadding(widget, 0),
      borderRadius: radius,
      overflow: 'hidden',
    }}>
      <img
        src={widget.image || widget.src || ''}
        alt={widget.alt || ''}
        draggable={false}
        style={{
          width: '100%',
          height: '100%',
          borderRadius: radius,
          objectFit: 'cover',
          userSelect: 'none',
        }}
      />
    </div>
  );
};

export const ButtonRenderer: React.FC<{ widget: WidgetProps }> = ({ widget }) => {
  const bgColor = widget.bgColor || colors.blue;
  const isOutline = widget.buttonStyle === 'outline';
  const padding = widget.padding;
  const padTop = typeof padding === 'object' ? padding.top : 12;
  const padLeft = typeof padding === 'object' ? padding.left : 24;
  
  return (
    <div style={{
      position: 'absolute',
      left: widget.x || 0,
      top: widget.y || 0,
      width: widget.width || 'auto',
      minHeight: widget.height || 44,
      padding: getPadding(widget, 12),
    }}>
      <button
        style={{
          margin: 0,
          padding: `${padTop}px ${padLeft}px`,
          fontSize: widget.fontSize || 15,
          fontWeight: 600,
          fontFamily: baseStyle.fontFamily,
          color: isOutline ? bgColor : '#ffffff',
          background: isOutline ? 'transparent' : bgColor,
          border: isOutline ? `2px solid ${bgColor}` : 'none',
          borderRadius: widget.borderRadius || 10,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          outline: 'none',
          minHeight: 44,
        }}
      >
        {widget.buttonText || widget.text || '按钮'}
      </button>
    </div>
  );
};

export const CardRenderer: React.FC<{ widget: WidgetProps }> = ({ widget }) => {
  const [isHovered, setIsHovered] = React.useState(false);
  
  return (
    <div style={{
      position: 'absolute',
      left: widget.x || 0,
      top: widget.y || 0,
      width: widget.width || 300,
      height: widget.height || 200,
      borderRadius: baseStyle.borderRadius,
      overflow: 'hidden',
      boxShadow: isHovered
        ? '0 12px 28px rgba(0, 0, 0, 0.12), 0 4px 8px rgba(0, 0, 0, 0.08)'
        : '0 2px 8px rgba(0, 0, 0, 0.08)',
      transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
      transition: 'all 0.3s cubic-bezier(0.25, 1, 0.5, 1)',
      background: baseStyle.background,
    }}
    onMouseEnter={() => setIsHovered(true)}
    onMouseLeave={() => setIsHovered(false)}
    >
      {(widget.image || widget.imageUrl || widget.src) && (
        <img
          src={widget.image || widget.imageUrl || widget.src}
          alt=""
          draggable={false}
          style={{
            width: '100%',
            height: '60%',
            objectFit: 'cover',
          }}
        />
      )}
      <div style={{ padding: getPadding(widget, 16) }}>
        <div style={{
          fontSize: 17,
          fontWeight: 600,
          color: (widget as any).titleColor || baseStyle.textColor,
          marginBottom: 4,
          fontFamily: baseStyle.fontFamily,
        }}>
          {widget.cardTitle || widget.title || '卡片标题'}
        </div>
        <div style={{
          fontSize: 14,
          color: baseStyle.mutedColor,
          fontFamily: baseStyle.fontFamily,
        }}>
          {(widget as any).description || '卡片描述'}
        </div>
      </div>
    </div>
  );
};

export const AccordionRenderer: React.FC<{ widget: WidgetProps; mode?: 'edit' | 'preview' }> = ({ widget, mode = 'edit' }) => {
  const [isCollapsed, setIsCollapsed] = React.useState(mode === 'preview');
  
  return (
    <div style={{
      position: 'absolute',
      left: widget.x || 0,
      top: widget.y || 0,
      width: widget.width || 300,
      minHeight: widget.height || 52,
      background: baseStyle.background,
      borderRadius: baseStyle.borderRadius,
      boxShadow: `0 1px 3px rgba(0, 0, 0, 0.06)`,
      overflow: 'hidden',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    }}>
      <div
        onClick={() => setIsCollapsed(!isCollapsed)}
        style={{
          padding: '14px 16px',
          background: isCollapsed ? baseStyle.background : colors.lightGray,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          borderBottom: isCollapsed ? 'none' : '1px solid rgba(0, 0, 0, 0.06)',
          transition: 'background 0.2s ease',
        }}
      >
        <span style={{
          fontWeight: 600,
          fontSize: 15,
          color: baseStyle.textColor,
          fontFamily: baseStyle.fontFamily,
        }}>
          {widget.accordionTitle || (widget as any).accordionTitle || '点击展开'}
        </span>
        <div style={{
          width: 28,
          height: 28,
          borderRadius: 14,
          background: baseStyle.background,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          transform: isCollapsed ? 'rotate(0deg)' : 'rotate(180deg)',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={baseStyle.mutedColor} strokeWidth="2">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </div>
      {!isCollapsed && (
        <div style={{
          padding: getPadding(widget, 16),
          color: baseStyle.textColor,
          fontSize: 14,
          lineHeight: 1.6,
          fontFamily: baseStyle.fontFamily,
        }}>
          {widget.accordionContent || (widget as any).accordionContent || '隐藏内容'}
        </div>
      )}
    </div>
  );
};

export const ChoiceRenderer: React.FC<{ widget: WidgetProps }> = ({ widget }) => {
  const [selectedOption, setSelectedOption] = React.useState<number | null>(null);
  const [showResult, setShowResult] = React.useState(false);
  
  const options = widget.options || (widget as any).options || ['选项 A', '选项 B', '选项 C', '选项 D'];
  const correctIdx = (widget as any).correctIndex ?? 0;
  
  return (
    <div style={{
      position: 'absolute',
      left: widget.x || 0,
      top: widget.y || 0,
      width: widget.width || 300,
      height: widget.height || 200,
      background: baseStyle.background,
      borderRadius: baseStyle.borderRadius,
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)',
      padding: getPadding(widget, 20),
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div style={{
        fontWeight: 600,
        fontSize: 16,
        color: baseStyle.textColor,
        marginBottom: 16,
        fontFamily: baseStyle.fontFamily,
      }}>
        {widget.question || '请选择正确答案：'}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {options.map((opt: string, i: number) => {
          const isCorrect = i === correctIdx;
          let bgColor = baseStyle.background;
          let borderColor = colors.borderColor;
          let indicatorBg = colors.lightGray;
          
          if (showResult && selectedOption === i) {
            bgColor = isCorrect ? '#dcfce7' : '#fee2e2';
            borderColor = isCorrect ? colors.green : colors.red;
            indicatorBg = isCorrect ? colors.green : colors.red;
          }
          
          return (
            <div
              key={i}
              onClick={() => {
                if (!showResult) {
                  setSelectedOption(i);
                  setShowResult(true);
                }
              }}
              style={{
                padding: '14px 16px',
                border: `2px solid ${borderColor}`,
                borderRadius: 12,
                background: bgColor,
                cursor: showResult ? 'default' : 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                fontFamily: baseStyle.fontFamily,
              }}
            >
              <div style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                background: indicatorBg,
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 13,
                fontWeight: 600,
                flexShrink: 0,
              }}>
                {showResult ? (isCorrect ? '✓' : (selectedOption === i ? '✕' : '')) : String.fromCharCode(65 + i)}
              </div>
              <span style={{ color: baseStyle.textColor, fontSize: 15 }}>{opt}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const FillBlankRenderer: React.FC<{ widget: WidgetProps }> = ({ widget }) => {
  const [values, setValues] = React.useState<Record<string, string>>({});
  const [results, setResults] = React.useState<Record<string, boolean | null>>({});
  const [isChecked, setIsChecked] = React.useState(false);
  
  const blanks = widget.blanks || (widget as any).blanks || [];
  
  const checkAnswers = () => {
    const newResults: Record<string, boolean | null> = {};
    blanks.forEach((blank: any) => {
      const userAnswer = values[blank.id]?.trim().toLowerCase() || '';
      const correctAnswer = (blank.answer || '').toLowerCase();
      newResults[blank.id] = userAnswer === correctAnswer;
    });
    setResults(newResults);
    setIsChecked(true);
  };
  
  const reset = () => {
    setValues({});
    setResults({});
    setIsChecked(false);
  };
  
  const correctCount = Object.values(results).filter(r => r === true).length;
  
  return (
    <div style={{
      position: 'absolute',
      left: widget.x || 0,
      top: widget.y || 0,
      width: widget.width || 300,
      height: widget.height || 200,
      background: baseStyle.background,
      borderRadius: baseStyle.borderRadius,
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)',
      padding: getPadding(widget, 20),
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div style={{
        color: widget.color || baseStyle.textColor,
        marginBottom: 16,
        fontSize: 15,
        fontFamily: baseStyle.fontFamily,
      }}>
        {widget.content || '填空题内容'}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
        {blanks.map((blank: any, index: number) => (
          <input
            key={blank.id || index}
            placeholder={blank.hint || `填空 ${index + 1}`}
            value={values[blank.id] || ''}
            onChange={(e) => setValues({...values, [blank.id]: e.target.value})}
            disabled={isChecked}
            style={{
              padding: '10px 14px',
              borderRadius: 10,
              border: `2px solid ${
                isChecked
                  ? (results[blank.id] ? colors.green : colors.red)
                  : colors.borderColor
              }`,
              background: isChecked
                ? (results[blank.id] ? '#dcfce7' : '#fee2e2')
                : baseStyle.background,
              fontSize: 14,
              outline: 'none',
              minWidth: 120,
              fontFamily: baseStyle.fontFamily,
            }}
          />
        ))}
      </div>
      {isChecked && (
        <div style={{
          padding: '12px 16px',
          background: correctCount === blanks.length ? '#dcfce7' : '#fef3c7',
          borderRadius: 10,
          marginBottom: 12,
          fontSize: 14,
          color: correctCount === blanks.length ? '#166534' : '#92400e',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontFamily: baseStyle.fontFamily,
        }}>
          <span style={{ fontSize: 18 }}>{correctCount === blanks.length ? '🎉' : '📝'}</span>
          <span>{correctCount === blanks.length ? '全部正确！' : `答对 ${correctCount} / ${blanks.length}`}</span>
        </div>
      )}
      <div style={{ display: 'flex', gap: 10 }}>
        {!isChecked ? (
          <button
            onClick={checkAnswers}
            style={{
              padding: '12px 24px',
              background: colors.blue,
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 600,
              fontFamily: baseStyle.fontFamily,
            }}
          >
            检查答案
          </button>
        ) : (
          <button
            onClick={reset}
            style={{
              padding: '12px 24px',
              background: baseStyle.background,
              color: baseStyle.textColor,
              border: `2px solid ${colors.borderColor}`,
              borderRadius: 10,
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 500,
              fontFamily: baseStyle.fontFamily,
            }}
          >
            重新作答
          </button>
        )}
      </div>
    </div>
  );
};

export const TrueFalseRenderer: React.FC<{ widget: WidgetProps }> = ({ widget }) => {
  const [selectedAnswer, setSelectedAnswer] = React.useState<boolean | null>(null);
  const [showResult, setShowResult] = React.useState(false);
  
  const correctBool = widget.correctBool ?? (widget as any).correctBool ?? true;
  
  return (
    <div style={{
      position: 'absolute',
      left: widget.x || 0,
      top: widget.y || 0,
      width: widget.width || 300,
      height: widget.height || 160,
      background: baseStyle.background,
      borderRadius: baseStyle.borderRadius,
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)',
      padding: getPadding(widget, 20),
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div style={{
        fontWeight: 600,
        fontSize: 16,
        color: baseStyle.textColor,
        marginBottom: 16,
        fontFamily: baseStyle.fontFamily,
      }}>
        {(widget as any).statement || '请判断对错：'}
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <button
          onClick={() => {
            if (!showResult) {
              setSelectedAnswer(true);
              setShowResult(true);
            }
          }}
          style={{
            flex: 1,
            padding: '14px 20px',
            border: `2px solid ${showResult && selectedAnswer === true ? (correctBool ? colors.green : colors.red) : colors.green}`,
            borderRadius: 12,
            background: showResult && selectedAnswer === true ? (correctBool ? '#dcfce7' : '#fee2e2') : baseStyle.background,
            color: colors.green,
            cursor: showResult ? 'default' : 'pointer',
            fontWeight: 600,
            fontSize: 15,
            fontFamily: baseStyle.fontFamily,
            transition: 'all 0.2s ease',
          }}
        >
          √ 正确
        </button>
        <button
          onClick={() => {
            if (!showResult) {
              setSelectedAnswer(false);
              setShowResult(true);
            }
          }}
          style={{
            flex: 1,
            padding: '14px 20px',
            border: `2px solid ${showResult && selectedAnswer === false ? (!correctBool ? colors.green : colors.red) : colors.red}`,
            borderRadius: 12,
            background: showResult && selectedAnswer === false ? (!correctBool ? '#dcfce7' : '#fee2e2') : baseStyle.background,
            color: colors.red,
            cursor: showResult ? 'default' : 'pointer',
            fontWeight: 600,
            fontSize: 15,
            fontFamily: baseStyle.fontFamily,
            transition: 'all 0.2s ease',
          }}
        >
          × 错误
        </button>
      </div>
    </div>
  );
};

export const SortableRenderer: React.FC<{ widget: WidgetProps }> = ({ widget }) => {
  const [items, setItems] = React.useState((widget.sortableItems || (widget as any).sortableItems || []) as any[]);
  const [dragIdx, setDragIdx] = React.useState<number | null>(null);
  const [dropIdx, setDropIdx] = React.useState<number | null>(null);
  
  const containerRef = React.useRef<HTMLDivElement>(null);
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragIdx === null || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const itemHeight = rect.height / items.length;
    const idx = Math.max(0, Math.min(items.length - 1, Math.floor(y / itemHeight)));
    setDropIdx(idx);
  };
  
  const handleMouseUp = () => {
    if (dragIdx !== null && dropIdx !== null && dragIdx !== dropIdx) {
      const newItems = [...items];
      const [removed] = newItems.splice(dragIdx, 1);
      newItems.splice(dropIdx, 0, removed);
      setItems(newItems);
    }
    setDragIdx(null);
    setDropIdx(null);
  };
  
  return (
    <div style={{
      position: 'absolute',
      left: widget.x || 0,
      top: widget.y || 0,
      width: widget.width || 300,
      height: widget.height || 200,
      background: baseStyle.background,
      borderRadius: baseStyle.borderRadius,
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)',
      padding: getPadding(widget, 16),
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      <div style={{
        fontWeight: 600,
        fontSize: 15,
        color: baseStyle.textColor,
        marginBottom: 12,
        fontFamily: baseStyle.fontFamily,
      }}>
        {(widget as any).sortableTitle || widget.title || '排序题'}
      </div>
      <div
        ref={containerRef}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          flex: 1,
          userSelect: 'none',
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => dragIdx !== null && handleMouseUp()}
      >
        {items.map((item: any, i: number) => {
          const isDragging = dragIdx === i;
          const isAboveDrop = dragIdx !== null && dropIdx !== null &&
            ((dragIdx < dropIdx && i > dragIdx && i <= dropIdx) ||
             (dragIdx > dropIdx && i < dragIdx && i >= dropIdx));
          
          return (
            <div
              key={typeof item === 'string' ? item : (item.id || i)}
              onMouseDown={(e) => {
                e.preventDefault();
                setDragIdx(i);
              }}
              style={{
                padding: '14px 16px',
                border: `2px solid ${isDragging ? colors.blue : isAboveDrop ? '#93c5fd' : colors.borderColor}`,
                borderRadius: 12,
                background: isDragging ? '#dbeafe' : isAboveDrop ? '#eff6ff' : baseStyle.background,
                cursor: dragIdx === null ? 'grab' : 'grabbing',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                transform: isDragging ? 'scale(1.02)' : isAboveDrop ? `translateY(${dragIdx < i ? -12 : 12}px)` : 'translateY(0)',
                transition: isDragging ? 'none' : 'all 0.2s cubic-bezier(0.25, 0.1, 0.25, 1)',
                boxShadow: isDragging ? '0 8px 20px rgba(0, 122, 255, 0.15)' : '0 1px 3px rgba(0, 0, 0, 0.04)',
                fontFamily: baseStyle.fontFamily,
              }}
            >
              <div style={{
                width: 24,
                height: 24,
                borderRadius: 6,
                background: isDragging ? colors.blue : colors.lightGray,
                color: isDragging ? '#fff' : baseStyle.mutedColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 13,
                fontWeight: 600,
                flexShrink: 0,
              }}>
                {typeof item === 'string' ? item.charAt(0) : String(i + 1)}
              </div>
              <span style={{ color: baseStyle.textColor, fontSize: 14, flex: 1 }}>
                {typeof item === 'string' ? item : (item.text || `选项 ${i + 1}`)}
              </span>
              <span style={{ color: baseStyle.mutedColor, fontSize: 16 }}>≡</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const TabsRenderer: React.FC<{ widget: WidgetProps }> = ({ widget }) => {
  const [activeTab, setActiveTab] = React.useState((widget as any).activeTab || '1');
  const tabs = widget.tabs || (widget as any).tabs || [
    { id: '1', label: '标签 1', content: '内容 1' },
    { id: '2', label: '标签 2', content: '内容 2' }
  ];
  
  return (
    <div style={{
      position: 'absolute',
      left: widget.x || 0,
      top: widget.y || 0,
      width: widget.width || 300,
      height: widget.height || 200,
      background: baseStyle.background,
      borderRadius: baseStyle.borderRadius,
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div style={{
        display: 'flex',
        borderBottom: `1px solid ${colors.borderColor}`,
        background: colors.lightGray,
      }}>
        {tabs.map((tab: any) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1,
              padding: '14px 16px',
              fontSize: 14,
              fontWeight: activeTab === tab.id ? 600 : 400,
              color: activeTab === tab.id ? colors.blue : baseStyle.mutedColor,
              background: activeTab === tab.id ? baseStyle.background : 'transparent',
              border: 'none',
              borderBottom: activeTab === tab.id ? `2px solid ${colors.blue}` : '2px solid transparent',
              cursor: 'pointer',
              fontFamily: baseStyle.fontFamily,
              transition: 'all 0.2s ease',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div style={{
        padding: getPadding(widget, 16),
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: baseStyle.textColor,
        fontSize: 14,
        fontFamily: baseStyle.fontFamily,
      }}>
        {tabs.find((t: any) => t.id === activeTab)?.content || '标签页内容'}
      </div>
    </div>
  );
};

export const TimelineRenderer: React.FC<{ widget: WidgetProps }> = ({ widget }) => {
  const items = widget.timelineItems || (widget as any).timelineItems || (widget as any).steps || [];
  
  return (
    <div style={{
      position: 'absolute',
      left: widget.x || 0,
      top: widget.y || 0,
      width: widget.width || 300,
      height: widget.height || 200,
      background: baseStyle.background,
      borderRadius: baseStyle.borderRadius,
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)',
      padding: getPadding(widget, 20),
      overflow: 'auto',
    }}>
      <div style={{ position: 'relative' }}>
        <div style={{
          position: 'absolute',
          left: 11,
          top: 24,
          bottom: 24,
          width: 2,
          background: colors.borderColor,
        }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {items.map((item: any, i: number) => (
            <div key={item.id || i} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <div style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                background: colors.blue,
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                fontWeight: 600,
                flexShrink: 0,
                zIndex: 1,
              }}>
                {i + 1}
              </div>
              <div style={{ paddingTop: 2 }}>
                <div style={{
                  fontWeight: 600,
                  fontSize: 15,
                  color: baseStyle.textColor,
                  marginBottom: 2,
                  fontFamily: baseStyle.fontFamily,
                }}>
                  {item.title}
                </div>
                {item.description && (
                  <div style={{
                    fontSize: 13,
                    color: baseStyle.mutedColor,
                    fontFamily: baseStyle.fontFamily,
                  }}>
                    {item.description}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const ProgressRenderer: React.FC<{ widget: WidgetProps }> = ({ widget }) => {
  return (
    <div style={{
      position: 'absolute',
      left: widget.x || 0,
      top: widget.y || 0,
      width: widget.width || 300,
      height: widget.height || 60,
      padding: getPadding(widget, 16),
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      gap: 8,
    }}>
      <div style={{
        fontSize: 13,
        color: baseStyle.mutedColor,
        textAlign: 'center',
        fontFamily: baseStyle.fontFamily,
      }}>
        {widget.label || (widget as any).progress || 0}%
      </div>
      <div style={{
        width: '100%',
        height: 8,
        background: colors.lightGray,
        borderRadius: 4,
        overflow: 'hidden',
      }}>
        <div style={{
          width: `${widget.label || (widget as any).progress || 0}%`,
          height: '100%',
          background: (widget as any).progressColor || colors.blue,
          borderRadius: 4,
          transition: 'width 0.3s ease',
        }} />
      </div>
    </div>
  );
};

export const VideoRenderer: React.FC<{ widget: WidgetProps }> = ({ widget }) => {
  return (
    <div style={{
      position: 'absolute',
      left: widget.x || 0,
      top: widget.y || 0,
      width: widget.width || 320,
      height: widget.height || 180,
      borderRadius: baseStyle.borderRadius,
      overflow: 'hidden',
    }}>
      <video
        src={(widget as any).videoUrl || widget.src}
        poster={(widget as any).poster}
        controls
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />
    </div>
  );
};

export const AudioRenderer: React.FC<{ widget: WidgetProps }> = ({ widget }) => {
  return (
    <div style={{
      position: 'absolute',
      left: widget.x || 0,
      top: widget.y || 0,
      width: widget.width || 300,
      height: widget.height || 80,
      background: baseStyle.background,
      borderRadius: baseStyle.borderRadius,
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)',
      padding: getPadding(widget, 16),
      display: 'flex',
      alignItems: 'center',
      gap: 14,
    }}>
      <div style={{
        width: 44,
        height: 44,
        borderRadius: 22,
        background: colors.blue,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontSize: 16,
        flexShrink: 0,
      }}>
        ▶
      </div>
      <div style={{ flex: 1 }}>
        <div style={{
          fontWeight: 600,
          fontSize: 14,
          color: baseStyle.textColor,
          marginBottom: 6,
          fontFamily: baseStyle.fontFamily,
        }}>
          音频播放器
        </div>
        <audio
          src={widget.src}
          controls
          style={{
            width: '100%',
            height: 32,
          }}
        />
      </div>
    </div>
  );
};

export const QuoteRenderer: React.FC<{ widget: WidgetProps }> = ({ widget }) => {
  return (
    <div style={{
      position: 'absolute',
      left: widget.x || 0,
      top: widget.y || 0,
      width: widget.width || 300,
      height: widget.height || 120,
      padding: getPadding(widget, 20),
      paddingLeft: 24,
      background: colors.lightGray,
      borderLeft: `4px solid ${widget.color || colors.blue}`,
      borderRadius: baseStyle.borderRadius,
    }}>
      {(widget as any).quoteIcon && (
        <div style={{
          fontSize: 28,
          color: widget.color || colors.blue,
          marginBottom: 4,
          lineHeight: 1,
        }}>
          ❝
        </div>
      )}
      <div style={{
        fontSize: 16,
        fontStyle: 'italic',
        color: baseStyle.textColor,
        marginBottom: 8,
        lineHeight: 1.5,
        fontFamily: baseStyle.fontFamily,
      }}>
        "{widget.quoteText || (widget as any).quoteText || '引用内容'}"
      </div>
      {(widget as any).quoteAuthor && (
        <div style={{
          fontSize: 13,
          color: baseStyle.mutedColor,
          textAlign: 'right',
          fontFamily: baseStyle.fontFamily,
        }}>
          — {(widget as any).quoteAuthor}
        </div>
      )}
    </div>
  );
};

export const CodeRenderer: React.FC<{ widget: WidgetProps }> = ({ widget }) => {
  const [copied, setCopied] = React.useState(false);
  
  const copyCode = () => {
    navigator.clipboard.writeText((widget as any).code || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <div style={{
      position: 'absolute',
      left: widget.x || 0,
      top: widget.y || 0,
      width: widget.width || 300,
      height: widget.height || 200,
      background: '#1e1e1e',
      borderRadius: baseStyle.borderRadius,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div style={{
        padding: '10px 14px',
        background: '#111827',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span style={{
          fontSize: 12,
          color: baseStyle.mutedColor,
          fontFamily: 'monospace',
        }}>
          {(widget as any).language || 'javascript'}
        </span>
        <button
          onClick={copyCode}
          style={{
            padding: '4px 10px',
            background: copied ? colors.green : '#374151',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
            fontSize: 12,
            fontFamily: baseStyle.fontFamily,
          }}
        >
          {copied ? '✓ 已复制' : '📋 复制'}
        </button>
      </div>
      <pre style={{
        padding: 16,
        margin: 0,
        color: '#e5e5e5',
        fontSize: 13,
        fontFamily: '"SF Mono", "Fira Code", monospace',
        overflow: 'auto',
        flex: 1,
        lineHeight: 1.5,
      }}>
        {(widget as any).code || '// 代码'}
      </pre>
    </div>
  );
};

export const TableRenderer: React.FC<{ widget: WidgetProps }> = ({ widget }) => {
  const headers = (widget as any).tableHeaders || ['列1', '列2'];
  const data = (widget as any).tableData || [
    ['数据1', '数据2'],
    ['数据3', '数据4']
  ];
  const zebra = (widget as any).zebraStripe;
  
  return (
    <div style={{
      position: 'absolute',
      left: widget.x || 0,
      top: widget.y || 0,
      width: widget.width || 300,
      height: widget.height || 150,
      background: baseStyle.background,
      borderRadius: baseStyle.borderRadius,
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)',
      overflow: 'auto',
    }}>
      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: 13,
        fontFamily: baseStyle.fontFamily,
      }}>
        <thead>
          <tr style={{ background: colors.lightGray }}>
            {headers.map((h: string, i: number) => (
              <th
                key={i}
                style={{
                  padding: '12px 14px',
                  textAlign: 'left',
                  fontWeight: 600,
                  color: baseStyle.textColor,
                  borderBottom: `2px solid ${colors.borderColor}`,
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row: string[], i: number) => (
            <tr
              key={i}
              style={{
                background: zebra && i % 2 === 1 ? colors.lightGray : baseStyle.background,
              }}
            >
              {row.map((cell: string, j: number) => (
                <td
                  key={j}
                  style={{
                    padding: '12px 14px',
                    borderBottom: `1px solid ${colors.borderColor}`,
                    color: baseStyle.textColor,
                  }}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export const TagRenderer: React.FC<{ widget: WidgetProps }> = ({ widget }) => {
  const styleMap: Record<string, { bg: string; color: string }> = {
    default: { bg: colors.lightGray, color: baseStyle.textColor },
    success: { bg: '#dcfce7', color: '#166534' },
    warning: { bg: '#fef3c7', color: '#92400e' },
    error: { bg: '#fee2e2', color: '#991b1b' },
    info: { bg: '#dbeafe', color: '#1e40af' },
  };
  
  const style = styleMap[widget.tagStyle || (widget as any).tagStyle || 'default'] || styleMap.default;
  
  return (
    <div style={{
      position: 'absolute',
      left: widget.x || 0,
      top: widget.y || 0,
      width: widget.width || 'auto',
      minHeight: widget.height || 32,
      padding: getPadding(widget, 8),
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <span style={{
        padding: '4px 12px',
        background: style.bg,
        color: style.color,
        borderRadius: 9999,
        fontSize: 13,
        fontWeight: 500,
        fontFamily: baseStyle.fontFamily,
      }}>
        {widget.tagText || (widget as any).tagText || '标签'}
      </span>
    </div>
  );
};

export const AlertRenderer: React.FC<{ widget: WidgetProps }> = ({ widget }) => {
  const styleMap: Record<string, { bg: string; border: string; title: string; icon: string }> = {
    success: { bg: '#dcfce7', border: colors.green, title: '#166534', icon: '✓' },
    warning: { bg: '#fef3c7', border: colors.orange, title: '#92400e', icon: '⚠' },
    error: { bg: '#fee2e2', border: colors.red, title: '#991b1b', icon: '✕' },
    info: { bg: '#dbeafe', border: colors.blue, title: '#1e40af', icon: 'ℹ' },
  };
  
  const style = styleMap[widget.alertType || (widget as any).alertType || 'info'] || styleMap.info;
  
  return (
    <div style={{
      position: 'absolute',
      left: widget.x || 0,
      top: widget.y || 0,
      width: widget.width || 300,
      height: widget.height || 80,
      padding: getPadding(widget, 16),
      background: style.bg,
      borderLeft: `4px solid ${style.border}`,
      borderRadius: baseStyle.borderRadius,
    }}>
      <div style={{
        fontWeight: 600,
        color: style.title,
        marginBottom: 4,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        fontSize: 14,
        fontFamily: baseStyle.fontFamily,
      }}>
        <span>{style.icon}</span>
        {widget.alertTitle || (widget as any).alertTitle || '提示'}
      </div>
      <div style={{
        color: baseStyle.textColor,
        fontSize: 14,
        fontFamily: baseStyle.fontFamily,
      }}>
        {widget.alertContent || (widget as any).alertContent || '提示内容'}
      </div>
    </div>
  );
};

export const ChecklistRenderer: React.FC<{ widget: WidgetProps }> = ({ widget }) => {
  const items = (widget as any).checklistItems || (widget as any).items || [];
  
  return (
    <div style={{
      position: 'absolute',
      left: widget.x || 0,
      top: widget.y || 0,
      width: widget.width || 300,
      height: widget.height || 200,
      background: baseStyle.background,
      borderRadius: baseStyle.borderRadius,
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)',
      padding: getPadding(widget, 16),
      overflow: 'auto',
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {items.map((item: any, i: number) => (
          <div key={item.id || i} style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            fontFamily: baseStyle.fontFamily,
          }}>
            <div style={{
              width: 22,
              height: 22,
              borderRadius: 11,
              border: `2px solid ${colors.borderColor}`,
              background: baseStyle.background,
              flexShrink: 0,
            }} />
            <span style={{
              fontSize: 14,
              color: baseStyle.textColor,
            }}>
              {typeof item === 'string' ? item : (item.text || `选项 ${i + 1}`)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const QuizRenderer: React.FC<{ widget: WidgetProps }> = ({ widget }) => {
  return (
    <div style={{
      position: 'absolute',
      left: widget.x || 0,
      top: widget.y || 0,
      width: widget.width || 300,
      height: widget.height || 200,
      background: baseStyle.background,
      borderRadius: baseStyle.borderRadius,
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)',
      padding: getPadding(widget, 20),
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
    }}>
      <div style={{
        fontSize: 40,
        marginBottom: 12,
      }}>
        ❓
      </div>
      <div style={{
        fontWeight: 600,
        fontSize: 16,
        color: baseStyle.textColor,
        fontFamily: baseStyle.fontFamily,
      }}>
        {widget.question || (widget as any).question || '测验题'}
      </div>
    </div>
  );
};

export const AnswerSheetRenderer: React.FC<{ widget: WidgetProps }> = ({ widget }) => {
  return (
    <div style={{
      position: 'absolute',
      left: widget.x || 0,
      top: widget.y || 0,
      width: widget.width || 300,
      height: widget.height || 200,
      background: baseStyle.background,
      borderRadius: baseStyle.borderRadius,
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)',
      padding: getPadding(widget, 20),
      overflow: 'auto',
    }}>
      <div style={{
        fontWeight: 600,
        fontSize: 16,
        color: baseStyle.textColor,
        marginBottom: 16,
        fontFamily: baseStyle.fontFamily,
      }}>
        答题卡
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: 8,
      }}>
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            border: `2px solid ${colors.borderColor}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 13,
            color: baseStyle.mutedColor,
            fontFamily: baseStyle.fontFamily,
          }}>
            {i + 1}
          </div>
        ))}
      </div>
    </div>
  );
};

export const AnswerExplanationRenderer: React.FC<{ widget: WidgetProps }> = ({ widget }) => {
  return (
    <div style={{
      position: 'absolute',
      left: widget.x || 0,
      top: widget.y || 0,
      width: widget.width || 300,
      height: widget.height || 120,
      background: '#dbeafe',
      borderRadius: baseStyle.borderRadius,
      padding: getPadding(widget, 16),
      borderLeft: `4px solid ${colors.blue}`,
    }}>
      <div style={{
        fontWeight: 600,
        fontSize: 14,
        color: '#1e40af',
        marginBottom: 6,
        fontFamily: baseStyle.fontFamily,
      }}>
        答案解析
      </div>
      <div style={{
        fontSize: 14,
        color: baseStyle.textColor,
        fontFamily: baseStyle.fontFamily,
        lineHeight: 1.5,
      }}>
        {(widget as any).explanation || '这里是答案解析内容'}
      </div>
    </div>
  );
};

export const ScoreDisplayRenderer: React.FC<{ widget: WidgetProps }> = ({ widget }) => {
  return (
    <div style={{
      position: 'absolute',
      left: widget.x || 0,
      top: widget.y || 0,
      width: widget.width || 200,
      height: widget.height || 120,
      background: colors.blue,
      borderRadius: baseStyle.borderRadius,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: getPadding(widget, 20),
    }}>
      <div style={{
        fontSize: 42,
        fontWeight: 700,
        color: '#ffffff',
        fontFamily: baseStyle.fontFamily,
      }}>
        {(widget as any).score || 0}
      </div>
      <div style={{
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
        fontFamily: baseStyle.fontFamily,
      }}>
        {(widget as any).scoreLabel || '得分'}
      </div>
    </div>
  );
};

export const DrawingRenderer: React.FC<{ widget: WidgetProps }> = ({ widget }) => {
  return (
    <div style={{
      position: 'absolute',
      left: widget.x || 0,
      top: widget.y || 0,
      width: widget.width || 300,
      height: widget.height || 200,
      background: baseStyle.background,
      borderRadius: baseStyle.borderRadius,
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)',
      border: `2px dashed ${colors.borderColor}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        textAlign: 'center',
        color: baseStyle.mutedColor,
        fontFamily: baseStyle.fontFamily,
      }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>✏️</div>
        <div style={{ fontSize: 14 }}>绘图区域</div>
      </div>
    </div>
  );
};

export const DrawingPreviewRenderer: React.FC<{ widget: WidgetProps }> = ({ widget }) => {
  return (
    <div style={{
      position: 'absolute',
      left: widget.x || 0,
      top: widget.y || 0,
      width: widget.width || 300,
      height: widget.height || 200,
      background: baseStyle.background,
      borderRadius: baseStyle.borderRadius,
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)',
      overflow: 'hidden',
    }}>
      <div style={{
        width: '100%',
        height: '100%',
        background: '#fafafa',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: baseStyle.mutedColor,
        fontFamily: baseStyle.fontFamily,
        fontSize: 14,
      }}>
        绘图预览
      </div>
    </div>
  );
};

export const DividerRenderer: React.FC<{ widget: WidgetProps }> = ({ widget }) => {
  return (
    <div style={{
      position: 'absolute',
      left: widget.x || 0,
      top: widget.y || 0,
      width: widget.width || '100%',
      minHeight: widget.height || 1,
      padding: `${getPadding(widget, 16)} 0`,
    }}>
      <div style={{
        height: widget.height || 1,
        background: widget.color || colors.borderColor,
      }} />
    </div>
  );
};

export const SpacerRenderer: React.FC<{ widget: WidgetProps }> = ({ widget }) => {
  return (
    <div style={{
      position: 'absolute',
      left: widget.x || 0,
      top: widget.y || 0,
      width: widget.width || '100%',
      height: widget.height || 40,
    }} />
  );
};

export type IconName =
  | 'grid'
  | 'eye'
  | 'upload'
  | 'download'
  | 'settings'
  | 'rotate-cw'
  | 'trash'
  | 'copy'
  | 'arrow-up'
  | 'arrow-down'
  | 'move'
  | 'x'
  | 'zap'
  | 'file-text'
  | 'plus'
  | 'chevron-down'
  | 'chevron-right'
  | 'check'
  | 'edit'
  | 'more-horizontal'
  | 'menu'
  | 'play'
  | 'pause'
  | 'image'
  | 'type'
  | 'layout'
  | 'list'
  | 'square'
  | 'circle'
  | 'minus'
  | 'corner-down-right'
  | 'clock'
  | 'alert-circle'
  | 'info'
  | 'check-circle'
  | 'x-circle'
  | 'star'
  | 'heart'
  | 'flag'
  | 'heading'
  | 'credit-card'
  | 'check-square'
  | 'input'
  | 'toggle-left'
  | 'arrow-up-down'
  | 'pen-tool'
  | 'list-todo'
  | 'folder-tabs'
  | 'bar-chart'
  | 'video'
  | 'volume'
  | 'quote'
  | 'code'
  | 'table'
  | 'tag'
  | 'clipboard-check'
  | 'book-open'
  | 'trophy'
  | 'box'
  | 'arrow-up-bold'
  | 'arrow-down-bold'
  | 'drag';

interface IconRendererProps {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export const IconRenderer: React.FC<IconRendererProps> = ({
  name,
  size = 24,
  color = 'currentColor',
  strokeWidth = 2,
}) => {
  const icons: Record<IconName, React.ReactElement> = {
    grid: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
    eye: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
    upload: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
        <polyline points="17,8 12,3 7,8" />
        <line x1="12" y1="3" x2="12" y2="15" />
      </svg>
    ),
    download: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
        <polyline points="7,10 12,15 17,10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
    ),
    settings: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
      </svg>
    ),
    'rotate-cw': (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
        <polyline points="23,4 23,10 17,10" />
        <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
      </svg>
    ),
    trash: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
        <polyline points="3,6 5,6 21,6" />
        <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
        <line x1="10" y1="11" x2="10" y2="17" />
        <line x1="14" y1="11" x2="14" y2="17" />
      </svg>
    ),
    copy: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
        <rect x="9" y="9" width="13" height="13" rx="2" />
        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
      </svg>
    ),
    'arrow-up': (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
        <line x1="12" y1="19" x2="12" y2="5" />
        <polyline points="5,12 12,5 19,12" />
      </svg>
    ),
    'arrow-down': (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
        <line x1="12" y1="5" x2="12" y2="19" />
        <polyline points="19,12 12,19 5,12" />
      </svg>
    ),
    move: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
        <polyline points="5,9 2,12 5,15" />
        <polyline points="9,5 12,2 15,5" />
        <polyline points="15,19 12,22 9,19" />
        <polyline points="19,9 22,12 19,15" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <line x1="12" y1="2" x2="12" y2="22" />
      </svg>
    ),
    x: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    ),
    zap: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
        <polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2" />
      </svg>
    ),
    'file-text': (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14,2 14,8 20,8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10,9 9,9 8,9" />
      </svg>
    ),
    'arrow-up-bold': (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5}>
        <line x1="12" y1="19" x2="12" y2="5" />
        <polyline points="5,12 12,5 19,12" />
      </svg>
    ),
    'arrow-down-bold': (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5}>
        <line x1="12" y1="5" x2="12" y2="19" />
        <polyline points="19,12 12,19 5,12" />
      </svg>
    ),
    drag: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <circle cx="9" cy="6" r="1.5" />
        <circle cx="15" cy="6" r="1.5" />
        <circle cx="9" cy="12" r="1.5" />
        <circle cx="15" cy="12" r="1.5" />
        <circle cx="9" cy="18" r="1.5" />
        <circle cx="15" cy="18" r="1.5" />
      </svg>
    ),
    plus: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    ),
    'chevron-down': (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
        <polyline points="6,9 12,15 18,9" />
      </svg>
    ),
    'chevron-right': (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
        <polyline points="9,18 15,12 9,6" />
      </svg>
    ),
    check: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
        <polyline points="20,6 9,17 4,12" />
      </svg>
    ),
    edit: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    ),
    'more-horizontal': (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
        <circle cx="12" cy="12" r="1" fill={color} />
        <circle cx="19" cy="12" r="1" fill={color} />
        <circle cx="5" cy="12" r="1" fill={color} />
      </svg>
    ),
    menu: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="18" x2="21" y2="18" />
      </svg>
    ),
    play: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
        <polygon points="5,3 19,12 5,21" fill={color} />
      </svg>
    ),
    pause: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
        <rect x="6" y="4" width="4" height="16" fill={color} />
        <rect x="14" y="4" width="4" height="16" fill={color} />
      </svg>
    ),
    image: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21,15 16,10 5,21" />
      </svg>
    ),
    type: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
        <polyline points="4,7 4,4 20,4 20,7" />
        <line x1="9" y1="20" x2="15" y2="20" />
        <line x1="12" y1="4" x2="12" y2="20" />
      </svg>
    ),
    layout: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <line x1="3" y1="9" x2="21" y2="9" />
        <line x1="9" y1="21" x2="9" y2="9" />
      </svg>
    ),
    list: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
        <line x1="8" y1="6" x2="21" y2="6" />
        <line x1="8" y1="12" x2="21" y2="12" />
        <line x1="8" y1="18" x2="21" y2="18" />
        <line x1="3" y1="6" x2="3.01" y2="6" />
        <line x1="3" y1="12" x2="3.01" y2="12" />
        <line x1="3" y1="18" x2="3.01" y2="18" />
      </svg>
    ),
    square: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
        <rect x="3" y="3" width="18" height="18" rx="2" />
      </svg>
    ),
    circle: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
        <circle cx="12" cy="12" r="10" />
      </svg>
    ),
    minus: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    ),
    'corner-down-right': (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
        <polyline points="15,10 20,15 15,20" />
        <path d="M4 4v7a4 4 0 004 4h12" />
      </svg>
    ),
    clock: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
        <circle cx="12" cy="12" r="10" />
        <polyline points="12,6 12,12 16,14" />
      </svg>
    ),
    'alert-circle': (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
    info: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
    ),
    'check-circle': (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
        <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
        <polyline points="22,4 12,14.01 9,11.01" />
      </svg>
    ),
    'x-circle': (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
      </svg>
    ),
    star: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
      </svg>
    ),
    heart: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
      </svg>
    ),
    flag: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
        <line x1="4" y1="22" x2="4" y2="15" />
      </svg>
    ),
    heading: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
        <path d="M4 12h16M4 6h12M4 18h8" />
      </svg>
    ),
    'credit-card': (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
        <rect x="1" y="4" width="22" height="16" rx="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
    'check-square': (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
        <polyline points="9,11 12,14 22,4" />
        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
      </svg>
    ),
    input: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
        <polyline points="4,7 4,4 20,4 20,7" />
        <line x1="9" y1="20" x2="15" y2="20" />
        <line x1="12" y1="4" x2="12" y2="20" />
      </svg>
    ),
    'toggle-left': (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
        <rect x="1" y="5" width="22" height="14" rx="7" />
        <circle cx="8" cy="12" r="3" />
      </svg>
    ),
    'arrow-up-down': (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
        <line x1="12" y1="5" x2="12" y2="19" />
        <polyline points="19,12 12,5 5,12" />
        <polyline points="5,12 12,19 19,12" />
      </svg>
    ),
    'pen-tool': (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
        <path d="M12 19l7-7 3 3-7 7-3-3z" />
        <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
        <path d="M2 2l7.586 7.586" />
        <circle cx="11" cy="11" r="2" />
      </svg>
    ),
    'list-todo': (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
        <rect x="3" y="5" width="6" height="6" rx="1" />
        <polyline points="5,7 6,8 7,7" />
        <line x1="12" y1="8" x2="21" y2="8" />
        <rect x="3" y="14" width="6" height="6" rx="1" />
        <line x1="12" y1="17" x2="21" y2="17" />
      </svg>
    ),
    'folder-tabs': (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
        <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
        <line x1="12" y1="11" x2="12" y2="17" />
        <line x1="9" y1="14" x2="15" y2="14" />
      </svg>
    ),
    'bar-chart': (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
        <line x1="12" y1="20" x2="12" y2="10" />
        <line x1="18" y1="20" x2="18" y2="4" />
        <line x1="6" y1="20" x2="6" y2="16" />
      </svg>
    ),
    video: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <polygon points="10,8 16,12 10,16" fill={color} />
      </svg>
    ),
    volume: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
        <polygon points="11,5 6,9 2,9 2,15 6,15 11,19" />
        <path d="M19.07 4.93a10 10 0 010 14.14" />
        <path d="M15.54 8.46a5 5 0 010 7.07" />
      </svg>
    ),
    quote: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
        <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21" />
        <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3" />
      </svg>
    ),
    code: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
        <polyline points="16,18 22,12 16,6" />
        <polyline points="8,6 2,12 8,18" />
      </svg>
    ),
    table: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <line x1="3" y1="9" x2="21" y2="9" />
        <line x1="3" y1="15" x2="21" y2="15" />
        <line x1="9" y1="3" x2="9" y2="21" />
        <line x1="15" y1="3" x2="15" y2="21" />
      </svg>
    ),
    tag: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
        <line x1="7" y1="7" x2="7.01" y2="7" />
      </svg>
    ),
    'clipboard-check': (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
        <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" />
        <rect x="8" y="2" width="8" height="4" rx="1" />
        <polyline points="9,11 12,14 22,4" />
      </svg>
    ),
    'book-open': (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
        <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" />
        <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
      </svg>
    ),
    trophy: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
        <path d="M6 9H4.5a2.5 2.5 0 010-5H6" />
        <path d="M18 9h1.5a2.5 2.5 0 000-5H18" />
        <path d="M4 22h16" />
        <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
        <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
        <path d="M18 2H6v7a6 6 0 0012 0V2z" />
      </svg>
    ),
    box: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
        <polyline points="3.27,6.96 12,12.01 20.73,6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    ),
  };

  return icons[name] || <span style={{ fontSize: size }}>?</span>;
};
