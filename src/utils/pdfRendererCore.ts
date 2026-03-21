import type {
  CanvasRenderer,
  Color,
  Point,
  Rect,
  TextOptions,
  ImageOptions,
  RectOptions,
} from './canvasRenderer';
import { colorToNormalized } from './canvasRenderer';

export class PDFRenderer implements CanvasRenderer {
  width: number;
  height: number;

  private objects: string[] = [];
  private currentObj = 1;
  private xrefOffsets: number[] = [];
  private imageObjects: Map<string, number> = new Map();

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.init();
  }

  private init(): void {
    this.objects = [];
    this.xrefOffsets = [];
    this.currentObj = 1;
    this.imageObjects.clear();
  }

  private addObject(content: string): number {
    const objNum = this.currentObj++;
    this.xrefOffsets.push(this.objects.reduce((sum, s) => sum + s.length + 1, 0) + this.objects.length + (this.objects.length > 0 ? 1 : 0));
    this.objects.push(content);
    return objNum;
  }

  save(): void {
  }

  restore(): void {
  }

  setFillColor(_color: Color): void {
  }

  setStrokeColor(_color: Color): void {
  }

  setLineWidth(_width: number): void {
  }

  drawRect(rect: Rect, options?: RectOptions): void {
    const fill = options?.fillColor;
    const stroke = options?.strokeColor;
    const strokeWidth = options?.strokeWidth || 0;

    let content = 'q\n';

    if (fill) {
      content += `${colorToNormalized(fill)} rg\n`;
      content += `${rect.x} ${this.height - rect.y - rect.height} ${rect.width} ${rect.height} re\nf\n`;
    }

    if (stroke && strokeWidth > 0) {
      content += `${colorToNormalized(stroke)} RG\n`;
      content += `${strokeWidth} w\n`;
      content += `${rect.x} ${this.height - rect.y - rect.height} ${rect.width} ${rect.height} re\nS\n`;
    }

    content += 'Q\n';
    this.addObject(`<< /Length ${content.length} >>\nstream\n${content}endstream`);
  }

  drawRoundedRect(rect: Rect, radius: number, options?: RectOptions): void {
    const fill = options?.fillColor;
    const stroke = options?.strokeColor;
    const strokeWidth = options?.strokeWidth || 0;

    const x = rect.x;
    const y = this.height - rect.y - rect.height;
    const w = rect.width;
    const h = rect.height;
    const r = Math.min(radius, w / 2, h / 2);

    let content = 'q\n';

    if (fill) {
      content += `${colorToNormalized(fill)} rg\n`;
      content += `${x + r} ${y} m\n`;
      content += `${x + w - r} ${y} l\n`;
      content += `${x + w} ${y + r} c\n`;
      content += `${x + w} ${y + h - r} l\n`;
      content += `${x + w - r} ${y + h} c\n`;
      content += `${x + r} ${y + h} l\n`;
      content += `${x} ${y + h - r} c\n`;
      content += `${x} ${y + r} c\n`;
      content += 'h\nf\n';
    }

    if (stroke && strokeWidth > 0) {
      content += `${colorToNormalized(stroke)} RG\n`;
      content += `${strokeWidth} w\n`;
      content += `${x + r} ${y} m\n`;
      content += `${x + w - r} ${y} l\n`;
      content += `${x + w} ${y + r} c\n`;
      content += `${x + w} ${y + h - r} l\n`;
      content += `${x + w - r} ${y + h} c\n`;
      content += `${x + r} ${y + h} l\n`;
      content += `${x} ${y + h - r} c\n`;
      content += `${x} ${y + r} c\n`;
      content += 'h\nS\n';
    }

    content += 'Q\n';
    this.addObject(`<< /Length ${content.length} >>\nstream\n${content}endstream`);
  }

  drawLine(p1: Point, p2: Point): void {
    const content = `q\n0 0 0 RG\n1 w\n${p1.x} ${this.height - p1.y} m\n${p2.x} ${this.height - p2.y} l\nS\nQ\n`;
    this.addObject(`<< /Length ${content.length} >>\nstream\n${content}endstream`);
  }

  private escapeText(text: string): string {
    return text
      .replace(/\\/g, '\\\\')
      .replace(/\(/g, '\\(')
      .replace(/\)/g, '\\)');
  }

  drawText(text: string, x: number, y: number, options?: TextOptions): void {
    const fontSize = options?.fontSize || 12;
    const color = options?.color || { r: 0, g: 0, b: 0 };
    const align = options?.align || 'left';

    let textX = x;
    if (align === 'center') {
      textX = x - this.getTextWidth(text, fontSize) / 2;
    } else if (align === 'right') {
      textX = x - this.getTextWidth(text, fontSize);
    }

    const content = `q\nBT\n/${fontSize} Tf\n${colorToNormalized(color)} rg\n${textX} ${this.height - y} Td\n(${this.escapeText(text)}) Tj\nET\nQ\n`;
    this.addObject(`<< /Length ${content.length} >>\nstream\n${content}endstream`);
  }

  drawWrappedText(text: string, rect: Rect, options?: TextOptions): number {
    const fontSize = options?.fontSize || 12;
    const lineHeight = options?.lineHeight || 1.4;
    const color = options?.color || { r: 0, g: 0, b: 0 };
    const align = options?.align || 'left';

    const lines = this.wrapText(text, rect.width, fontSize);
    const lineHeightPx = fontSize * lineHeight;
    let currentY = rect.y + fontSize;

    let fullContent = 'q\nBT\n';

    for (const line of lines) {
      let textX = rect.x;
      if (align === 'center') {
        textX = rect.x + (rect.width - this.getTextWidth(line, fontSize)) / 2;
      } else if (align === 'right') {
        textX = rect.x + rect.width - this.getTextWidth(line, fontSize);
      }

      fullContent += `/${fontSize} Tf\n${colorToNormalized(color)} rg\n${textX} ${this.height - currentY} Td\n(${this.escapeText(line)}) Tj\n`;
      currentY += lineHeightPx;
    }

    fullContent += 'ET\nQ\n';
    this.addObject(`<< /Length ${fullContent.length} >>\nstream\n${fullContent}endstream`);

    return lines.length * lineHeightPx;
  }

  private wrapText(text: string, maxWidth: number, fontSize: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const testWidth = this.getTextWidth(testLine, fontSize);

      if (testWidth > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines.length > 0 ? lines : [''];
  }

  getTextWidth(text: string, fontSize: number): number {
    return (text.length * fontSize * 0.6);
  }

  getTextHeight(text: string, fontSize: number, lineHeight?: number): number {
    const lines = text.split('\n').length;
    return lines * fontSize * (lineHeight || 1.4);
  }

  async drawImage(options: ImageOptions): Promise<void> {
    await this.drawImageData(options.src, options.x, options.y, options.width, options.height);
  }

  async drawImageData(dataUrl: string, x: number, y: number, width: number, height: number): Promise<void> {
    const imageId = `img_${this.imageObjects.size + 1}`;

    if (!this.imageObjects.has(imageId)) {
      const objNum = this.addImageToDocument(dataUrl);
      this.imageObjects.set(imageId, objNum);
    }

    const imgObjNum = this.imageObjects.get(imageId)!;
    const content = `q\n${width} 0 0 ${height} ${x} ${this.height - y - height} cm\n/img${imgObjNum} Do\nQ\n`;
    this.addObject(`<< /Length ${content.length} >>\nstream\n${content}endstream`);
  }

  private addImageToDocument(dataUrl: string): number {
    let base64 = dataUrl;
    let filter = '';
    let imgWidth = 100;
    let imgHeight = 100;

    if (dataUrl.startsWith('data:image/png')) {
      base64 = dataUrl.replace(/^data:image\/png;base64,/, '');
      filter = '/Filter /FlateDecode ';
    } else if (dataUrl.startsWith('data:image/jpeg') || dataUrl.startsWith('data:image/jpg')) {
      base64 = dataUrl.replace(/^data:image\/jpeg;base64,/, '');
      filter = '/Filter /DCTDecode ';
    }

    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    const hexString = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');

    const content = `<< /Type /XObject /Subtype /Image /Width ${imgWidth} /Height ${imgHeight} /ColorSpace /DeviceRGB /BitsPerComponent 8 ${filter}/Length ${bytes.length} >>\nstream\n${hexString}\nendstream`;
    return this.addObject(content);
  }

  async toBlob(): Promise<Blob> {
    return this.build();
  }

  toDataURL(): string {
    return URL.createObjectURL(this.build());
  }

  private build(): Blob {
    this.init();

    const catalogObj = this.addObject('<< /Type /Catalog /Pages 2 0 R >>');
    this.addObject('<< /Type /Pages /Kids [3 0 R] /Count 1 >>');

    const allContent = this.objects.join('\n');
    const contentObj = this.addObject(`<< /Length ${allContent.length} >>\nstream\n${allContent}\nendstream`);

    const xobjDict = this.imageObjects.size > 0
      ? `/XObject << ${Array.from(this.imageObjects.entries()).map(([, num]) => `/img${num} ${num} 0 R`).join(' ')} >> `
      : '';

    const resourcesObj = this.addObject(`<< /ProcSet [/PDF /Text /ImageB /ImageC /ImageI] ${xobjDict}>>`);
    this.addObject(`<< /Type /Page /Parent 3 0 R /MediaBox [0 0 ${this.width} ${this.height}] /Contents ${contentObj} 0 R /Resources ${resourcesObj} 0 R >>`);

    let pdf = '%PDF-1.4\n%\xC7\xEC\x8F\xA2\n';

    for (const obj of this.objects) {
      pdf += obj + '\n';
    }

    const xrefOffset = pdf.length;
    let xref = `xref\n0 ${this.currentObj}\n0000000000 65535 f \n`;

    for (const offset of this.xrefOffsets) {
      xref += offset.toString().padStart(10, '0') + ' 00000 n \n';
    }

    const trailer = `trailer\n<< /Size ${this.currentObj} /Root ${catalogObj} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

    pdf += xref + '\n' + trailer;

    return new Blob([pdf], { type: 'application/pdf' });
  }
}
