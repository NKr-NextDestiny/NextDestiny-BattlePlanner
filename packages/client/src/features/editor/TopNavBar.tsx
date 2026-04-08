/**
 * Top navigation bar for the editor.
 * Map name + floor tabs + layer toggle + undo/redo/export/zoom.
 */

import { Tool, ZOOM_STEP } from '@nd-battleplanner/shared';
import { useCanvasStore } from '@/stores/canvas.store';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import {
  Undo2, Redo2, Camera, FileDown, ZoomIn, ZoomOut, Maximize,
  Move, Crosshair, Presentation,
} from 'lucide-react';
import { PhaseDropdown } from './PhaseDropdown';
import { StratConfigPopover } from './StratConfigPopover';
import { LayerTogglePopover } from './LayerTogglePopover';

interface TopNavBarProps {
  mapName?: string;
  floors: Array<{ name: string; floorNumber: number }>;
  currentFloorIndex: number;
  onFloorChange: (index: number) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onExportPng?: () => void;
  onExportPdf?: () => void;
  onPhaseCreate?: (name: string) => void;
  onPhaseUpdate?: (phaseId: string, name: string) => void;
  onPhaseDelete?: (phaseId: string) => void;
  onPhaseSwitch?: (phaseId: string) => void;
  onConfigChange?: (config: any) => void;
  headerRight?: React.ReactNode;
  readOnly?: boolean;
}

export function TopNavBar({
  mapName, floors, currentFloorIndex, onFloorChange,
  onUndo, onRedo, onExportPng, onExportPdf,
  onPhaseCreate, onPhaseUpdate, onPhaseDelete, onPhaseSwitch,
  onConfigChange, headerRight, readOnly,
}: TopNavBarProps) {
  const scale = useCanvasStore(s => s.scale);
  const zoomTo = useCanvasStore(s => s.zoomTo);
  const resetViewport = useCanvasStore(s => s.resetViewport);
  const containerWidth = useCanvasStore(s => s.containerWidth);
  const containerHeight = useCanvasStore(s => s.containerHeight);
  const setTool = useCanvasStore(s => s.setTool);
  const activeTool = useCanvasStore(s => s.tool);

  const zoomIn = () => {
    const cx = (containerWidth || 1200) / 2;
    const cy = (containerHeight || 800) / 2;
    zoomTo(scale + ZOOM_STEP, cx, cy);
  };

  const zoomOut = () => {
    const cx = (containerWidth || 1200) / 2;
    const cy = (containerHeight || 800) / 2;
    zoomTo(scale - ZOOM_STEP, cx, cy);
  };

  return (
    <div className="flex items-center gap-1 px-2 py-1 bg-background border-b min-h-[36px]">
      {/* Map name */}
      {mapName && (
        <span className="text-xs font-medium text-muted-foreground px-2 shrink-0">{mapName}</span>
      )}

      {/* Floor tabs */}
      <div className="flex items-center gap-px">
        {floors.map((floor, i) => (
          <Button
            key={i}
            variant={i === currentFloorIndex ? 'default' : 'ghost'}
            size="sm"
            className="h-6 text-[11px] px-2"
            onClick={() => onFloorChange(i)}
          >
            {floor.name}
          </Button>
        ))}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Phase dropdown + config */}
      {!readOnly && (
        <>
          <PhaseDropdown
            onPhaseCreate={onPhaseCreate}
            onPhaseUpdate={onPhaseUpdate}
            onPhaseDelete={onPhaseDelete}
            onPhaseSwitch={onPhaseSwitch}
            readOnly={readOnly}
          />
          <StratConfigPopover onConfigChange={onConfigChange} readOnly={readOnly} />
        </>
      )}

      {/* Layer toggle */}
      <LayerTogglePopover />

      <div className="h-4 w-px bg-border mx-1" />

      {/* Pan + Laser tools */}
      {!readOnly && (
        <>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant={activeTool === Tool.Pan ? 'default' : 'ghost'} size="sm" className="h-6 w-6 p-0" onClick={() => setTool(Tool.Pan)}>
                <Move className="h-3 w-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="text-xs">Pan</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant={activeTool === Tool.LaserDot ? 'default' : 'ghost'} size="sm" className="h-6 w-6 p-0" onClick={() => setTool(Tool.LaserDot)}>
                <Crosshair className="h-3 w-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="text-xs">Laser Dot</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant={activeTool === Tool.LaserLine ? 'default' : 'ghost'} size="sm" className="h-6 w-6 p-0" onClick={() => setTool(Tool.LaserLine)}>
                <Presentation className="h-3 w-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="text-xs">Laser Line</TooltipContent>
          </Tooltip>

          <div className="h-4 w-px bg-border mx-1" />
        </>
      )}

      {/* Undo/Redo */}
      {!readOnly && (
        <>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={onUndo}>
                <Undo2 className="h-3 w-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="text-xs">Undo (Ctrl+Z)</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={onRedo}>
                <Redo2 className="h-3 w-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="text-xs">Redo (Ctrl+Y)</TooltipContent>
          </Tooltip>
        </>
      )}

      {/* Export */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={onExportPng}>
            <Camera className="h-3 w-3" />
          </Button>
        </TooltipTrigger>
        <TooltipContent className="text-xs">Export PNG</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={onExportPdf}>
            <FileDown className="h-3 w-3" />
          </Button>
        </TooltipTrigger>
        <TooltipContent className="text-xs">Export PDF</TooltipContent>
      </Tooltip>

      <div className="h-4 w-px bg-border mx-1" />

      {/* Zoom */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={zoomIn}>
            <ZoomIn className="h-3 w-3" />
          </Button>
        </TooltipTrigger>
        <TooltipContent className="text-xs">Zoom In</TooltipContent>
      </Tooltip>
      <span className="text-[10px] text-muted-foreground w-8 text-center">{Math.round(scale * 100)}%</span>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={zoomOut}>
            <ZoomOut className="h-3 w-3" />
          </Button>
        </TooltipTrigger>
        <TooltipContent className="text-xs">Zoom Out</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={resetViewport}>
            <Maximize className="h-3 w-3" />
          </Button>
        </TooltipTrigger>
        <TooltipContent className="text-xs">Fit to Screen</TooltipContent>
      </Tooltip>

      {/* Extra header content */}
      {headerRight}
    </div>
  );
}
