import React from 'react';
import type { WidgetProps } from '../../types';

export const QuizRenderer: React.FC<{ component: WidgetProps; style: React.CSSProperties }> = ({ component, style }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  
  return (
    <div style={style}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: '100%',
          height: '100%',
          backgroundColor: '#fff',
          borderRadius: component.borderRadius || 8,
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          cursor: 'pointer'
        }}
      >
        <div style={{
          fontWeight: 'bold',
          color: (component as any).questionColor || '#1f2937',
          marginBottom: 12
        }}>
          {component.question || '问题'}
        </div>
        <div style={{
          color: (component as any).answerColor || '#059669',
          backgroundColor: '#d1fae5',
          padding: 12,
          borderRadius: 4,
          opacity: isOpen ? 1 : 0.5
        }}>
          {isOpen ? (component as any).answer || '答案' : '点击查看答案'}
        </div>
      </div>
    </div>
  );
};

export const AnswerSheetRenderer: React.FC<{ component: WidgetProps; style: React.CSSProperties }> = ({ component, style }) => {
  const totalQuestions = (component as any).totalQuestions || 10;
  const answeredQuestions = (component as any).answeredQuestions || [];
  const markedQuestions = (component as any).markedQuestions || [];
  const questions = Array.from({ length: totalQuestions }, (_, i) => i + 1);
  
  const getQuestionColor = (q: number) => {
    if (markedQuestions.includes(q)) return { bg: '#fef3c7', border: '#f59e0b', text: '#92400e' };
    if (answeredQuestions.includes(q)) return { bg: '#d1fae5', border: '#10b981', text: '#065f46' };
    return { bg: '#f3f4f6', border: '#d1d5db', text: '#6b7280' };
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
        overflow: 'auto'
      }}>
        <div style={{
          fontWeight: 'bold',
          marginBottom: 12,
          color: '#1f2937'
        }}>
          答题卡
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: 8
        }}>
          {questions.map((q: number) => {
            const colors = getQuestionColor(q);
            const isMarked = markedQuestions.includes(q);
            
            return (
              <div
                key={q}
                style={{
                  padding: '8px 12px',
                  backgroundColor: colors.bg,
                  border: `2px solid ${colors.border}`,
                  borderRadius: 6,
                  textAlign: 'center',
                  fontSize: 14,
                  color: colors.text,
                  position: 'relative'
                }}
              >
                {q}
                {isMarked && (
                  <span style={{
                    position: 'absolute',
                    top: -6,
                    right: -6,
                    width: 16,
                    height: 16,
                    backgroundColor: '#ef4444',
                    borderRadius: '50%',
                    fontSize: 10,
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    !
                  </span>
                )}
              </div>
            );
          })}
        </div>
        <div style={{
          marginTop: 16,
          display: 'flex',
          gap: 16,
          fontSize: 12,
          color: '#6b7280'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 12, height: 12, backgroundColor: '#d1fae5', border: '1px solid #10b981', borderRadius: 2 }} />
            <span>已答</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 12, height: 12, backgroundColor: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: 2 }} />
            <span>未答</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 12, height: 12, backgroundColor: '#fef3c7', border: '1px solid #f59e0b', borderRadius: 2 }} />
            <span>标记</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const AnswerExplanationRenderer: React.FC<{ component: WidgetProps; style: React.CSSProperties }> = ({ component, style }) => {
  const [showTip, setShowTip] = React.useState(false);
  
  const difficultyMap: Record<string, { bg: string; text: string }> = {
    easy: { bg: '#d1fae5', text: '#065f46' },
    medium: { bg: '#fef3c7', text: '#92400e' },
    hard: { bg: '#fee2e2', text: '#991b1b' }
  };
  
  const difficulty = difficultyMap[(component as any).difficulty || 'medium'] || difficultyMap.medium;
  
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
        overflow: 'auto'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12
        }}>
          <div style={{
            fontWeight: 'bold',
            fontSize: 16,
            color: '#1f2937'
          }}>
            {(component as any).explanationTitle || '答案解析'}
          </div>
          <span style={{
            padding: '4px 10px',
            backgroundColor: difficulty.bg,
            color: difficulty.text,
            borderRadius: 4,
            fontSize: 12,
            fontWeight: 'bold'
          }}>
            {(component as any).difficulty || '中等'}
          </span>
        </div>
        
        {(component as any).relatedQuestion && (
          <div style={{
            padding: 10,
            backgroundColor: '#f3f4f6',
            borderRadius: 4,
            marginBottom: 12,
            fontSize: 14,
            color: '#6b7280'
          }}>
            <strong>相关问题：</strong>
            {(component as any).relatedQuestion}
          </div>
        )}
        
        <div style={{
          color: '#374151',
          lineHeight: 1.6,
          marginBottom: 12
        }}>
          {(component as any).explanationContent || '这里是答案的详细解析内容...'}
        </div>
        
        {(component as any).showTip && (
          <div>
            <button
              onClick={() => setShowTip(!showTip)}
              style={{
                padding: '8px 16px',
                background: '#f3f4f6',
                border: '1px solid #d1d5db',
                borderRadius: 6,
                cursor: 'pointer',
                color: '#374151',
                fontSize: 14,
                marginBottom: 8
              }}
            >
              {showTip ? '🙈 隐藏提示' : '💡 显示提示'}
            </button>
            {showTip && (
              <div style={{
                padding: 10,
                backgroundColor: '#dbeafe',
                borderRadius: 4,
                color: '#1e40af',
                fontSize: 14
              }}>
                💡 {(component as any).tipText || '这是一个学习提示...'}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export const ScoreDisplayRenderer: React.FC<{ component: WidgetProps; style: React.CSSProperties }> = ({ component, style }) => {
  const score = (component as any).score || 0;
  const totalScore = (component as any).totalScore || 100;
  const percentage = (component as any).percentage !== false;
  const percentageValue = Math.round((score / totalScore) * 100);
  
  const feedbackMessages: Record<string, string> = {
    excellent: '太棒了！你掌握得很好！🎉',
    good: '不错！继续保持！👍',
    average: '还需努力，加油！💪',
    needsImprovement: '别灰心，继续学习！📚'
  };
  
  const feedbackColors: Record<string, { bg: string; text: string; icon: string }> = {
    excellent: { bg: '#d1fae5', text: '#065f46', icon: '🏆' },
    good: { bg: '#dbeafe', text: '#1e40af', icon: '✨' },
    average: { bg: '#fef3c7', text: '#92400e', icon: '📈' },
    needsImprovement: { bg: '#fee2e2', text: '#991b1b', icon: '📖' }
  };
  
  const feedbackType = (component as any).feedbackType || (
    percentageValue >= 90 ? 'excellent' :
    percentageValue >= 70 ? 'good' :
    percentageValue >= 60 ? 'average' : 'needsImprovement'
  );
  
  const feedback = feedbackColors[feedbackType];
  
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
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16
      }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>
          {feedback.icon}
        </div>
        
        <div style={{ fontSize: 36, fontWeight: 'bold', color: '#1f2937' }}>
          {percentage ? `${percentageValue}%` : `${score} / ${totalScore}`}
        </div>
        
        {(component as any).showGrade && (
          <div style={{
            padding: '8px 20px',
            backgroundColor: feedback.bg,
            color: feedback.text,
            borderRadius: 9999,
            fontSize: 16,
            fontWeight: 'bold'
          }}>
            {feedbackType === 'excellent' ? '优秀' :
             feedbackType === 'good' ? '良好' :
             feedbackType === 'average' ? '及格' : '不及格'}
          </div>
        )}
        
        <div style={{ textAlign: 'center', color: '#6b7280', fontSize: 14 }}>
          {feedbackMessages[feedbackType]}
        </div>
        
        {(component as any).feedbackMessage && (
          <div style={{
            textAlign: 'center',
            color: '#374151',
            fontSize: 14,
            marginTop: 8
          }}>
            {(component as any).feedbackMessage}
          </div>
        )}
      </div>
    </div>
  );
};
