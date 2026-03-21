import type { CanvasRenderer, Color } from './canvasRenderer';
import { hexToColor } from './canvasRenderer';
import type { WidgetProps } from '../types';

export interface WidgetDrawer {
  draw(renderer: CanvasRenderer, widget: WidgetProps, x: number, y: number): Promise<void>;
}

export class HeadingDrawer implements WidgetDrawer {
  async draw(renderer: CanvasRenderer, widget: WidgetProps, x: number, y: number): Promise<void> {
    const fontSize = widget.level === 'h1' ? 32 : widget.level === 'h2' ? 24 : 18;
    const color = hexToColor(widget.color || '#1f2937');
    const text = widget.text || '';

    renderer.drawText(text, x, y + fontSize, {
      fontSize,
      color,
      fontWeight: 'bold',
    });
  }
}

export class TextDrawer implements WidgetDrawer {
  async draw(renderer: CanvasRenderer, widget: WidgetProps, x: number, y: number): Promise<void> {
    const fontSize = widget.fontSize || 14;
    const color = hexToColor(widget.color || '#374151');
    const content = widget.content || '';
    const width = widget.width || 300;

    renderer.drawWrappedText(content, { x, y, width, height: 200 }, {
      fontSize,
      color,
      lineHeight: widget.lineHeight || 1.4,
    });
  }
}

export class ImageDrawer implements WidgetDrawer {
  async draw(renderer: CanvasRenderer, widget: WidgetProps, x: number, y: number): Promise<void> {
    if (!widget.src) return;

    const width = widget.width || 300;
    const height = widget.height || 200;
    const borderRadius = widget.borderRadius || 0;

    if (borderRadius > 0) {
      renderer.drawRoundedRect({ x, y, width, height }, borderRadius, {
        fillColor: { r: 240, g: 240, b: 240 },
      });
    }

    try {
      await renderer.drawImage({
        x,
        y,
        width,
        height,
        src: widget.src,
        borderRadius,
      });
    } catch (e) {
      renderer.drawRect({ x, y, width, height }, {
        fillColor: { r: 240, g: 240, b: 240 },
        strokeColor: { r: 200, g: 200, b: 200 },
        strokeWidth: 1,
      });

      renderer.drawText('Image', x + width / 2, y + height / 2, {
        fontSize: 14,
        color: { r: 150, g: 150, b: 150 },
        align: 'center',
      });
    }
  }
}

export class ButtonDrawer implements WidgetDrawer {
  async draw(renderer: CanvasRenderer, widget: WidgetProps, x: number, y: number): Promise<void> {
    const width = widget.width || 120;
    const height = widget.height || 44;
    const bgColor = hexToColor(widget.bgColor || '#3b82f6');
    const textColor = hexToColor(widget.textColor || '#ffffff');
    const text = widget.buttonText || 'Button';
    const borderRadius = 6;

    renderer.drawRoundedRect({ x, y, width, height }, borderRadius, {
      fillColor: bgColor,
    });

    renderer.drawText(text, x + width / 2, y + height / 2 + 5, {
      fontSize: 14,
      color: textColor,
      fontWeight: 'bold',
      align: 'center',
    });
  }
}

export class CardDrawer implements WidgetDrawer {
  async draw(renderer: CanvasRenderer, widget: WidgetProps, x: number, y: number): Promise<void> {
    const width = widget.width || 300;
    const height = widget.height || 200;
    const borderRadius = 8;
    const titleColor = hexToColor(widget.titleColor || '#1f2937');
    const descColor = hexToColor(widget.descColor || '#6b7280');

    renderer.drawRoundedRect({ x, y, width, height }, borderRadius, {
      fillColor: { r: 255, g: 255, b: 255 },
      strokeColor: { r: 229, g: 231, b: 235 },
      strokeWidth: 1,
    });

    const title = widget.cardTitle || widget.title || '';
    if (title) {
      renderer.drawText(title, x + 16, y + 32, {
        fontSize: 18,
        color: titleColor,
        fontWeight: 'bold',
      });
    }

    const description = widget.description || '';
    if (description) {
      renderer.drawWrappedText(description, { x: x + 16, y: y + 48, width: width - 32, height: height - 64 }, {
        fontSize: 14,
        color: descColor,
        lineHeight: 1.5,
      });
    }
  }
}

export class TagDrawer implements WidgetDrawer {
  async draw(renderer: CanvasRenderer, widget: WidgetProps, x: number, y: number): Promise<void> {
    const tagColors: Record<string, { bg: Color; text: Color }> = {
      default: { bg: { r: 229, g: 231, b: 235 }, text: { r: 55, g: 65, b: 81 } },
      success: { bg: { r: 209, g: 250, b: 229 }, text: { r: 6, g: 95, b: 70 } },
      warning: { bg: { r: 253, g: 230, b: 138 }, text: { r: 146, g: 64, b: 14 } },
      error: { bg: { r: 254, g: 202, b: 202 }, text: { r: 153, g: 27, b: 27 } },
      info: { bg: { r: 219, g: 234, b: 254 }, text: { r: 30, g: 64, b: 175 } },
    };

    const style = widget.tagStyle || 'default';
    const colors = tagColors[style] || tagColors.default;
    const text = widget.tagText || 'Tag';
    const width = 80;
    const height = 28;
    const borderRadius = 14;

    renderer.drawRoundedRect({ x, y, width, height }, borderRadius, {
      fillColor: colors.bg,
    });

    renderer.drawText(text, x + width / 2, y + height / 2 + 5, {
      fontSize: 12,
      color: colors.text,
      align: 'center',
    });
  }
}

export class AlertDrawer implements WidgetDrawer {
  async draw(renderer: CanvasRenderer, widget: WidgetProps, x: number, y: number): Promise<void> {
    const alertColors: Record<string, { bg: Color; border: Color }> = {
      success: { bg: { r: 220, g: 252, b: 231 }, border: { r: 34, g: 197, b: 94 } },
      warning: { bg: { r: 254, g: 243, b: 199 }, border: { r: 251, g: 191, b: 36 } },
      error: { bg: { r: 254, g: 226, b: 226 }, border: { r: 239, g: 68, b: 68 } },
      info: { bg: { r: 219, g: 234, b: 254 }, border: { r: 59, g: 130, b: 246 } },
    };

    const style = widget.alertType || 'info';
    const colors = alertColors[style] || alertColors.info;
    const width = widget.width || 400;
    const height = widget.height || 80;
    const borderRadius = 8;

    renderer.drawRoundedRect({ x, y, width, height }, borderRadius, {
      fillColor: colors.bg,
      strokeColor: colors.border,
      strokeWidth: 1,
    });

    const title = widget.alertTitle || '';
    if (title) {
      renderer.drawText(title, x + 16, y + 24, {
        fontSize: 14,
        color: colors.border,
        fontWeight: 'bold',
      });
    }

    const content = widget.alertContent || '';
    if (content) {
      renderer.drawWrappedText(content, { x: x + 16, y: y + 40, width: width - 32, height: height - 48 }, {
        fontSize: 12,
        color: { r: 55, g: 65, b: 81 },
      });
    }
  }
}

export class QuoteDrawer implements WidgetDrawer {
  async draw(renderer: CanvasRenderer, widget: WidgetProps, x: number, y: number): Promise<void> {
    const width = widget.width || 400;
    const textColor = hexToColor(widget.color || '#374151');
    const quoteText = widget.quoteText || '';
    const author = widget.quoteAuthor || '';

    renderer.drawRect({ x, y, width, height: 4 }, {
      fillColor: { r: 59, g: 130, b: 246 },
    });

    renderer.drawWrappedText(`"${quoteText}"`, { x: x + 16, y: y + 16, width: width - 32, height: 100 }, {
      fontSize: 16,
      color: textColor,
      lineHeight: 1.6,
    });

    if (author) {
      renderer.drawText(`— ${author}`, x + width - renderer.getTextWidth(author, 14) - 16, y + 80, {
        fontSize: 14,
        color: { r: 107, g: 114, b: 128 },
      });
    }
  }
}

export class ProgressDrawer implements WidgetDrawer {
  async draw(renderer: CanvasRenderer, widget: WidgetProps, x: number, y: number): Promise<void> {
    const width = widget.width || 300;
    const height = 12;
    const progress = Math.min(100, Math.max(0, widget.progress || 0));
    const progressColor = hexToColor(widget.progressColor || '#3b82f6');
    const bgColor = { r: 229, g: 231, b: 235 };

    renderer.drawRoundedRect({ x, y, width, height }, height / 2, {
      fillColor: bgColor,
    });

    const progressWidth = (width - 4) * (progress / 100);
    if (progressWidth > 0) {
      renderer.drawRoundedRect({ x: x + 2, y: y + 2, width: progressWidth, height: height - 4 }, (height - 4) / 2, {
        fillColor: progressColor,
      });
    }

    if (widget.showPercent) {
      renderer.drawText(`${Math.round(progress)}%`, x + width / 2, y - 8, {
        fontSize: 12,
        color: { r: 107, g: 114, b: 128 },
        align: 'center',
      });
    }
  }
}

export class ChecklistDrawer implements WidgetDrawer {
  async draw(renderer: CanvasRenderer, widget: WidgetProps, x: number, y: number): Promise<void> {
    const items = widget.checklistItems || [];
    const itemHeight = 32;
    const checkboxSize = 16;

    let currentY = y;

    for (const item of items) {
      renderer.drawRect({ x, y: currentY, width: checkboxSize, height: checkboxSize }, {
        strokeColor: { r: 156, g: 163, b: 175 },
        strokeWidth: 1,
      });

      if (item.checked) {
        renderer.drawRect({ x: x + 2, y: currentY + 2, width: checkboxSize - 4, height: checkboxSize - 4 }, {
          fillColor: { r: 59, g: 130, b: 246 },
        });
      }

      const textColor = item.checked
        ? { r: 156, g: 163, b: 175 }
        : { r: 55, g: 65, b: 81 };

      renderer.drawText(item.text || '', x + checkboxSize + 12, currentY + checkboxSize + 2, {
        fontSize: 14,
        color: textColor,
      });

      currentY += itemHeight;
    }
  }
}

export class TableDrawer implements WidgetDrawer {
  async draw(renderer: CanvasRenderer, widget: WidgetProps, x: number, y: number): Promise<void> {
    const headers = widget.tableHeaders || [];
    const data = widget.tableData || [];
    const width = widget.width || 400;
    const rowHeight = 36;
    const colCount = headers.length || 1;
    const colWidth = width / colCount;

    let currentY = y;

    if (headers.length > 0) {
      renderer.drawRect({ x, y: currentY, width, height: rowHeight }, {
        fillColor: { r: 243, g: 244, b: 246 },
        strokeColor: { r: 209, g: 213, b: 219 },
        strokeWidth: 1,
      });

      for (let i = 0; i < headers.length; i++) {
        renderer.drawText(headers[i] || '', x + i * colWidth + 8, currentY + rowHeight / 2 + 6, {
          fontSize: 12,
          color: { r: 55, g: 65, b: 81 },
          fontWeight: 'bold',
        });
      }
      currentY += rowHeight;
    }

    for (let rowIdx = 0; rowIdx < data.length; rowIdx++) {
      const row = data[rowIdx];
      const zebraStripe = widget.zebraStripe && rowIdx % 2 === 1;

      renderer.drawRect({ x, y: currentY, width, height: rowHeight }, {
        fillColor: zebraStripe ? { r: 249, g: 250, b: 251 } : { r: 255, g: 255, b: 255 },
        strokeColor: { r: 209, g: 213, b: 219 },
        strokeWidth: 1,
      });

      for (let i = 0; i < row.length; i++) {
        renderer.drawText(row[i] || '', x + i * colWidth + 8, currentY + rowHeight / 2 + 6, {
          fontSize: 12,
          color: { r: 55, g: 65, b: 81 },
        });
      }
      currentY += rowHeight;
    }
  }
}

export class CodeDrawer implements WidgetDrawer {
  async draw(renderer: CanvasRenderer, widget: WidgetProps, x: number, y: number): Promise<void> {
    const width = widget.width || 400;
    const height = widget.height || 200;
    const code = widget.code || '';
    const borderRadius = 6;

    renderer.drawRoundedRect({ x, y, width, height }, borderRadius, {
      fillColor: { r: 30, g: 30, b: 30 },
    });

    renderer.drawWrappedText(code, { x: x + 12, y: y + 12, width: width - 24, height: height - 24 }, {
      fontSize: 12,
      color: { r: 255, g: 255, b: 255 },
      lineHeight: 1.5,
    });
  }
}

export class DividerDrawer implements WidgetDrawer {
  async draw(renderer: CanvasRenderer, widget: WidgetProps, x: number, y: number): Promise<void> {
    const width = widget.width || 300;

    renderer.drawLine({ x, y }, { x: x + width, y });
  }
}

export class SpacerDrawer implements WidgetDrawer {
  async draw(_renderer: CanvasRenderer, _widget: WidgetProps, _x: number, _y: number): Promise<void> {
  }
}

export class DefaultDrawer implements WidgetDrawer {
  async draw(renderer: CanvasRenderer, widget: WidgetProps, x: number, y: number): Promise<void> {
    const width = widget.width || 200;
    const height = widget.height || 100;

    renderer.drawRoundedRect({ x, y, width, height }, 4, {
      fillColor: { r: 243, g: 244, b: 246 },
      strokeColor: { r: 209, g: 213, b: 219 },
      strokeWidth: 1,
    });

    renderer.drawText(`[${widget.type}]`, x + width / 2, y + height / 2 + 6, {
      fontSize: 14,
      color: { r: 156, g: 163, b: 175 },
      align: 'center',
    });
  }
}

export function createDrawerRegistry(): Record<string, WidgetDrawer> {
  return {
    heading: new HeadingDrawer(),
    text: new TextDrawer(),
    image: new ImageDrawer(),
    button: new ButtonDrawer(),
    card: new CardDrawer(),
    tag: new TagDrawer(),
    alert: new AlertDrawer(),
    quote: new QuoteDrawer(),
    progress: new ProgressDrawer(),
    checklist: new ChecklistDrawer(),
    table: new TableDrawer(),
    code: new CodeDrawer(),
    divider: new DividerDrawer(),
    spacer: new SpacerDrawer(),
    default: new DefaultDrawer(),
  };
}
