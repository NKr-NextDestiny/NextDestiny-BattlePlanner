/**
 * Text tool hook — places text draws on canvas click.
 * Opens a browser prompt for text input, then creates the draw.
 */

import { Tool } from '@nd-battleplanner/shared';
import { useCanvasStore } from '@/stores/canvas.store';
import { screenToCanvas } from '../rendering/viewport';

interface UseTextToolOptions {
  containerRef: React.RefObject<HTMLDivElement | null>;
  floorId: string;
  onDrawCreate?: (floorId: string, draws: any[]) => void;
}

export function useTextTool({ containerRef, floorId, onDrawCreate }: UseTextToolOptions) {
  function onMouseDown(e: React.MouseEvent): boolean {
    const { tool, color, fontSize } = useCanvasStore.getState();
    if (tool !== Tool.Text) return false;

    const rect = containerRef.current!.getBoundingClientRect();
    const { offsetX, offsetY, scale } = useCanvasStore.getState();
    const pos = screenToCanvas(e.clientX, e.clientY, rect, offsetX, offsetY, scale);

    const text = prompt('Enter text:');
    if (text && onDrawCreate) {
      onDrawCreate(floorId, [{
        type: 'text',
        originX: pos.x,
        originY: pos.y,
        data: { text, color, fontSize },
      }]);
    }

    return true;
  }

  return { onMouseDown };
}
