/**
 * MapCanvas — simplified canvas container.
 * Receives a single floor from parent.
 * Renders 3-layer stack: BackgroundLayer (SVG), DrawLayer, ActiveLayer.
 */

import { useState, useMemo, useRef, useCallback } from 'react';
import { useCanvasStore } from '@/stores/canvas.store';
import { BackgroundLayer } from './layers/BackgroundLayer';
import { DrawLayer } from './layers/DrawLayer';
import { ActiveLayer } from './layers/ActiveLayer';
import { useViewport } from './hooks/useViewport';
import { useToolRouter } from './tools/useToolRouter';
import type { Floor, LaserLineData, CursorData } from './types';

interface MapCanvasProps {
  floor: Floor;
  floorIndex: number;
  readOnly?: boolean;
  onDrawCreate?: (floorId: string, draws: any[]) => void;
  onDrawDelete?: (drawIds: string[]) => void;
  onDrawUpdate?: (drawId: string, updates: any) => void;
  onLaserLine?: (points: Array<{ x: number; y: number }>, color: string) => void;
  onCursorMove?: (x: number, y: number, isLaser: boolean) => void;
  peerLaserLines?: LaserLineData[];
  cursors?: Map<string, CursorData>;
  localDraws?: any[];
  currentUserId?: string | null;
  activePhaseId?: string | null;
  visibleSlotIds?: Set<string> | null;
  landscapeVisible?: boolean;
  mapSlug?: string;
}

export default function MapCanvas({
  floor, floorIndex, readOnly = false,
  onDrawCreate, onDrawDelete, onDrawUpdate,
  onLaserLine, onCursorMove,
  peerLaserLines, cursors,
  localDraws, currentUserId,
  activePhaseId, visibleSlotIds, landscapeVisible = true,
  mapSlug,
}: MapCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeCanvasRef = useRef<HTMLCanvasElement>(null);
  const offsetX = useCanvasStore(s => s.offsetX);
  const offsetY = useCanvasStore(s => s.offsetY);
  const scale = useCanvasStore(s => s.scale);
  const selectedDrawId = useCanvasStore(s => s.selectedDrawId);

  const [canvasSize, setCanvasSize] = useState({ width: 1200, height: 800 });

  const handleImageLoaded = useCallback((imgW: number, imgH: number) => {
    setCanvasSize({ width: imgW, height: imgH });
    requestAnimationFrame(() => {
      const container = containerRef.current;
      if (container) {
        const store = useCanvasStore.getState();
        store.setDimensions(imgW, imgH, container.clientWidth, container.clientHeight);
        store.resetViewport();
      }
    });
  }, []);

  useViewport(containerRef, floorIndex);

  const allDraws = useMemo(() => {
    return [...(floor.draws || []), ...(localDraws || [])];
  }, [floor, localDraws]);

  const toolRouter = useToolRouter({
    containerRef,
    floorId: floor.id,
    allDraws,
    readOnly,
    currentUserId: currentUserId ?? null,
    activePhaseId,
    visibleSlotIds,
    landscapeVisible,
    onDrawCreate,
    onDrawDelete,
    onDrawUpdate,
    onLaserLine,
    onCursorMove,
    activeCanvasRef,
  });

  return (
    <div
      ref={containerRef}
      className="w-full h-full overflow-hidden"
      tabIndex={0}
      onContextMenu={e => e.preventDefault()}
    >
      <div
        className="relative"
        style={{
          width: canvasSize.width,
          height: canvasSize.height,
          transform: `translate(${offsetX}px, ${offsetY}px) scale(${scale})`,
          transformOrigin: '0 0',
        }}
      >
        <BackgroundLayer
          mapSlug={mapSlug}
          floorNumber={floor.mapFloor?.floorNumber}
          onImageLoaded={handleImageLoaded}
        />
        <DrawLayer
          width={canvasSize.width}
          height={canvasSize.height}
          draws={allDraws}
          currentUserId={currentUserId}
          selectedDrawId={selectedDrawId}
          draggedDrawId={toolRouter.draggedDrawId}
          activePhaseId={activePhaseId}
          visibleSlotIds={visibleSlotIds}
          landscapeVisible={landscapeVisible}
        />
        <ActiveLayer
          width={canvasSize.width}
          height={canvasSize.height}
          cursor={toolRouter.getCursor()}
          drawPreview={toolRouter.drawPreview}
          localLaserPos={toolRouter.localLaserPos}
          laserFadeLines={toolRouter.laserFadeLines}
          laserPreviewPath={toolRouter.laserPreviewPath}
          peerLaserLines={peerLaserLines}
          cursors={cursors}
          onMouseDown={toolRouter.onMouseDown}
          onMouseMove={toolRouter.onMouseMove}
          onMouseUp={toolRouter.onMouseUp}
          onMouseLeave={toolRouter.onMouseLeave}
        />
      </div>
    </div>
  );
}
