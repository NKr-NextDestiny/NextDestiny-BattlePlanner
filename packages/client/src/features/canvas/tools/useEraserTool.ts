/**
 * Eraser tool hook — deletes the topmost own draw under the cursor.
 *
 * Respects:
 * - Ownership: only erases draws belonging to currentUserId
 * - Phase filtering: skips draws from other phases
 * - Operator visibility: skips draws from hidden operator slots
 * - Landscape visibility: skips non-operator draws when landscape is hidden
 */

import { Tool } from '@nd-battleplanner/shared';
import { useCanvasStore } from '@/stores/canvas.store';
import { screenToCanvas } from '../rendering/viewport';
import { hitTestDraw } from '../rendering/hitTest';

interface UseEraserToolOptions {
  containerRef: React.RefObject<HTMLDivElement | null>;
  allDraws: any[];
  currentUserId: string | null;
  activePhaseId?: string | null;
  visibleSlotIds?: Set<string> | null;
  landscapeVisible?: boolean;
  onDrawDelete?: (drawIds: string[]) => void;
}

export function useEraserTool({
  containerRef, allDraws, currentUserId,
  activePhaseId, visibleSlotIds, landscapeVisible,
  onDrawDelete,
}: UseEraserToolOptions) {
  function onMouseDown(e: React.MouseEvent): boolean {
    const { tool } = useCanvasStore.getState();
    if (tool !== Tool.Eraser) return false;

    const rect = containerRef.current!.getBoundingClientRect();
    const { offsetX, offsetY, scale } = useCanvasStore.getState();
    const pos = screenToCanvas(e.clientX, e.clientY, rect, offsetX, offsetY, scale);

    // Search top-to-bottom (reverse order) for the first matching draw
    for (let i = allDraws.length - 1; i >= 0; i--) {
      const draw = allDraws[i]!;
      if (!draw.id || draw.isDeleted) continue;

      // Ownership filter
      if (currentUserId && draw.userId && draw.userId !== currentUserId) continue;

      // Strat filters
      if (activePhaseId && draw.phaseId && draw.phaseId !== activePhaseId) continue;
      if (draw.operatorSlotId && visibleSlotIds && !visibleSlotIds.has(draw.operatorSlotId)) continue;
      if (!draw.operatorSlotId && landscapeVisible === false) continue;

      if (hitTestDraw(draw, pos.x, pos.y)) {
        onDrawDelete?.([draw.id]);
        return true;
      }
    }

    return true;
  }

  return { onMouseDown };
}
