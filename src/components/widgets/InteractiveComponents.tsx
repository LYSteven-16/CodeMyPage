import React from 'react';
import type { WidgetProps } from '../../types';

export const ChoiceRenderer: React.FC<{ component: WidgetProps; style: React.CSSProperties }> = ({ component, style }) => {
  const [selectedOption, setSelectedOption] = React.useState<number | null>(null);
  const [showResult, setShowResult] = React.useState(false);
  
  const options = (component as any).options || ['选项 A', '选项 B', '选项 C', '选项 D'];
  const correctIdx = (component as any).correctIndex ?? 0;
  
  const checkChoice = (idx: number) => {
    setSelectedOption(idx);
    setShowResult(true);
  };
  
  return (
    <div style={style}>
      <div style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
        backgroundColor: '#fff',
        borderRadius: 8,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        overflow: 'auto'
      }}>
        <div style={{
          fontWeight: 'bold',
          marginBottom: 12,
          color: (component as any).questionColor || '#1f2937'
        }}>
          {component.question || '请选择正确答案：'}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {options.map((opt: string, i: number) => {
            const isCorrect = i === correctIdx;
            let bgColor = '#fff', borderColor = '#e5e7eb';
            
            if (showResult && selectedOption === i) {
              bgColor = isCorrect ? '#d1fae5' : '#fee2e2';
              borderColor = isCorrect ? '#10b981' : '#ef4444';
            }
            
            return (
              <div
                key={i}
                onClick={() => checkChoice(i)}
                style={{
                  padding: '10px 14px',
                  border: `2px solid ${borderColor}`,
                  borderRadius: 8,
                  cursor: 'pointer',
                  color: '#374151',
                  backgroundColor: bgColor,
                  transition: 'all 0.2s'
                }}
              >
                ○ {opt}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export const FillBlankRenderer: React.FC<{ component: WidgetProps; style: React.CSSProperties }> = ({ component, style }) => {
  const [blankValues, setBlankValues] = React.useState<Record<string, string>>({});
  
  const blanks = (component as any).blanks || [];
  
  const checkFillBlanks = () => {
    blanks.forEach((blank: any) => {
      const input = document.getElementById(`blank-${blank.id}`) as HTMLInputElement;
      if (input) {
        const isCorrect = input.value.trim().toLowerCase() === (blank.answer || '').toLowerCase();
        input.style.borderColor = isCorrect ? '#10b981' : '#ef4444';
        input.style.backgroundColor = isCorrect ? '#d1fae5' : '#fee2e2';
      }
    });
  };
  
  return (
    <div style={style}>
      <div style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
        backgroundColor: '#fff',
        borderRadius: 8,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        overflow: 'auto'
      }}>
        <div style={{ color: component.color || '#374151', marginBottom: 12 }}>
          {component.content || '填空题内容'}
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
          {blanks.map((blank: any) => (
            <input
              key={blank.id}
              id={`blank-${blank.id}`}
              placeholder={blank.hint || '请填写...'}
              value={blankValues[blank.id] || ''}
              onChange={(e) => setBlankValues({...blankValues, [blank.id]: e.target.value})}
              style={{
                border: '1px solid #d1d5db',
                borderRadius: 4,
                padding: '6px 10px',
                width: 120,
                fontSize: 14
              }}
            />
          ))}
        </div>
        <button
          onClick={checkFillBlanks}
          style={{
            padding: '8px 16px',
            background: '#3b82f6',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
            alignSelf: 'flex-start'
          }}
        >
          检查答案
        </button>
      </div>
    </div>
  );
};

export const TrueFalseRenderer: React.FC<{ component: WidgetProps; style: React.CSSProperties }> = ({ component, style }) => {
  const [selectedAnswer, setSelectedAnswer] = React.useState<boolean | null>(null);
  const [showResult, setShowResult] = React.useState(false);
  
  const correctBool = (component as any).correctBool ?? true;
  
  const checkTrueFalse = (answer: boolean) => {
    setSelectedAnswer(answer);
    setShowResult(true);
  };
  
  return (
    <div style={style}>
      <div style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
        backgroundColor: '#fff',
        borderRadius: 8,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }}>
        <div style={{ marginBottom: 12, color: component.color || '#1f2937' }}>
          {(component as any).statement || '请判断对错：'}
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={() => checkTrueFalse(true)}
            style={{
              padding: '10px 24px',
              border: `2px solid ${showResult && selectedAnswer === true ? (correctBool ? '#10b981' : '#ef4444') : '#10b981'}`,
              borderRadius: 8,
              backgroundColor: showResult && selectedAnswer === true ? (correctBool ? '#d1fae5' : '#fee2e2') : '#fff',
              color: '#10b981',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            √ 正确
          </button>
          <button
            onClick={() => checkTrueFalse(false)}
            style={{
              padding: '10px 24px',
              border: `2px solid ${showResult && selectedAnswer === false ? (!correctBool ? '#10b981' : '#ef4444') : '#ef4444'}`,
              borderRadius: 8,
              backgroundColor: showResult && selectedAnswer === false ? (!correctBool ? '#d1fae5' : '#fee2e2') : '#fff',
              color: '#ef4444',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            × 错误
          </button>
        </div>
      </div>
    </div>
  );
};

export const SortableRenderer: React.FC<{ component: WidgetProps; style: React.CSSProperties }> = ({ component, style }) => {
  const [sortItems, setSortItems] = React.useState((component as any).sortableItems || []);
  const [dragIdx, setDragIdx] = React.useState<number | null>(null);
  const [dropIndicator, setDropIndicator] = React.useState<number | null>(null);
  
  const containerHeight = 150;
  
  const handleSortMouseMove = (e: React.MouseEvent) => {
    if (dragIdx === null) return;
    const items = sortItems.length;
    if (items === 0) return;
    const itemHeight = containerHeight / items;
    const mouseY = e.nativeEvent.offsetY;
    const newDropIdx = Math.max(0, Math.min(items - 1, Math.floor(mouseY / itemHeight)));
    setDropIndicator(newDropIdx);
  };
  
  const handleSortMouseUp = () => {
    if (dragIdx !== null && dropIndicator !== null && dragIdx !== dropIndicator) {
      const newItems = [...sortItems];
      const [removed] = newItems.splice(dragIdx, 1);
      newItems.splice(dropIndicator, 0, removed);
      setSortItems(newItems);
    }
    setDragIdx(null);
    setDropIndicator(null);
  };
  
  return (
    <div style={style}>
      <div style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
        backgroundColor: '#fff',
        borderRadius: 8,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }}>
        <div style={{ fontWeight: "bold", marginBottom: 12, userSelect: "none" }}>
          请按正确顺序排列：
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            flex: 1,
            userSelect: "none",
            WebkitUserSelect: "none",
            MozUserSelect: "none"
          }}
          onMouseMove={handleSortMouseMove}
          onMouseUp={handleSortMouseUp}
          onMouseLeave={() => { setDragIdx(null); setDropIndicator(null); }}
        >
          {sortItems.map((item: string, i: number) => {
            const isDragging = dragIdx === i;
            const isDropTarget = dropIndicator === i && dragIdx !== null && dragIdx !== i;
            
            return (
              <div
                key={i}
                onMouseDown={() => setDragIdx(i)}
                style={{
                  padding: '10px 14px',
                  border: `2px solid ${isDropTarget ? '#3b82f6' : '#e5e7eb'}`,
                  borderRadius: 8,
                  backgroundColor: isDragging ? '#e0f2fe' : (isDropTarget ? '#f0f9ff' : '#f9fafb'),
                  cursor: 'grab',
                  display: 'flex',
                  userSelect: 'none',
                  alignItems: 'center',
                  gap: 8,
                  transform: isDragging ? 'scale(0.98)' : 'scale(1)',
                  transition: isDragging ? 'none' : 'all 0.15s'
                }}
              >
                ☰ {item}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
