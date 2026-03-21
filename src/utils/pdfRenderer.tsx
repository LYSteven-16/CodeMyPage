import type { WidgetProps } from '../types';

export interface GridSettings {
  dotGridBackground: string;
  canvasBackground: string;
  canvasBorderRadius: number;
}

export async function generatePDFDirect(
  components: WidgetProps[],
  gridSettings: GridSettings,
  onProgress?: (progress: number) => void
): Promise<Blob> {
  const { jsPDF } = await import('jspdf');
  const { default: html2canvas } = await import('html2canvas');
  const { createRoot } = await import('react-dom/client');
  const { ComponentRenderer } = await import('../components/ComponentRenderer');
  
  const CANVAS_WIDTH = 1000;
  const CANVAS_MIN_HEIGHT = 1600;
  
  const canvasHeight = Math.max(
    CANVAS_MIN_HEIGHT,
    ...components.map((c) => (c.y || 0) + (c.height || 200) + 100)
  );
  
  const pdf = new jsPDF({
    orientation: canvasHeight > CANVAS_WIDTH ? 'portrait' : 'landscape',
    unit: 'px',
    format: [CANVAS_WIDTH + 40, canvasHeight + 40]
  });
  
  pdf.setFillColor(gridSettings.dotGridBackground);
  pdf.rect(0, 0, CANVAS_WIDTH + 40, canvasHeight + 40, 'F');
  
  const canvasX = 20;
  const canvasY = 20;
  const innerWidth = CANVAS_WIDTH;
  const innerHeight = canvasHeight;
  
  pdf.setFillColor(gridSettings.canvasBackground);
  pdf.roundedRect(canvasX, canvasY, innerWidth, innerHeight, gridSettings.canvasBorderRadius, gridSettings.canvasBorderRadius, 'F');
  
  for (let i = 0; i < components.length; i++) {
    const comp = components[i];
    if (onProgress) {
      onProgress((i / components.length) * 100);
    }
    
    const compX = canvasX + (comp.x || 0);
    const compY = canvasY + (comp.y || 0);
    const compWidth = comp.width || 300;
    const compHeight = comp.height || 200;
    
    try {
      const container = document.createElement('div');
      container.style.cssText = `
        position: fixed;
        left: -9999px;
        top: 0;
        width: ${compWidth}px;
        min-height: ${compHeight}px;
      `;
      
      document.body.appendChild(container);
      
      const root = createRoot(container);
      root.render(
        <ComponentRenderer 
          component={comp} 
          style={{ position: 'absolute', left: 0, top: 0, width: compWidth, height: compHeight }} 
          mode="preview" 
        />
      );
      
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const compCanvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: null
      });
      
      root.unmount();
      document.body.removeChild(container);
      
      const imgData = compCanvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', compX, compY, compWidth, compHeight);
    } catch (e) {
      console.warn(`Failed to render component ${comp.id}:`, e);
    }
  }
  
  if (onProgress) {
    onProgress(100);
  }
  
  return pdf.output('blob');
}
