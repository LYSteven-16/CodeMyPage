import type { WidgetProps } from '../types';
import { PDFRenderer } from './pdfRendererCore';
import { hexToColor } from './canvasRenderer';
import { createDrawerRegistry, type WidgetDrawer } from './widgetDrawers';

export interface PDFGeneratorOptions {
  canvasWidth: number;
  canvasHeight: number;
  padding: number;
  backgroundColor: string;
  innerBackgroundColor: string;
  innerBorderRadius: number;
}

export interface GridSettings {
  dotGridBackground: string;
  canvasBackground: string;
  canvasBorderRadius: number;
}

const DEFAULT_OPTIONS: PDFGeneratorOptions = {
  canvasWidth: 1000,
  canvasHeight: 1600,
  padding: 20,
  backgroundColor: '#f5f5f5',
  innerBackgroundColor: '#ffffff',
  innerBorderRadius: 8,
};

export async function generatePDF(
  components: WidgetProps[],
  gridSettings: GridSettings,
  options: Partial<PDFGeneratorOptions> = {}
): Promise<Blob> {
  const opts: PDFGeneratorOptions = { ...DEFAULT_OPTIONS, ...options };

  const canvasHeight = Math.max(
    opts.canvasHeight,
    ...components.map((c) => (c.y || 0) + (c.height || 200) + 100)
  );

  const renderer = new PDFRenderer(opts.canvasWidth + opts.padding * 2, canvasHeight + opts.padding * 2);

  renderer.drawRect(
    { x: 0, y: 0, width: opts.canvasWidth + opts.padding * 2, height: canvasHeight + opts.padding * 2 },
    { fillColor: hexToColor(gridSettings.dotGridBackground) }
  );

  const innerX = opts.padding;
  const innerY = opts.padding;
  const innerWidth = opts.canvasWidth;
  const innerHeight = canvasHeight;

  renderer.drawRoundedRect(
    { x: innerX, y: innerY, width: innerWidth, height: innerHeight },
    opts.innerBorderRadius,
    { fillColor: hexToColor(gridSettings.canvasBackground) }
  );

  const drawerRegistry = createDrawerRegistry();

  for (const component of components) {
    const compX = innerX + (component.x || 0);
    const compY = innerY + (component.y || 0);

    const drawer: WidgetDrawer = drawerRegistry[component.type] || drawerRegistry.default;
    try {
      await drawer.draw(renderer, component, compX, compY);
    } catch (e) {
      console.warn(`Failed to draw component ${component.id}:`, e);
      drawerRegistry.default.draw(renderer, component, compX, compY);
    }
  }

  return renderer.toBlob();
}

export function downloadPDF(blob: Blob, filename: string = 'page.pdf'): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function generateAndDownloadPDF(
  components: WidgetProps[],
  gridSettings: GridSettings,
  filename: string = 'page.pdf',
  options?: Partial<PDFGeneratorOptions>
): Promise<void> {
  const blob = await generatePDF(components, gridSettings, options);
  downloadPDF(blob, filename);
}
