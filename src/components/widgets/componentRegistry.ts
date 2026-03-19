import type { WidgetType } from '../../types';
import React from 'react';
import type { WidgetProps } from '../../types';

export interface ComponentRenderer {
  component: React.FC<{ component: WidgetProps; style: React.CSSProperties }>;
}

export const componentRegistry: Record<WidgetType, ComponentRenderer['component']> = {} as any;

export function registerComponent(type: WidgetType, renderer: ComponentRenderer['component']) {
  componentRegistry[type] = renderer;
}
