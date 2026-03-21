import React from 'react';
import { createRoot } from 'react-dom/client';
import { jsPDF } from 'jspdf';
import { ComponentRenderer } from '../components/ComponentRenderer';
import type { WidgetProps } from '../types';

export interface GridSettings {
  dotGridBackground: string;
  canvasBackground: string;
  canvasBorderRadius: number;
}

const CANVAS_WIDTH = 1000;
const CANVAS_MIN_HEIGHT = 1600;

export async function generateVectorPDF(
  components: WidgetProps[],
  gridSettings: GridSettings
): Promise<void> {
  const { default: html2canvas } = await import('html2canvas');

  const canvasHeight = Math.max(
    CANVAS_MIN_HEIGHT,
    ...components.map((c) => (c.y || 0) + (c.height || 200) + 200)
  );

  const container = document.createElement('div');
  container.style.cssText = `
    position: fixed;
    left: -9999px;
    top: 0;
    width: ${CANVAS_WIDTH + 40}px;
    min-height: ${canvasHeight + 40}px;
    background: ${gridSettings.dotGridBackground};
    padding: 20px;
    box-sizing: border-box;
  `;

  const canvas = document.createElement('div');
  canvas.style.cssText = `
    position: relative;
    width: ${CANVAS_WIDTH}px;
    min-height: ${canvasHeight}px;
    background: ${gridSettings.canvasBackground};
    border-radius: ${gridSettings.canvasBorderRadius}px;
    margin: 0 auto;
  `;

  container.appendChild(canvas);
  document.body.appendChild(container);

  const root = createRoot(canvas);
  root.render(
    <>
      {components.map((comp: WidgetProps) => {
        const style: React.CSSProperties = {
          position: 'absolute',
          left: comp.x || 0,
          top: comp.y || 0,
          width: comp.width || 300,
          height: comp.height || 200
        };
        return <ComponentRenderer key={comp.id} component={comp} style={style} mode="preview" />;
      })}
    </>
  );

  await document.fonts.ready;
  await new Promise(resolve => setTimeout(resolve, 500));

  const captureCanvas = await html2canvas(container, {
    scale: 4,
    useCORS: true,
    logging: false,
    backgroundColor: gridSettings.dotGridBackground
  });

  root.unmount();
  document.body.removeChild(container);

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'px',
    format: [captureCanvas.width, captureCanvas.height]
  });

  const imgData = captureCanvas.toDataURL('image/png');
  pdf.addImage(imgData, 'PNG', 0, 0, captureCanvas.width, captureCanvas.height);

  pdf.save('my-page.pdf');
}
