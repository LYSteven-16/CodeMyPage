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
  ScoreDisplayRenderer,
  DividerRenderer,
  SpacerRenderer,
} from './NewStyleRenderers';

interface Props {
  component: WidgetProps;
  style: React.CSSProperties;
  mode?: 'edit' | 'preview';
}

const wrapRenderer = (renderer: React.FC<{ widget: WidgetProps }>) => {
  return ({ component, style }: Props) => {
    const widget: WidgetProps = {
      ...component,
      x: typeof style.left === 'number' ? style.left : 0,
      y: typeof style.top === 'number' ? style.top : 0,
    };
    return renderer({ widget });
  };
};

const WrappedHeading = wrapRenderer(HeadingRenderer);
const WrappedText = wrapRenderer(TextRenderer);
const WrappedImage = wrapRenderer(ImageRenderer);
const WrappedButton = wrapRenderer(ButtonRenderer);
const WrappedCard = wrapRenderer(CardRenderer);
const WrappedAccordion = wrapRenderer(AccordionRenderer);
const WrappedChoice = wrapRenderer(ChoiceRenderer);
const WrappedFillBlank = wrapRenderer(FillBlankRenderer);
const WrappedTrueFalse = wrapRenderer(TrueFalseRenderer);
const WrappedSortable = wrapRenderer(SortableRenderer);
const WrappedTabs = wrapRenderer(TabsRenderer);
const WrappedTimeline = wrapRenderer(TimelineRenderer);
const WrappedProgress = wrapRenderer(ProgressRenderer);
const WrappedVideo = wrapRenderer(VideoRenderer);
const WrappedAudio = wrapRenderer(AudioRenderer);
const WrappedQuote = wrapRenderer(QuoteRenderer);
const WrappedCode = wrapRenderer(CodeRenderer);
const WrappedTable = wrapRenderer(TableRenderer);
const WrappedTag = wrapRenderer(TagRenderer);
const WrappedAlert = wrapRenderer(AlertRenderer);
const WrappedChecklist = wrapRenderer(ChecklistRenderer);
const WrappedQuiz = wrapRenderer(QuizRenderer);
const WrappedAnswerSheet = wrapRenderer(AnswerSheetRenderer);
const WrappedAnswerExplanation = wrapRenderer(AnswerExplanationRenderer);
const WrappedScoreDisplay = wrapRenderer(ScoreDisplayRenderer);
const WrappedDivider = wrapRenderer(DividerRenderer);
const WrappedSpacer = wrapRenderer(SpacerRenderer);

const renderDrawing = (component: WidgetProps, style: React.CSSProperties, mode: 'edit' | 'preview') => {
  if (mode === 'preview') {
    return <DrawingPreviewRenderer widget={{ ...component, x: style.left as number || 0, y: style.top as number || 0 }} />;
  }
  return <DrawingRenderer widget={{ ...component, x: style.left as number || 0, y: style.top as number || 0 }} />;
};

export function ComponentRenderer({ component, style, mode = 'edit' }: Props) {
  switch (component.type) {
    case 'heading':
      return <WrappedHeading component={component} style={style} />;
    case 'text':
      return <WrappedText component={component} style={style} />;
    case 'image':
      return <WrappedImage component={component} style={style} />;
    case 'button':
      return <WrappedButton component={component} style={style} />;
    case 'card':
      return <WrappedCard component={component} style={style} />;
    case 'accordion':
      return <WrappedAccordion component={component} style={style} />;
    case 'quiz':
      return <WrappedQuiz component={component} style={style} />;
    case 'choice':
      return <WrappedChoice component={component} style={style} />;
    case 'fillBlank':
      return <WrappedFillBlank component={component} style={style} />;
    case 'trueFalse':
      return <WrappedTrueFalse component={component} style={style} />;
    case 'sortable':
      return <WrappedSortable component={component} style={style} />;
    case 'drawing':
      return renderDrawing(component, style, mode);
    case 'checklist':
      return <WrappedChecklist component={component} style={style} />;
    case 'tabs':
      return <WrappedTabs component={component} style={style} />;
    case 'timeline':
      return <WrappedTimeline component={component} style={style} />;
    case 'progress':
      return <WrappedProgress component={component} style={style} />;
    case 'video':
      return <WrappedVideo component={component} style={style} />;
    case 'audio':
      return <WrappedAudio component={component} style={style} />;
    case 'quote':
      return <WrappedQuote component={component} style={style} />;
    case 'code':
      return <WrappedCode component={component} style={style} />;
    case 'table':
      return <WrappedTable component={component} style={style} />;
    case 'tag':
      return <WrappedTag component={component} style={style} />;
    case 'alert':
      return <WrappedAlert component={component} style={style} />;
    case 'answerSheet':
      return <WrappedAnswerSheet component={component} style={style} />;
    case 'answerExplanation':
      return <WrappedAnswerExplanation component={component} style={style} />;
    case 'scoreDisplay':
      return <WrappedScoreDisplay component={component} style={style} />;
    case 'divider':
      return <WrappedDivider component={component} style={style} />;
    case 'spacer':
      return <WrappedSpacer component={component} style={style} />;
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
