/**
 * Compute the axis-aligned bounding box for any draw type.
 * Returns null if the draw has no spatial extent (e.g. empty path).
 */

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function getDrawBounds(draw: any): Rect | null {
  const d = draw.data ?? {};

  switch (draw.type) {
    case 'path':
      return pathBounds(d.points);

    case 'line':
      return lineBounds(
        draw.originX,
        draw.originY,
        draw.destinationX ?? draw.originX,
        draw.destinationY ?? draw.originY,
      );

    case 'rectangle':
      return rectBounds(draw, d);

    case 'text':
      return textBounds(draw.originX, draw.originY, d.text, d.fontSize);

    case 'icon':
      return iconBounds(draw.originX, draw.originY, d.size);

    default:
      return null;
  }
}

function pathBounds(points: Array<{ x: number; y: number }> | undefined): Rect | null {
  if (!points || points.length === 0) return null;

  let left = points[0]!.x;
  let top = points[0]!.y;
  let right = left;
  let bottom = top;

  for (let i = 1; i < points.length; i++) {
    const p = points[i]!;
    if (p.x < left) left = p.x;
    if (p.y < top) top = p.y;
    if (p.x > right) right = p.x;
    if (p.y > bottom) bottom = p.y;
  }

  return { x: left, y: top, width: right - left, height: bottom - top };
}

function lineBounds(x1: number, y1: number, x2: number, y2: number): Rect {
  const left = Math.min(x1, x2);
  const top = Math.min(y1, y2);
  return {
    x: left,
    y: top,
    width: Math.abs(x2 - x1),
    height: Math.abs(y2 - y1),
  };
}

function rectBounds(draw: any, d: any): Rect {
  const w = d.width ?? ((draw.destinationX ?? draw.originX) - draw.originX);
  const h = d.height ?? ((draw.destinationY ?? draw.originY) - draw.originY);
  return {
    x: Math.min(draw.originX, draw.originX + w),
    y: Math.min(draw.originY, draw.originY + h),
    width: Math.abs(w),
    height: Math.abs(h),
  };
}

function textBounds(
  ox: number,
  oy: number,
  text: string | undefined,
  fontSize: number | undefined,
): Rect {
  const size = fontSize ?? 16;
  const chars = (text ?? '').length;
  const estimatedWidth = chars * size * 0.6;
  return {
    x: ox,
    y: oy - size,
    width: estimatedWidth,
    height: size * 1.3,
  };
}

function iconBounds(ox: number, oy: number, size: number | undefined): Rect {
  const s = (size ?? 14) + 4; // include background padding
  const half = s / 2;
  return { x: ox - half, y: oy - half, width: s, height: s };
}
