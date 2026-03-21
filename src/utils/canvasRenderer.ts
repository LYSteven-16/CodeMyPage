export interface Color {
  r: number;
  g: number;
  b: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TextOptions {
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: 'normal' | 'bold';
  color?: Color;
  align?: 'left' | 'center' | 'right';
  lineHeight?: number;
}

export interface ImageOptions {
  x: number;
  y: number;
  width: number;
  height: number;
  src: string;
  borderRadius?: number;
}

export interface RectOptions {
  fillColor?: Color;
  strokeColor?: Color;
  strokeWidth?: number;
  borderRadius?: number;
}

export interface RoundedRectOptions extends RectOptions {
  radius?: number;
}

export interface CanvasRenderer {
  width: number;
  height: number;

  save(): void;
  restore(): void;

  setFillColor(color: Color): void;
  setStrokeColor(color: Color): void;
  setLineWidth(width: number): void;

  drawRect(rect: Rect, options?: RectOptions): void;
  drawRoundedRect(rect: Rect, radius: number, options?: RectOptions): void;
  drawLine(p1: Point, p2: Point): void;

  drawText(text: string, x: number, y: number, options?: TextOptions): void;
  drawWrappedText(text: string, rect: Rect, options?: TextOptions): number;

  drawImage(options: ImageOptions): Promise<void>;
  drawImageData(dataUrl: string, x: number, y: number, width: number, height: number): Promise<void>;

  getTextWidth(text: string, fontSize: number): number;
  getTextHeight(text: string, fontSize: number, lineHeight?: number): number;

  toBlob(): Promise<Blob>;
  toDataURL(): string;
}

export function hexToColor(hex: string): Color {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
}

export function colorToHex(color: Color): string {
  return '#' + [color.r, color.g, color.b].map(x => x.toString(16).padStart(2, '0')).join('');
}

export function colorToRgb(color: Color): string {
  return `${color.r} ${color.g} ${color.b}`;
}

export function colorToNormalized(color: Color): string {
  return `${(color.r / 255).toFixed(3)} ${(color.g / 255).toFixed(3)} ${(color.b / 255).toFixed(3)}`;
}
