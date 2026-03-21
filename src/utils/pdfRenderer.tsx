import React from 'react';
import { createRoot } from 'react-dom/client';
import { jsPDF } from 'jspdf';
import 'svg2pdf.js';
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
  canvas.id = 'pdf-canvas-' + Date.now();
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

  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('xmlns', svgNS);
  svg.setAttribute('width', String(CANVAS_WIDTH + 40));
  svg.setAttribute('height', String(canvasHeight + 40));
  svg.setAttribute('viewBox', `0 0 ${CANVAS_WIDTH + 40} ${canvasHeight + 40}`);

  const bg = document.createElementNS(svgNS, 'rect');
  bg.setAttribute('width', '100%');
  bg.setAttribute('height', '100%');
  bg.setAttribute('fill', gridSettings.dotGridBackground);
  svg.appendChild(bg);

  const canvasRect = document.createElementNS(svgNS, 'rect');
  canvasRect.setAttribute('x', '20');
  canvasRect.setAttribute('y', '20');
  canvasRect.setAttribute('width', String(CANVAS_WIDTH));
  canvasRect.setAttribute('height', String(canvasHeight));
  canvasRect.setAttribute('fill', gridSettings.canvasBackground);
  if (gridSettings.canvasBorderRadius > 0) {
    canvasRect.setAttribute('rx', String(gridSettings.canvasBorderRadius));
    canvasRect.setAttribute('ry', String(gridSettings.canvasBorderRadius));
  }
  svg.appendChild(canvasRect);

  await convertElementToSvg(canvas, svg, 20, 20);

  root.unmount();
  document.body.removeChild(container);

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: [CANVAS_WIDTH + 40, canvasHeight + 40]
  }) as any;

  await pdf.svg(svg, {
    x: 0,
    y: 0,
    width: CANVAS_WIDTH + 40,
    height: canvasHeight + 40
  });

  pdf.save('my-page.pdf');
}

async function convertElementToSvg(element: Element, svg: SVGSVGElement, offsetX: number, offsetY: number): Promise<void> {
  for (const child of Array.from(element.children)) {
    await processChildElement(child as HTMLElement, svg, offsetX, offsetY);
  }
}

async function processChildElement(el: HTMLElement, svg: SVGSVGElement, offsetX: number, offsetY: number): Promise<void> {
  const style = window.getComputedStyle(el);
  const rect = el.getBoundingClientRect();
  const x = rect.left + offsetX;
  const y = rect.top + offsetY;
  const w = rect.width;
  const h = rect.height;

  const svgNS = 'http://www.w3.org/2000/svg';
  const display = style.display;

  if (display === 'none') return;

  if (el.classList.contains('text-widget') || el.tagName === 'P' || el.tagName === 'SPAN' || el.tagName === 'DIV') {
    if (el.textContent && el.textContent.trim()) {
      const textColor = style.color || '#000000';
      const fontSize = parseInt(style.fontSize) || 16;
      const fontWeight = style.fontWeight;
      const fontFamily = style.fontFamily || 'sans-serif';
      const textAlign = style.textAlign || 'left';

      const lines = el.textContent.split('\n');
      let textY = y + fontSize;

      lines.forEach((line, lineIdx) => {
        const text = document.createElementNS(svgNS, 'text');
        text.setAttribute('x', String(x + 10));
        text.setAttribute('y', String(textY + lineIdx * fontSize * 1.2));
        text.setAttribute('fill', textColor);
        text.setAttribute('font-size', String(fontSize));
        text.setAttribute('font-family', fontFamily.replace(/['"]/g, ''));
        if (fontWeight === 'bold' || parseInt(fontWeight) >= 700) {
          text.setAttribute('font-weight', 'bold');
        }
        text.setAttribute('text-anchor', textAlign === 'center' ? 'middle' : textAlign === 'right' ? 'end' : 'start');
        if (textAlign === 'center') {
          text.setAttribute('x', String(x + w / 2));
        } else if (textAlign === 'right') {
          text.setAttribute('x', String(x + w - 10));
        }
        text.textContent = line;
        svg.appendChild(text);
      });
    }
  }

  if (el.tagName === 'BUTTON' || el.classList.contains('button-widget')) {
    const bgColor = style.backgroundColor || '#3b82f6';
    const textColor = style.color || '#ffffff';
    const borderRadius = parseInt(style.borderRadius) || 4;

    const btn = document.createElementNS(svgNS, 'rect');
    btn.setAttribute('x', String(x));
    btn.setAttribute('y', String(y));
    btn.setAttribute('width', String(w));
    btn.setAttribute('height', String(h));
    btn.setAttribute('fill', bgColor);
    btn.setAttribute('rx', String(borderRadius));
    svg.appendChild(btn);

    const btnText = document.createElementNS(svgNS, 'text');
    btnText.setAttribute('x', String(x + w / 2));
    btnText.setAttribute('y', String(y + h / 2 + 5));
    btnText.setAttribute('fill', textColor);
    btnText.setAttribute('font-size', '14');
    btnText.setAttribute('text-anchor', 'middle');
    btnText.setAttribute('dominant-baseline', 'middle');
    btnText.textContent = el.textContent || 'Button';
    svg.appendChild(btnText);
  }

  if (el.classList.contains('card-widget') || el.tagName === 'ARTICLE') {
    const bgColor = style.backgroundColor || '#ffffff';
    const borderRadius = parseInt(style.borderRadius) || 8;

    const card = document.createElementNS(svgNS, 'rect');
    card.setAttribute('x', String(x));
    card.setAttribute('y', String(y));
    card.setAttribute('width', String(w));
    card.setAttribute('height', String(h));
    card.setAttribute('fill', bgColor);
    card.setAttribute('rx', String(borderRadius));
    card.setAttribute('stroke', '#e0e0e0');
    card.setAttribute('stroke-width', '1');
    svg.appendChild(card);
  }

  if (el.tagName === 'IMG' || el.classList.contains('image-widget')) {
    const borderRadius = parseInt(style.borderRadius) || 0;

    if (el.tagName === 'IMG') {
      const imgRect = document.createElementNS(svgNS, 'rect');
      imgRect.setAttribute('x', String(x));
      imgRect.setAttribute('y', String(y));
      imgRect.setAttribute('width', String(w));
      imgRect.setAttribute('height', String(h));
      imgRect.setAttribute('fill', '#f0f0f0');
      imgRect.setAttribute('rx', String(borderRadius));
      imgRect.setAttribute('stroke', '#e0e0e0');
      svg.appendChild(imgRect);
    } else {
      const imgRect = document.createElementNS(svgNS, 'rect');
      imgRect.setAttribute('x', String(x));
      imgRect.setAttribute('y', String(y));
      imgRect.setAttribute('width', String(w));
      imgRect.setAttribute('height', String(h));
      imgRect.setAttribute('fill', '#f0f0f0');
      imgRect.setAttribute('rx', String(borderRadius));
      imgRect.setAttribute('stroke', '#e0e0e0');
      svg.appendChild(imgRect);
    }
  }

  for (const child of Array.from(el.children)) {
    await processChildElement(child as HTMLElement, svg, offsetX, offsetY);
  }
}
