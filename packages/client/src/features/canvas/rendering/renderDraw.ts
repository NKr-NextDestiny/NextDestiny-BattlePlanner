/**
 * Render a single draw onto a 2D canvas context.
 *
 * Supports: path, line, rectangle, text, icon.
 * Handles rotation via translate→rotate→translate around the draw's center.
 * Icon images are cached module-level to avoid flicker on re-renders.
 */

import { getDrawBounds } from './drawBounds';

// Persistent icon image cache — survives component remounts
const imageCache = new Map<string, HTMLImageElement>();

function loadIcon(url: string): HTMLImageElement {
  const cached = imageCache.get(url);
  if (cached) return cached;

  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = url;
  imageCache.set(url, img);
  return img;
}

export function renderDraw(
  ctx: CanvasRenderingContext2D,
  draw: any,
  onIconLoad?: { current: () => void },
): void {
  const d = draw.data ?? {};

  ctx.save();

  // Apply rotation around the draw center when rotation is set
  if (d.rotation) {
    const bounds = getDrawBounds(draw);
    if (bounds) {
      const cx = bounds.x + bounds.width / 2;
      const cy = bounds.y + bounds.height / 2;
      ctx.translate(cx, cy);
      ctx.rotate(d.rotation);
      ctx.translate(-cx, -cy);
    }
  }

  switch (draw.type) {
    case 'path':
      drawPath(ctx, d);
      break;
    case 'line':
      drawLine(ctx, draw, d);
      break;
    case 'arrow':
      drawArrow(ctx, draw, d);
      break;
    case 'rectangle':
      drawRectangle(ctx, draw, d);
      break;
    case 'ellipse':
      drawEllipse(ctx, draw, d);
      break;
    case 'text':
      drawText(ctx, draw, d);
      break;
    case 'icon':
      drawIcon(ctx, draw, d, onIconLoad);
      break;
  }

  ctx.restore();
}

function drawPath(ctx: CanvasRenderingContext2D, d: any): void {
  const pts: Array<{ x: number; y: number }> = d.points;
  if (!pts || pts.length < 2) return;

  ctx.strokeStyle = d.color ?? '#FF0000';
  ctx.lineWidth = d.lineWidth ?? 1;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.beginPath();
  ctx.moveTo(pts[0]!.x, pts[0]!.y);
  for (let i = 1; i < pts.length; i++) {
    ctx.lineTo(pts[i]!.x, pts[i]!.y);
  }
  ctx.stroke();
}

function drawLine(ctx: CanvasRenderingContext2D, draw: any, d: any): void {
  const x1 = draw.originX;
  const y1 = draw.originY;
  const x2 = draw.destinationX ?? x1;
  const y2 = draw.destinationY ?? y1;

  ctx.strokeStyle = d.color ?? '#FF0000';
  ctx.lineWidth = d.lineWidth ?? 1;
  ctx.lineCap = 'round';

  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function drawArrow(ctx: CanvasRenderingContext2D, draw: any, d: any): void {
  const x1 = draw.originX;
  const y1 = draw.originY;
  const x2 = draw.destinationX ?? x1;
  const y2 = draw.destinationY ?? y1;

  const color = d.color ?? '#FF0000';
  const lw = d.lineWidth ?? 1;

  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  ctx.lineCap = 'round';

  // Draw the line shaft
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();

  // Draw the arrowhead
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const headLen = Math.max(10, lw * 4);
  const headAngle = Math.PI / 7; // ~25 degrees

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(
    x2 - headLen * Math.cos(angle - headAngle),
    y2 - headLen * Math.sin(angle - headAngle),
  );
  ctx.lineTo(
    x2 - headLen * Math.cos(angle + headAngle),
    y2 - headLen * Math.sin(angle + headAngle),
  );
  ctx.closePath();
  ctx.fill();
}

function drawEllipse(ctx: CanvasRenderingContext2D, draw: any, d: any): void {
  const cx = draw.originX;
  const cy = draw.originY;
  const rx = d.radiusX ?? Math.abs((draw.destinationX ?? cx) - cx);
  const ry = d.radiusY ?? Math.abs((draw.destinationY ?? cy) - cy);

  if (rx === 0 && ry === 0) return;

  ctx.strokeStyle = d.color ?? '#FF0000';
  ctx.lineWidth = d.lineWidth ?? 1;

  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, 2 * Math.PI);

  if (d.filled) {
    ctx.fillStyle = d.color ?? '#FF0000';
    ctx.globalAlpha = 0.3;
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  ctx.stroke();
}

function drawRectangle(ctx: CanvasRenderingContext2D, draw: any, d: any): void {
  const w = d.width ?? ((draw.destinationX ?? draw.originX) - draw.originX);
  const h = d.height ?? ((draw.destinationY ?? draw.originY) - draw.originY);

  ctx.strokeStyle = d.color ?? '#FF0000';
  ctx.lineWidth = d.lineWidth ?? 1;

  if (d.filled) {
    ctx.fillStyle = d.color ?? '#FF0000';
    ctx.globalAlpha = 0.3;
    ctx.fillRect(draw.originX, draw.originY, w, h);
    ctx.globalAlpha = 1;
  }

  ctx.strokeRect(draw.originX, draw.originY, w, h);
}

function drawText(ctx: CanvasRenderingContext2D, draw: any, d: any): void {
  ctx.fillStyle = d.color ?? '#FF0000';
  ctx.font = `${d.fontSize ?? 16}px sans-serif`;
  ctx.fillText(d.text ?? '', draw.originX, draw.originY);
}

function drawIcon(
  ctx: CanvasRenderingContext2D,
  draw: any,
  d: any,
  onIconLoad?: { current: () => void },
): void {
  const size = d.size ?? 14;
  const halfSize = size / 2;
  const pad = 3;
  const circleRadius = halfSize + pad;
  const borderColor = d.bgColor ?? d.fallbackColor ?? '#888888';

  // Clean circle outline with subtle dark fill for visibility
  ctx.beginPath();
  ctx.arc(draw.originX, draw.originY, circleRadius, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
  ctx.fill();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = borderColor;
  ctx.stroke();

  // Apply flip transforms
  const flipH = d.flipH ? -1 : 1;
  const flipV = d.flipV ? -1 : 1;
  if (d.flipH || d.flipV) {
    ctx.translate(draw.originX, draw.originY);
    ctx.scale(flipH, flipV);
    ctx.translate(-draw.originX, -draw.originY);
  }

  if (d.iconUrl) {
    const img = loadIcon(d.iconUrl);

    if (img.complete && img.naturalWidth > 0) {
      ctx.drawImage(img, draw.originX - halfSize, draw.originY - halfSize, size, size);
    } else if (onIconLoad) {
      img.addEventListener('load', () => onIconLoad.current(), { once: true });
    }
  } else if (d.fallbackText) {
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.round(size * 0.55)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(d.fallbackText, draw.originX, draw.originY);
  }
}
