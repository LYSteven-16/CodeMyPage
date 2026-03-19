import { useState, useEffect } from 'react';
import type { WidgetProps } from './types';
import { PreviewRenderer } from './components/PreviewRenderer';

const CANVAS_WIDTH = 1000;
const CANVAS_MIN_HEIGHT = 1600;

export function PreviewPage() {
  const [components, setComponents] = useState<WidgetProps[]>([]);
  const [bg, setBg] = useState('#f0f0f0');
  const [canvasBg, setCanvasBg] = useState('#ffffff');
  const [canvasRadius, setCanvasRadius] = useState(0);

  useEffect(() => {
    try {
      const c = sessionStorage.getItem('previewComponents');
      const g = sessionStorage.getItem('previewGridSettings');
      if (c) setComponents(JSON.parse(c));
      if (g) {
        const gs = JSON.parse(g);
        setBg(gs.dotGridBackground || '#f0f0f0');
        setCanvasBg(gs.canvasBackground || '#ffffff');
        setCanvasRadius(gs.canvasBorderRadius || 0);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const canvasHeight = Math.max(CANVAS_MIN_HEIGHT, ...components.map((c: WidgetProps) => (c.y || 0) + (c.height || 200) + 200));

  return (
    <div style={{ minHeight: '100vh', backgroundColor: bg, padding: 20 }}>
      <div style={{ position: 'relative', width: CANVAS_WIDTH, minHeight: canvasHeight, backgroundColor: canvasBg, borderRadius: canvasRadius, margin: '0 auto' }}>
        {components.map(comp => {
          const style: React.CSSProperties = {
            position: 'absolute',
            left: comp.x || 0,
            top: comp.y || 0,
            width: comp.width || 300,
            height: comp.height || 200
          };
          return <PreviewRenderer key={comp.id} component={comp} style={style} />;
        })}
      </div>
    </div>
  );
}
