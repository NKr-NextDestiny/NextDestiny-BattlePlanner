/**
 * Selection system: bounding box with 8 resize handles + 1 rotate handle.
 *
 * Exports:
 * - getSelectionBounds: padded bounding box around a draw
 * - getHandlePositions: positions of all 9 handles (8 resize + rotate)
 * - hitTestHandle: check if mouse is over a handle
 * - applyResizeToDraw: transform a draw's coordinates to match new bounds
 * - renderSelectionOverlay: draw the selection box + handles onto a canvas
 */

import { getDrawBounds } from './drawBounds';

export const HANDLE_SIZE = 8;
export const HANDLE_HALF = HANDLE_SIZE / 2;
export const ROTATE_HANDLE_OFFSET = 24;
export const SELECTION_PAD = 4;

export type HandleId = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';

export const HANDLE_CURSORS: Record<HandleId, string> = {
  nw: 'nwse-resize',
  n: 'ns-resize',
  ne: 'nesw-resize',
  e: 'ew-resize',
  se: 'nwse-resize',
  s: 'ns-resize',
  sw: 'nesw-resize',
  w: 'ew-resize',
};

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function getSelectionBounds(draw: any): Rect | null {
  const bounds = getDrawBounds(draw);
  if (!bounds) return null;
  return {
    x: bounds.x - SELECTION_PAD,
    y: bounds.y - SELECTION_PAD,
    width: bounds.width + SELECTION_PAD * 2,
    height: bounds.height + SELECTION_PAD * 2,
  };
}

export function getHandlePositions(
  rect: Rect,
): Record<HandleId | 'rotate', { x: number; y: number }> {
  const { x, y, width: w, height: h } = rect;
  const mx = x + w / 2;
  const my = y + h / 2;
  const bx = x + w;
  const by = y + h;

  return {
    nw: { x, y },
    n: { x: mx, y },
    ne: { x: bx, y },
    w: { x, y: my },
    e: { x: bx, y: my },
    sw: { x, y: by },
    s: { x: mx, y: by },
    se: { x: bx, y: by },
    rotate: { x: mx, y: y - ROTATE_HANDLE_OFFSET },
  };
}

export function hitTestHandle(
  mouseX: number,
  mouseY: number,
  pos: { x: number; y: number },
  tolerance = HANDLE_SIZE,
): boolean {
  return Math.abs(mouseX - pos.x) <= tolerance && Math.abs(mouseY - pos.y) <= tolerance;
}

/**
 * Transform a draw's spatial data so it fits inside `newBounds`
 * (scaled from `origBounds`). Returns partial draw fields to merge.
 */
export function applyResizeToDraw(
  draw: any,
  origBounds: Rect,
  newBounds: Rect,
): any {
  const sx = origBounds.width !== 0 ? newBounds.width / origBounds.width : 1;
  const sy = origBounds.height !== 0 ? newBounds.height / origBounds.height : 1;
  const d = { ...draw.data };

  switch (draw.type) {
    case 'path': {
      const pts = (d.points ?? []).map((p: any) => ({
        x: newBounds.x + (p.x - origBounds.x) * sx,
        y: newBounds.y + (p.y - origBounds.y) * sy,
      }));
      return {
        originX: Math.round(pts[0]?.x ?? draw.originX),
        originY: Math.round(pts[0]?.y ?? draw.originY),
        data: { ...d, points: pts },
      };
    }

    case 'line': {
      const ox = newBounds.x + (draw.originX - origBounds.x) * sx;
      const oy = newBounds.y + (draw.originY - origBounds.y) * sy;
      const dx = newBounds.x + ((draw.destinationX ?? draw.originX) - origBounds.x) * sx;
      const dy = newBounds.y + ((draw.destinationY ?? draw.originY) - origBounds.y) * sy;
      return {
        originX: Math.round(ox),
        originY: Math.round(oy),
        destinationX: Math.round(dx),
        destinationY: Math.round(dy),
        data: d,
      };
    }

    case 'rectangle':
      return {
        originX: Math.round(newBounds.x),
        originY: Math.round(newBounds.y),
        destinationX: Math.round(newBounds.x + newBounds.width),
        destinationY: Math.round(newBounds.y + newBounds.height),
        data: {
          ...d,
          width: Math.round(newBounds.width),
          height: Math.round(newBounds.height),
        },
      };

    case 'text': {
      const scaleFactor = Math.max(sx, sy);
      const newSize = Math.max(8, Math.round((d.fontSize ?? 16) * scaleFactor));
      return {
        originX: Math.round(newBounds.x),
        originY: Math.round(newBounds.y + newBounds.height),
        data: { ...d, fontSize: newSize },
      };
    }

    case 'icon': {
      const newSize = Math.max(16, Math.round(Math.max(newBounds.width, newBounds.height)));
      return {
        originX: Math.round(newBounds.x + newBounds.width / 2),
        originY: Math.round(newBounds.y + newBounds.height / 2),
        data: { ...d, size: newSize },
      };
    }

    default:
      return {
        originX: Math.round(newBounds.x),
        originY: Math.round(newBounds.y),
        data: d,
      };
  }
}

/**
 * Render the selection overlay: dashed bounding box, 8 resize handles, and a rotation handle.
 */
export function renderSelectionOverlay(ctx: CanvasRenderingContext2D, draw: any): void {
  const sel = getSelectionBounds(draw);
  if (!sel) return;

  const handles = getHandlePositions(sel);

  ctx.save();

  // Dashed bounding box
  ctx.strokeStyle = '#fd7100';
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 5]);
  ctx.strokeRect(sel.x, sel.y, sel.width, sel.height);
  ctx.setLineDash([]);

  // Resize handles (solid orange squares with white border)
  ctx.fillStyle = '#fd7100';
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1;

  const handleKeys: HandleId[] = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];
  for (const key of handleKeys) {
    const h = handles[key];
    ctx.fillRect(h.x - HANDLE_HALF, h.y - HANDLE_HALF, HANDLE_SIZE, HANDLE_SIZE);
    ctx.strokeRect(h.x - HANDLE_HALF, h.y - HANDLE_HALF, HANDLE_SIZE, HANDLE_SIZE);
  }

  // Dashed line from top-center to rotate handle
  const topCenter = handles.n;
  const rotHandle = handles.rotate;

  ctx.strokeStyle = '#fd7100';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([3, 3]);
  ctx.beginPath();
  ctx.moveTo(topCenter.x, topCenter.y);
  ctx.lineTo(rotHandle.x, rotHandle.y);
  ctx.stroke();
  ctx.setLineDash([]);

  // Rotate handle (orange circle)
  ctx.beginPath();
  ctx.arc(rotHandle.x, rotHandle.y, 5, 0, Math.PI * 2);
  ctx.fillStyle = '#fd7100';
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.restore();
}
