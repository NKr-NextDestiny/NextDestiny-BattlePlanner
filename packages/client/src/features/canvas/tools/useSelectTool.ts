/**
 * Select tool hook — select, move, resize, and rotate own draws.
 *
 * Mouse down: test handles on already-selected draw first, then test all
 *             visible own draws for selection.
 * Mouse move: render a preview of the dragged/resized/rotated draw.
 * Mouse up:   persist the transform via onDrawUpdate + push to undo history.
 *
 * A small movement threshold prevents accidental drags from deselecting.
 */

import { useState, useRef } from 'react';
import { Tool } from '@nd-battleplanner/shared';
import { useCanvasStore } from '@/stores/canvas.store';
import { screenToCanvas } from '../rendering/viewport';
import { hitTestDraw } from '../rendering/hitTest';
import { getDrawBounds } from '../rendering/drawBounds';
import { renderDraw } from '../rendering/renderDraw';
import {
  getSelectionBounds,
  getHandlePositions,
  hitTestHandle,
  applyResizeToDraw,
  HANDLE_CURSORS,
  SELECTION_PAD,
  type HandleId,
} from '../rendering/selection';

interface UseSelectToolOptions {
  containerRef: React.RefObject<HTMLDivElement | null>;
  floorId: string;
  allDraws: any[];
  currentUserId: string | null;
  activePhaseId?: string | null;
  visibleSlotIds?: Set<string> | null;
  landscapeVisible?: boolean;
  onDrawUpdate?: (drawId: string, updates: any) => void;
}

export function useSelectTool({
  containerRef, floorId, allDraws, currentUserId,
  activePhaseId, visibleSlotIds, landscapeVisible,
  onDrawUpdate,
}: UseSelectToolOptions) {
  const [isDragging, setIsDragging] = useState(false);
  const [draggedDrawId, setDraggedDrawId] = useState<string | null>(null);
  const dragRef = useRef<{ x: number; y: number; draw: any } | null>(null);

  function toCanvas(e: React.MouseEvent) {
    const rect = containerRef.current!.getBoundingClientRect();
    const { offsetX, offsetY, scale } = useCanvasStore.getState();
    return screenToCanvas(e.clientX, e.clientY, rect, offsetX, offsetY, scale);
  }

  function canInteract(draw: any): boolean {
    if (draw.isDeleted || !draw.id) return false;
    if (currentUserId && draw.userId && draw.userId !== currentUserId) return false;
    if (activePhaseId && draw.phaseId && draw.phaseId !== activePhaseId) return false;
    if (draw.operatorSlotId && visibleSlotIds && !visibleSlotIds.has(draw.operatorSlotId)) return false;
    if (!draw.operatorSlotId && landscapeVisible === false) return false;
    return true;
  }

  function onMouseDown(e: React.MouseEvent): boolean {
    const store = useCanvasStore.getState();
    if (store.tool !== Tool.Select) return false;

    const pos = toCanvas(e);
    const { selectedDrawId, setSelectedDrawId, setInteractionMode, setActiveResizeHandle } = store;

    // If a draw is already selected, check if the user clicked on a handle
    if (selectedDrawId) {
      const selected = allDraws.find(d => d.id === selectedDrawId);
      if (selected) {
        const selBounds = getSelectionBounds(selected);
        if (selBounds) {
          const handles = getHandlePositions(selBounds);

          // Rotate handle (larger tolerance)
          if (hitTestHandle(pos.x, pos.y, handles.rotate, 10)) {
            beginDrag(selected, pos, 'rotate');
            return true;
          }

          // Resize handles
          for (const key of Object.keys(HANDLE_CURSORS) as HandleId[]) {
            if (hitTestHandle(pos.x, pos.y, handles[key])) {
              setActiveResizeHandle(key);
              beginDrag(selected, pos, 'resize');
              return true;
            }
          }
        }
      }
    }

    // Try to select a draw under the cursor (search topmost first)
    for (let i = allDraws.length - 1; i >= 0; i--) {
      const draw = allDraws[i]!;
      if (!canInteract(draw)) continue;
      if (hitTestDraw(draw, pos.x, pos.y)) {
        setSelectedDrawId(draw.id);
        beginDrag(draw, pos, 'move');
        return true;
      }
    }

    // Clicked on empty space — deselect
    setSelectedDrawId(null);
    setInteractionMode('none');
    return true;
  }

  function beginDrag(draw: any, pos: { x: number; y: number }, mode: 'move' | 'resize' | 'rotate') {
    setIsDragging(true);
    setDraggedDrawId(draw.id);
    dragRef.current = { x: pos.x, y: pos.y, draw: JSON.parse(JSON.stringify(draw)) };
    useCanvasStore.getState().setInteractionMode(mode);
  }

  function onMouseMove(e: React.MouseEvent, ctx: CanvasRenderingContext2D | null): boolean {
    const { tool, interactionMode, activeResizeHandle } = useCanvasStore.getState();
    if (tool !== Tool.Select || !isDragging || !dragRef.current || !ctx) return false;

    const pos = toCanvas(e);
    const orig = dragRef.current.draw;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    if (interactionMode === 'move') {
      renderMovePreview(ctx, orig, pos);
    } else if (interactionMode === 'resize' && activeResizeHandle) {
      renderResizePreview(ctx, orig, pos, activeResizeHandle as HandleId);
    } else if (interactionMode === 'rotate') {
      renderRotatePreview(ctx, orig, pos);
    }

    return true;
  }

  function renderMovePreview(ctx: CanvasRenderingContext2D, orig: any, pos: { x: number; y: number }) {
    const dx = pos.x - dragRef.current!.x;
    const dy = pos.y - dragRef.current!.y;

    const moved = {
      ...orig,
      originX: orig.originX + dx,
      originY: orig.originY + dy,
      destinationX: orig.destinationX != null ? orig.destinationX + dx : undefined,
      destinationY: orig.destinationY != null ? orig.destinationY + dy : undefined,
      data: {
        ...orig.data,
        ...(orig.type === 'path' && orig.data.points
          ? { points: orig.data.points.map((p: any) => ({ x: p.x + dx, y: p.y + dy })) }
          : {}),
      },
    };
    renderDraw(ctx, moved);
  }

  function renderResizePreview(ctx: CanvasRenderingContext2D, orig: any, pos: { x: number; y: number }, handle: HandleId) {
    const origBounds = getDrawBounds(orig);
    if (!origBounds) return;

    const pad = SELECTION_PAD;
    let x = origBounds.x - pad;
    let y = origBounds.y - pad;
    let w = origBounds.width + pad * 2;
    let h = origBounds.height + pad * 2;

    if (handle.includes('w')) { const right = x + w; x = pos.x; w = right - x; }
    if (handle.includes('e')) { w = pos.x - x; }
    if (handle.includes('n')) { const bottom = y + h; y = pos.y; h = bottom - y; }
    if (handle.includes('s')) { h = pos.y - y; }

    // Minimum size
    if (w < 10) w = 10;
    if (h < 10) h = 10;

    const newBounds = { x: x + pad, y: y + pad, width: w - pad * 2, height: h - pad * 2 };
    const resized = applyResizeToDraw(orig, origBounds, newBounds);
    const preview = { ...orig, ...resized, data: { ...orig.data, ...resized.data } };
    renderDraw(ctx, preview);

    // Show resize outline
    ctx.save();
    ctx.strokeStyle = '#fd7100';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(x, y, w, h);
    ctx.restore();
  }

  function renderRotatePreview(ctx: CanvasRenderingContext2D, orig: any, pos: { x: number; y: number }) {
    const origBounds = getDrawBounds(orig);
    if (!origBounds) return;

    const cx = origBounds.x + origBounds.width / 2;
    const cy = origBounds.y + origBounds.height / 2;
    const currentAngle = Math.atan2(pos.y - cy, pos.x - cx);
    const startAngle = Math.atan2(dragRef.current!.y - cy, dragRef.current!.x - cx);
    const delta = currentAngle - startAngle;
    const baseRotation = orig.data?.rotation ?? 0;

    const preview = { ...orig, data: { ...orig.data, rotation: baseRotation + delta } };
    renderDraw(ctx, preview);
  }

  function onMouseUp(e: React.MouseEvent): boolean {
    const store = useCanvasStore.getState();
    if (store.tool !== Tool.Select || !isDragging || !dragRef.current) return false;

    const pos = toCanvas(e);
    const orig = dragRef.current.draw;
    const dx = pos.x - dragRef.current.x;
    const dy = pos.y - dragRef.current.y;
    const { interactionMode, activeResizeHandle } = store;

    setIsDragging(false);

    // If barely moved during a 'move', treat as click-select only
    if (interactionMode === 'move' && Math.abs(dx) < 2 && Math.abs(dy) < 2) {
      cleanup();
      return true;
    }

    let updates: any = null;

    if (interactionMode === 'move') {
      updates = buildMoveUpdates(orig, dx, dy);
    } else if (interactionMode === 'resize' && activeResizeHandle) {
      updates = buildResizeUpdates(orig, pos, activeResizeHandle as HandleId);
    } else if (interactionMode === 'rotate') {
      updates = buildRotateUpdates(orig, pos);
    }

    if (updates) {
      // Push to undo history
      useCanvasStore.getState().pushMyUpdate({
        id: orig.id,
        floorId,
        payload: updates,
        previousState: {
          originX: orig.originX,
          originY: orig.originY,
          destinationX: orig.destinationX,
          destinationY: orig.destinationY,
          data: orig.data,
        },
      });
      onDrawUpdate?.(orig.id, updates);
    }

    cleanup();
    return true;
  }

  function buildMoveUpdates(orig: any, dx: number, dy: number): any {
    return {
      originX: Math.round(orig.originX + dx),
      originY: Math.round(orig.originY + dy),
      destinationX: orig.destinationX != null ? Math.round(orig.destinationX + dx) : undefined,
      destinationY: orig.destinationY != null ? Math.round(orig.destinationY + dy) : undefined,
      data: {
        ...orig.data,
        ...(orig.type === 'path' && orig.data.points
          ? { points: orig.data.points.map((p: any) => ({ x: Math.round(p.x + dx), y: Math.round(p.y + dy) })) }
          : {}),
      },
    };
  }

  function buildResizeUpdates(orig: any, pos: { x: number; y: number }, handle: HandleId): any {
    const origBounds = getDrawBounds(orig);
    if (!origBounds) return null;

    const pad = SELECTION_PAD;
    let x = origBounds.x - pad;
    let y = origBounds.y - pad;
    let w = origBounds.width + pad * 2;
    let h = origBounds.height + pad * 2;

    if (handle.includes('w')) { const right = x + w; x = pos.x; w = right - x; }
    if (handle.includes('e')) { w = pos.x - x; }
    if (handle.includes('n')) { const bottom = y + h; y = pos.y; h = bottom - y; }
    if (handle.includes('s')) { h = pos.y - y; }
    if (w < 10) w = 10;
    if (h < 10) h = 10;

    const newBounds = { x: x + pad, y: y + pad, width: w - pad * 2, height: h - pad * 2 };
    const resized = applyResizeToDraw(orig, origBounds, newBounds);
    return { ...resized, data: { ...orig.data, ...resized.data } };
  }

  function buildRotateUpdates(orig: any, pos: { x: number; y: number }): any {
    const origBounds = getDrawBounds(orig);
    if (!origBounds) return null;

    const cx = origBounds.x + origBounds.width / 2;
    const cy = origBounds.y + origBounds.height / 2;
    const currentAngle = Math.atan2(pos.y - cy, pos.x - cx);
    const startAngle = Math.atan2(dragRef.current!.y - cy, dragRef.current!.x - cx);
    const delta = currentAngle - startAngle;
    const baseRotation = orig.data?.rotation ?? 0;

    return { data: { ...orig.data, rotation: baseRotation + delta } };
  }

  function cleanup() {
    dragRef.current = null;
    setDraggedDrawId(null);
    useCanvasStore.getState().setInteractionMode('none');
    useCanvasStore.getState().setActiveResizeHandle(null);
  }

  function reset() {
    setIsDragging(false);
    setDraggedDrawId(null);
    dragRef.current = null;
  }

  return { onMouseDown, onMouseMove, onMouseUp, isDragging, draggedDrawId, reset };
}
