import type { WidgetProps } from '../types';

export interface GridSettings {
  dotGridBackground: string;
  canvasBackground: string;
  canvasBorderRadius: number;
}

const CANVAS_WIDTH = 1000;
const CANVAS_MIN_HEIGHT = 1600;

function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (result) {
    return [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)];
  }
  return [0, 0, 0];
}

function parseColor(color: string | undefined): [number, number, number] {
  if (!color) return [0, 0, 0];
  if (color.startsWith('#')) return hexToRgb(color);
  if (color.startsWith('rgb')) {
    const match = color.match(/\d+/g);
    if (match && match.length >= 3) {
      return [parseInt(match[0]), parseInt(match[1]), parseInt(match[2])];
    }
  }
  return [0, 0, 0];
}

type jsPDFInstance = any;

export function renderComponentToPDF(
  doc: jsPDFInstance,
  component: WidgetProps,
  offsetX: number,
  offsetY: number
) {
  const x = offsetX + (component.x || 0);
  const y = offsetY + (component.y || 0);
  const w = component.width || 300;
  const h = component.height || 200;
  const rgbText = parseColor(component.color || '#000000');

  doc.setTextColor(rgbText[0], rgbText[1], rgbText[2]);

  switch (component.type) {
    case 'text':
    case 'heading': {
      const fontSize = component.fontSize || (component.type === 'heading' ? 24 : 16);
      doc.setFontSize(fontSize);
      const text = component.content || component.text || '';
      const lines = doc.splitTextToSize(text, w - 20);
      doc.text(lines, x + 10, y + fontSize);
      break;
    }

    case 'button': {
      const bgColor = parseColor(component.bgColor || '#3b82f6');
      const btnTextColor = parseColor(component.textColor || '#ffffff');
      const btnX = x;
      const btnY = y;
      const btnW = w;
      const btnH = h;

      doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
      if (component.buttonStyle === 'outline') {
        doc.setDrawColor(bgColor[0], bgColor[1], bgColor[2]);
        doc.roundedRect(btnX, btnY, btnW, btnH, 4, 4, 'S');
      } else {
        doc.roundedRect(btnX, btnY, btnW, btnH, 4, 4, 'F');
      }

      doc.setTextColor(btnTextColor[0], btnTextColor[1], btnTextColor[2]);
      doc.setFontSize(14);
      const btnText = component.buttonText || 'Button';
      const textWidth = doc.getTextWidth(btnText);
      doc.text(btnText, btnX + (btnW - textWidth) / 2, btnY + btnH / 2 + 5);
      break;
    }

    case 'card': {
      const cardBg = parseColor(component.bgColor || '#ffffff');
      const cardW = w;
      const cardH = h;
      const radius = 8;

      doc.setFillColor(cardBg[0], cardBg[1], cardBg[2]);
      if (component.cardStyle === 'outlined') {
        doc.setDrawColor(200, 200, 200);
        doc.roundedRect(x, y, cardW, cardH, radius, radius, 'S');
      } else {
        doc.setDrawColor(0, 0, 0);
        doc.roundedRect(x, y, cardW, cardH, radius, radius, 'DF');
      }

      let currentY = y + 20;
      if (component.cardTitle) {
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(18);
        doc.text(component.cardTitle, x + 15, currentY);
        currentY += 25;
      }
      if (component.description) {
        doc.setTextColor(100, 100, 100);
        doc.setFontSize(12);
        const descLines = doc.splitTextToSize(component.description, cardW - 30);
        doc.text(descLines, x + 15, currentY);
      }
      break;
    }

    case 'image': {
      const radius = component.borderRadius || 0;
      if (component.src) {
        try {
          if (radius > 0) {
            doc.roundedRect(x, y, w, h, radius, radius, 'S');
          }
          doc.setDrawColor(200, 200, 200);
          doc.rect(x, y, w, h, 'S');
          doc.setTextColor(150, 150, 150);
          doc.setFontSize(12);
          doc.text('[图片]', x + w / 2 - 15, y + h / 2);
        } catch (e) {
          doc.setDrawColor(200, 200, 200);
          doc.rect(x, y, w, h, 'S');
        }
      } else {
        doc.setFillColor(240, 240, 240);
        doc.rect(x, y, w, h, 'F');
        doc.setDrawColor(200, 200, 200);
        doc.rect(x, y, w, h, 'S');
        doc.setTextColor(150, 150, 150);
        doc.setFontSize(12);
        doc.text('[图片占位]', x + w / 2 - 25, y + h / 2);
      }
      break;
    }

    case 'quote': {
      const quoteBg = parseColor('#f5f5f5');
      doc.setFillColor(quoteBg[0], quoteBg[1], quoteBg[2]);
      doc.rect(x, y, w, h, 'F');

      doc.setDrawColor(100, 100, 100);
      doc.setLineWidth(3);
      doc.line(x, y, x, y + h);

      if (component.quoteText) {
        doc.setTextColor(80, 80, 80);
        doc.setFontSize(14);
        const quoteLines = doc.splitTextToSize(`"${component.quoteText}"`, w - 30);
        doc.text(quoteLines, x + 15, y + 30);

        if (component.quoteAuthor) {
          doc.setFontSize(12);
          doc.text(`— ${component.quoteAuthor}`, x + 15, y + 30 + quoteLines.length * 20);
        }
      }
      break;
    }

    case 'code': {
      const codeBg = parseColor('#f5f5f5');
      doc.setFillColor(codeBg[0], codeBg[1], codeBg[2]);
      doc.rect(x, y, w, h, 'F');

      doc.setDrawColor(200, 200, 200);
      doc.rect(x, y, w, h, 'S');

      if (component.code) {
        doc.setTextColor(60, 60, 60);
        doc.setFontSize(10);
        const codeLines = doc.splitTextToSize(component.code, w - 20);
        doc.text(codeLines, x + 10, y + 20);
      }
      break;
    }

    case 'tag': {
      const tagColors: Record<string, [number, number, number]> = {
        default: [200, 200, 200],
        success: [34, 197, 94],
        warning: [234, 179, 8],
        error: [239, 68, 68],
        info: [59, 130, 246]
      };
      const tagBg = tagColors[component.tagStyle || 'default'] || tagColors.default;
      doc.setFillColor(tagBg[0], tagBg[1], tagBg[2]);
      doc.roundedRect(x, y, w, h, 4, 4, 'F');

      const textCol: [number, number, number] = tagBg[0] > 150 ? [0, 0, 0] : [255, 255, 255];
      doc.setTextColor(textCol[0], textCol[1], textCol[2]);
      doc.setFontSize(12);
      const tagText = component.tagText || 'Tag';
      const tagTextWidth = doc.getTextWidth(tagText);
      doc.text(tagText, x + (w - tagTextWidth) / 2, y + h / 2 + 4);
      break;
    }

    case 'alert': {
      const alertColors: Record<string, [number, number, number]> = {
        success: [34, 197, 94],
        warning: [234, 179, 8],
        error: [239, 68, 68],
        info: [59, 130, 246]
      };
      const alertBg = alertColors[component.alertType || 'info'] || alertColors.info;
      doc.setFillColor(alertBg[0], alertBg[1], alertBg[2]);
      doc.roundedRect(x, y, w, h, 6, 6, 'F');

      if (component.alertTitle) {
        const textCol: [number, number, number] = [255, 255, 255];
        doc.setTextColor(textCol[0], textCol[1], textCol[2]);
        doc.setFontSize(14);
        doc.text(component.alertTitle, x + 15, y + 25);

        if (component.alertContent) {
          doc.setFontSize(12);
          const alertLines = doc.splitTextToSize(component.alertContent, w - 30);
          doc.text(alertLines, x + 15, y + 45);
        }
      }
      break;
    }

    case 'progress': {
      const progressW = w;
      const progressH = 20;
      const progressValue = component.progress || 0;
      const progressColor = parseColor(component.progressColor || '#3b82f6');

      doc.setFillColor(230, 230, 230);
      doc.roundedRect(x, y, progressW, progressH, 10, 10, 'F');

      const fillW = (progressW * progressValue) / 100;
      if (fillW > 0) {
        doc.setFillColor(progressColor[0], progressColor[1], progressColor[2]);
        doc.roundedRect(x, y, fillW, progressH, 10, 10, 'F');
      }

      if (component.showPercent) {
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(12);
        doc.text(`${progressValue}%`, x + progressW / 2 - 10, y + 15);
      }
      break;
    }

    case 'checklist': {
      if (component.checklistItems) {
        let itemY = y + 20;
        doc.setFontSize(12);
        component.checklistItems.forEach((item, _idx) => {
          const checked = item.checked ? '☑' : '☐';
          doc.setTextColor(0, 0, 0);
          doc.text(checked, x + 10, itemY);
          const itemLines = doc.splitTextToSize(item.text, w - 40);
          doc.text(itemLines, x + 30, itemY);
          itemY += Math.max(20, itemLines.length * 15);
        });
      }
      break;
    }

    case 'table': {
      if (component.tableData && component.tableHeaders) {
        const colW = w / component.tableHeaders.length;
        let currentY = y;

        doc.setFillColor(240, 240, 240);
        doc.rect(x, currentY, w, 25, 'F');
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        component.tableHeaders.forEach((header, idx) => {
          doc.text(header, x + idx * colW + 5, currentY + 17);
        });
        currentY += 25;

        component.tableData.forEach((row, rowIdx) => {
          if (component.zebraStripe && rowIdx % 2 === 1) {
            doc.setFillColor(250, 250, 250);
            doc.rect(x, currentY, w, 20, 'F');
          }
          doc.setTextColor(60, 60, 60);
          row.forEach((cell, colIdx) => {
            doc.text(cell, x + colIdx * colW + 5, currentY + 14);
          });
          currentY += 20;
        });
      }
      break;
    }

    default: {
      doc.setFillColor(245, 245, 245);
      doc.setDrawColor(200, 200, 200);
      doc.rect(x, y, w, h, 'FD');
      doc.setTextColor(150, 150, 150);
      doc.setFontSize(10);
      doc.text(`[${component.type}]`, x + w / 2 - 15, y + h / 2);
    }
  }
}

export async function generateVectorPDF(
  components: WidgetProps[],
  gridSettings: GridSettings
): Promise<void> {
  const { jsPDF } = await import('jspdf');

  const canvasHeight = Math.max(
    CANVAS_MIN_HEIGHT,
    ...components.map((c) => (c.y || 0) + (c.height || 200) + 200)
  );

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: [CANVAS_WIDTH + 40, canvasHeight + 40]
  });

  const offsetX = 20;
  const offsetY = 20;

  const canvasBg = parseColor(gridSettings.canvasBackground);
  pdf.setFillColor(canvasBg[0], canvasBg[1], canvasBg[2]);
  if (gridSettings.canvasBorderRadius > 0) {
    pdf.roundedRect(offsetX, offsetY, CANVAS_WIDTH, canvasHeight, gridSettings.canvasBorderRadius, gridSettings.canvasBorderRadius, 'F');
  } else {
    pdf.rect(offsetX, offsetY, CANVAS_WIDTH, canvasHeight, 'F');
  }

  components.forEach((component) => {
    renderComponentToPDF(pdf, component, offsetX, offsetY);
  });

  pdf.save('my-page.pdf');
}
