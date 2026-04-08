/**
 * Pan tool hook — enables panning the canvas viewport.
 *
 * Activates on:
 * - Middle mouse button (always, regardless of active tool)
 * - Left mouse button when Pan tool is active
 *
 * Also handles wheel zoom centered on the cursor position,
 * attached as a native event listener (passive: false) to
 * prevent default scroll behavior.
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { Tool, ZOOM_STEP } from '@nd-battleplanner/shared';
import { useCanvasStore } from '@/stores/canvas.store';

interface UsePanToolOptions {
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export function usePanTool({ containerRef }: UsePanToolOptions) {
  const [isPanning, setIsPanning] = useState(false);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);

  function onMouseDown(e: React.MouseEvent): boolean {
    const { tool } = useCanvasStore.getState();

    // Middle-click always pans, left-click only when Pan tool is active
    if (e.button !== 1 && tool !== Tool.Pan) return false;

    e.preventDefault();
    setIsPanning(true);
    lastPosRef.current = { x: e.clientX, y: e.clientY };
    return true;
  }

  function onMouseMove(e: React.MouseEvent): boolean {
    if (!isPanning || !lastPosRef.current) return false;

    const dx = e.clientX - lastPosRef.current.x;
    const dy = e.clientY - lastPosRef.current.y;
    useCanvasStore.getState().panBy(dx, dy);
    lastPosRef.current = { x: e.clientX, y: e.clientY };
    return true;
  }

  function onMouseUp(): boolean {
    if (!isPanning) return false;
    setIsPanning(false);
    lastPosRef.current = null;
    return true;
  }

  // Wheel zoom: native event listener with passive: false
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const pivotX = e.clientX - rect.left;
    const pivotY = e.clientY - rect.top;
    const { scale, zoomTo } = useCanvasStore.getState();
    const direction = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
    zoomTo(scale + direction, pivotX, pivotY);
  }, [containerRef]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  function reset() {
    setIsPanning(false);
    lastPosRef.current = null;
  }

  return { onMouseDown, onMouseMove, onMouseUp, isPanning, reset };
}
