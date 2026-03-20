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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }} data-correct={correctIdx}>
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
                id={`choice-opt-${component.id}-${i}`}
                data-text={opt}
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
          <div id={`choice-result-${component.id}`} style={{ marginTop: 8, fontWeight: 500, minHeight: 24 }}></div>
        </div>
      </div>
    </div>
  );
};

export const FillBlankRenderer: React.FC<{ component: WidgetProps; style: React.CSSProperties }> = ({ component, style }) => {
  const [blankValues, setBlankValues] = React.useState<Record<string, string>>({});
  const [results, setResults] = React.useState<Record<string, boolean | null>>({});
  const [isChecked, setIsChecked] = React.useState(false);
  
  const blanks = (component as any).blanks || [];
  
  const checkFillBlanks = () => {
    const newResults: Record<string, boolean | null> = {};
    blanks.forEach((blank: any) => {
      const userAnswer = blankValues[blank.id]?.trim().toLowerCase() || '';
      const correctAnswer = (blank.answer || '').toLowerCase();
      newResults[blank.id] = userAnswer === correctAnswer;
    });
    setResults(newResults);
    setIsChecked(true);
  };
  
  const getInputStyle = (blankId: string): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      borderRadius: 6,
      padding: '8px 12px',
      width: 140,
      fontSize: 14,
      outline: 'none',
      transition: 'all 0.2s ease'
    };
    
    if (!isChecked) {
      return {
        ...baseStyle,
        border: '1px solid #d1d5db',
        backgroundColor: '#fff'
      };
    }
    const isCorrect = results[blankId];
    return {
      ...baseStyle,
      border: `2px solid ${isCorrect ? '#10b981' : '#ef4444'}`,
      backgroundColor: isCorrect ? '#d1fae5' : '#fee2e2'
    };
  };
  
  const correctCount = Object.values(results).filter(r => r === true).length;
  const totalBlanks = blanks.length;
  
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
          {blanks.map((blank: any, index: number) => (
            <React.Fragment key={blank.id}>
              <input
                id={`blank-${blank.id}`}
                placeholder={blank.hint || `填空 ${index + 1}`}
                value={blankValues[blank.id] || ''}
                onChange={(e) => setBlankValues({...blankValues, [blank.id]: e.target.value})}
                disabled={isChecked}
                style={getInputStyle(blank.id)}
              />
            </React.Fragment>
          ))}
        </div>
        {isChecked && (
          <div style={{
            padding: '10px 14px',
            backgroundColor: correctCount === totalBlanks ? '#d1fae5' : '#fef3c7',
            borderRadius: 6,
            marginBottom: 12,
            fontSize: 14,
            color: correctCount === totalBlanks ? '#065f46' : '#92400e',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            <span style={{ fontSize: 18 }}>
              {correctCount === totalBlanks ? '🎉' : '📝'}
            </span>
            <span>
              {correctCount === totalBlanks 
                ? '全部正确！' 
                : `答对 ${correctCount} / ${totalBlanks}`}
            </span>
          </div>
        )}
        <div style={{ display: 'flex', gap: 10 }}>
          {!isChecked ? (
            <button
              onClick={checkFillBlanks}
              disabled={Object.keys(blankValues).length === 0}
              style={{
                padding: '10px 20px',
                background: Object.keys(blankValues).length === 0 ? '#9ca3af' : '#3b82f6',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                cursor: Object.keys(blankValues).length === 0 ? 'not-allowed' : 'pointer',
                fontSize: 14,
                fontWeight: 500,
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 4px rgba(59,130,246,0.3)'
              }}
            >
              检查答案
            </button>
          ) : (
            <button
              onClick={() => {
                setBlankValues({});
                setResults({});
                setIsChecked(false);
              }}
              style={{
                padding: '10px 20px',
                background: '#fff',
                color: '#374151',
                border: '2px solid #d1d5db',
                borderRadius: 8,
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 500,
                transition: 'all 0.2s ease'
              }}
            >
              重新作答
            </button>
          )}
        </div>
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
      <div id={`truefalse-${component.id}`} data-correct={correctBool} style={{
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
            id={`tf-true-${component.id}`}
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
            id={`tf-false-${component.id}`}
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
        <div id={`truefalse-result-${component.id}`} style={{ marginTop: 12, fontWeight: 500, minHeight: 24 }}></div>
      </div>
    </div>
  );
};

export const SortableRenderer: React.FC<{ component: WidgetProps; style: React.CSSProperties }> = ({ component, style }) => {
  const [sortItems, setSortItems] = React.useState((component as any).sortableItems || []);
  const [dragIdx, setDragIdx] = React.useState<number | null>(null);
  const [dropIdx, setDropIdx] = React.useState<number | null>(null);
  
  const containerRef = React.useRef<HTMLDivElement>(null);
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragIdx === null || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const itemCount = sortItems.length;
    const itemHeight = (rect.height - 20) / itemCount;
    const idx = Math.max(0, Math.min(itemCount - 1, Math.floor((y - 10) / itemHeight)));
    setDropIdx(idx);
  };
  
  const handleMouseUp = () => {
    if (dragIdx !== null && dropIdx !== null && dragIdx !== dropIdx) {
      const newItems = [...sortItems];
      const [removed] = newItems.splice(dragIdx, 1);
      newItems.splice(dropIdx, 0, removed);
      setSortItems(newItems);
    }
    setDragIdx(null);
    setDropIdx(null);
  };
  
  const handleReset = () => {
    setSortItems((component as any).sortableItems || []);
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
        overflow: 'hidden'
      }}>
        <div style={{ 
          fontWeight: "bold", 
          marginBottom: 10, 
          userSelect: "none",
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ fontSize: 13, color: '#6b7280' }}>请按正确顺序排列</span>
          {sortItems.length > 0 && (
            <button
              onClick={handleReset}
              style={{
                padding: '4px 10px',
                fontSize: 11,
                background: '#f3f4f6',
                border: '1px solid #d1d5db',
                borderRadius: 4,
                cursor: 'pointer',
                color: '#6b7280'
              }}
            >
              重置
            </button>
          )}
        </div>
        <div
          ref={containerRef}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 6,
            flex: 1,
            userSelect: "none",
            WebkitUserSelect: "none",
            MozUserSelect: "none",
            padding: '4px 0'
          }}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => {
            if (dragIdx !== null) handleMouseUp();
          }}
        >
          {sortItems.map((item: string, i: number) => {
            const isDragging = dragIdx === i;
            const isAboveDrop = dragIdx !== null && dropIdx !== null && 
              ((dragIdx < dropIdx && i > dragIdx && i <= dropIdx) || 
               (dragIdx > dropIdx && i < dragIdx && i >= dropIdx));
            
            return (
              <div
                key={`${item}-${i}`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  setDragIdx(i);
                }}
                style={{
                  padding: '12px 14px',
                  border: `2px solid ${isDragging ? '#3b82f6' : isAboveDrop ? '#93c5fd' : '#e5e7eb'}`,
                  borderRadius: 10,
                  backgroundColor: isDragging 
                    ? '#dbeafe' 
                    : isAboveDrop 
                      ? '#eff6ff' 
                      : '#f9fafb',
                  cursor: dragIdx === null ? 'grab' : 'grabbing',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  transform: isDragging 
                    ? 'scale(1.02)' 
                    : isAboveDrop 
                      ? `translateY(${dragIdx < i ? -12 : 12}px)` 
                      : 'translateY(0)',
                  transition: isDragging 
                    ? 'none' 
                    : 'all 0.2s cubic-bezier(0.25, 0.1, 0.25, 1)',
                  boxShadow: isDragging 
                    ? '0 8px 16px rgba(59,130,246,0.2)' 
                    : '0 1px 3px rgba(0,0,0,0.05)',
                  opacity: isDragging ? 0.9 : 1
                }}
              >
                <div style={{
                  width: 20,
                  height: 20,
                  borderRadius: 4,
                  backgroundColor: isDragging ? '#3b82f6' : '#e5e7eb',
                  color: isDragging ? '#fff' : '#9ca3af',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  fontWeight: 'bold',
                  flexShrink: 0,
                  transition: 'all 0.2s'
                }}>
                  {i + 1}
                </div>
                <span style={{
                  color: '#374151',
                  fontSize: 14,
                  flex: 1
                }}>
                  {item}
                </span>
                <div style={{
                  color: '#9ca3af',
                  fontSize: 16,
                  cursor: 'grab'
                }}>
                  ⋮⋮
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
