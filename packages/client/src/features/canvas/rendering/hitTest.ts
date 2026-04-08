/**
 * Point-in-draw hit testing for eraser and select tools.
 * Each draw type has its own detection strategy:
 * - path/line: distance-to-segment with tolerance based on stroke width
 * - rectangle: edge proximity (unfilled) or area containment (filled)
 * - text: bounding box containment
 * - icon: bounding box containment
 */

const BASE_TOLERANCE = 8;

export function hitTestDraw(draw: any, px: number, py: number): boolean {
  if (draw.isDeleted) return false;
  const d = draw.data ?? {};

  switch (draw.type) {
    case 'path':
      return testPath(d.points, px, py, d.lineWidth);

    case 'line':
      return testLine(
        draw.originX, draw.originY,
        draw.destinationX ?? draw.originX,
        draw.destinationY ?? draw.originY,
        px, py,
        d.lineWidth,
      );

    case 'rectangle':
      return testRectangle(draw, d, px, py);

    case 'text':
      return testText(draw.originX, draw.originY, d.text, d.fontSize, px, py);

    case 'icon':
      return testIcon(draw.originX, draw.originY, d.size, px, py);

    default:
      return false;
  }
}

function testPath(
  points: Array<{ x: number; y: number }> | undefined,
  px: number, py: number,
  lineWidth: number | undefined,
): boolean {
  if (!points || points.length < 2) return false;
  const tol = Math.max(BASE_TOLERANCE, ((lineWidth ?? 3) / 2) + 4);

  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i]!;
    const b = points[i + 1]!;
    if (pointToSegmentDist(px, py, a.x, a.y, b.x, b.y) < tol) return true;
  }
  return false;
}

function testLine(
  x1: number, y1: number, x2: number, y2: number,
  px: number, py: number,
  lineWidth: number | undefined,
): boolean {
  const tol = Math.max(BASE_TOLERANCE, ((lineWidth ?? 3) / 2) + 4);
  return pointToSegmentDist(px, py, x1, y1, x2, y2) < tol;
}

function testRectangle(draw: any, d: any, px: number, py: number): boolean {
  const w = d.width ?? ((draw.destinationX ?? draw.originX) - draw.originX);
  const h = d.height ?? ((draw.destinationY ?? draw.originY) - draw.originY);

  const left = Math.min(draw.originX, draw.originX + w);
  const top = Math.min(draw.originY, draw.originY + h);
  const right = Math.max(draw.originX, draw.originX + w);
  const bottom = Math.max(draw.originY, draw.originY + h);

  // Filled rectangles: test interior
  if (d.filled) {
    return px >= left && px <= right && py >= top && py <= bottom;
  }

  // Unfilled: test proximity to the four edges
  const tol = Math.max(BASE_TOLERANCE, ((d.lineWidth ?? 3) / 2) + 4);
  return (
    pointToSegmentDist(px, py, left, top, right, top) < tol ||
    pointToSegmentDist(px, py, right, top, right, bottom) < tol ||
    pointToSegmentDist(px, py, right, bottom, left, bottom) < tol ||
    pointToSegmentDist(px, py, left, bottom, left, top) < tol
  );
}

function testText(
  ox: number, oy: number,
  text: string | undefined, fontSize: number | undefined,
  px: number, py: number,
): boolean {
  const size = fontSize ?? 16;
  const estWidth = (text ?? '').length * size * 0.6;
  return px >= ox && px <= ox + estWidth && py >= oy - size && py <= oy + size * 0.3;
}

function testIcon(
  ox: number, oy: number,
  size: number | undefined,
  px: number, py: number,
): boolean {
  const half = ((size ?? 14) + 4) / 2; // include background padding
  return px >= ox - half && px <= ox + half && py >= oy - half && py <= oy + half;
}

/**
 * Shortest distance from point (px, py) to the line segment (x1,y1)-(x2,y2).
 */
function pointToSegmentDist(
  px: number, py: number,
  x1: number, y1: number,
  x2: number, y2: number,
): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lengthSq = dx * dx + dy * dy;

  // Degenerate segment (point)
  if (lengthSq === 0) return Math.hypot(px - x1, py - y1);

  // Project onto the segment, clamped to [0, 1]
  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / lengthSq));
  const projX = x1 + t * dx;
  const projY = y1 + t * dy;

  return Math.hypot(px - projX, py - projY);
}
