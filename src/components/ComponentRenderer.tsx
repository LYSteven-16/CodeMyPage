import React from 'react';
import type { WidgetProps } from '../types';
import {
  HeadingRenderer,
  TextRenderer,
  ImageRenderer,
  ButtonRenderer,
  CardRenderer,
  AccordionRenderer,
  ChoiceRenderer,
  FillBlankRenderer,
  TrueFalseRenderer,
  SortableRenderer,
  DrawingRenderer,
  DrawingPreviewRenderer,
  ChecklistRenderer,
  TabsRenderer,
  TimelineRenderer,
  ProgressRenderer,
  VideoRenderer,
  AudioRenderer,
  QuoteRenderer,
  CodeRenderer,
  TableRenderer,
  TagRenderer,
  AlertRenderer,
  QuizRenderer,
  AnswerSheetRenderer,
  AnswerExplanationRenderer,
  ScoreDisplayRenderer
} from './widgets';

interface Props {
  component: WidgetProps;
  style: React.CSSProperties;
  mode?: 'edit' | 'preview';
}

export function ComponentRenderer({ component, style, mode = 'edit' }: Props) {
  const renderDrawing = () => {
    if (mode === 'preview') {
      return <DrawingPreviewRenderer component={component} style={style} />;
    }
    return <DrawingRenderer component={component} style={style} />;
  };
  
  switch (component.type) {
    case 'heading':
      return <HeadingRenderer component={component} style={style} />;
    case 'text':
      return <TextRenderer component={component} style={style} />;
    case 'image':
      return <ImageRenderer component={component} style={style} />;
    case 'button':
      return <ButtonRenderer component={component} style={style} />;
    case 'card':
      return <CardRenderer component={component} style={style} />;
    case 'accordion':
      return <AccordionRenderer component={component} style={style} />;
    case 'quiz':
      return <QuizRenderer component={component} style={style} />;
    case 'choice':
      return <ChoiceRenderer component={component} style={style} />;
    case 'fillBlank':
      return <FillBlankRenderer component={component} style={style} />;
    case 'trueFalse':
      return <TrueFalseRenderer component={component} style={style} />;
    case 'sortable':
      return <SortableRenderer component={component} style={style} />;
    case 'drawing':
      return renderDrawing();
    case 'checklist':
      return <ChecklistRenderer component={component} style={style} />;
    case 'tabs':
      return <TabsRenderer component={component} style={style} />;
    case 'timeline':
      return <TimelineRenderer component={component} style={style} />;
    case 'progress':
      return <ProgressRenderer component={component} style={style} />;
    case 'video':
      return <VideoRenderer component={component} style={style} />;
    case 'audio':
      return <AudioRenderer component={component} style={style} />;
    case 'quote':
      return <QuoteRenderer component={component} style={style} />;
    case 'code':
      return <CodeRenderer component={component} style={style} />;
    case 'table':
      return <TableRenderer component={component} style={style} />;
    case 'tag':
      return <TagRenderer component={component} style={style} />;
    case 'alert':
      return <AlertRenderer component={component} style={style} />;
    case 'answerSheet':
      return <AnswerSheetRenderer component={component} style={style} />;
    case 'answerExplanation':
      return <AnswerExplanationRenderer component={component} style={style} />;
    case 'scoreDisplay':
      return <ScoreDisplayRenderer component={component} style={style} />;
    default:
      return (
        <div style={style}>
          <div style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: '100%',
            height: '100%',
            backgroundColor: '#f3f4f6',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#9ca3af'
          }}>
            {component.type}
          </div>
        </div>
      );
  }
}
