/**
 * EditorShell — master CSS grid layout for the strat editor.
 *
 * Grid:
 *   Row 1: TopNavBar (full width)
 *   Row 2: OperatorStrip (full width)
 *   Row 3: [SidePanel ATK] [Canvas area] [SidePanel DEF]
 */

import type { ReactNode } from 'react';
import { TopNavBar } from './TopNavBar';
import { OperatorStrip } from './OperatorStrip';
import { SidePanel } from './SidePanel';

interface EditorShellProps {
  children: ReactNode;
  readOnly?: boolean;

  // Map + floor
  mapName?: string;
  gameSlug: string;
  floors: Array<{ name: string; floorNumber: number }>;
  currentFloorIndex: number;
  onFloorChange: (index: number) => void;

  // Room
  connectionString?: string;
  isRoomOwner?: boolean;

  // Actions
  onUndo?: () => void;
  onRedo?: () => void;
  onExportPng?: () => void;
  onExportPdf?: () => void;
  onExportNds?: () => void;
  onImportNds?: (file: File) => void;

  // Strat callbacks
  onOperatorAssign?: (slotId: string, operatorId: string | null) => void;
  onBanUpdate?: (operatorName: string, side: 'attacker' | 'defender', slotIndex: number) => void;
  onBanRemove?: (banId: string) => void;
  onVisibilityToggle?: (slotId: string, visible: boolean) => void;
  onColorChange?: (slotId: string, color: string) => void;
  onLoadoutUpdate?: (slotId: string, loadout: Record<string, string | null>) => void;
  onFloorClear?: () => void;
  onPhaseCreate?: (name: string) => void;
  onPhaseUpdate?: (phaseId: string, name: string) => void;
  onPhaseDelete?: (phaseId: string) => void;
  onPhaseCopy?: (phaseId: string) => void;
  onPhaseSwitch?: (phaseId: string) => void;
  onConfigChange?: (config: any) => void;

  // Slots
  headerRight?: ReactNode;
}

export function EditorShell({
  children, readOnly,
  mapName, gameSlug, floors, currentFloorIndex, onFloorChange,
  connectionString, isRoomOwner,
  onUndo, onRedo, onExportPng, onExportPdf, onExportNds, onImportNds,
  onOperatorAssign, onBanUpdate, onBanRemove, onVisibilityToggle, onColorChange, onLoadoutUpdate, onFloorClear,
  onPhaseCreate, onPhaseUpdate, onPhaseDelete, onPhaseCopy, onPhaseSwitch, onConfigChange,
  headerRight,
}: EditorShellProps) {
  return (
    <div className="grid h-full overflow-hidden" style={{
      gridTemplateRows: 'auto auto 1fr',
      gridTemplateColumns: '220px 1fr 220px',
    }}>
      {/* Row 1: TopNavBar */}
      <div style={{ gridColumn: '1 / -1' }}>
        <TopNavBar
          mapName={mapName}
          floors={floors}
          currentFloorIndex={currentFloorIndex}
          onFloorChange={onFloorChange}
          onUndo={onUndo}
          onRedo={onRedo}
          onExportPng={onExportPng}
          onExportPdf={onExportPdf}
          onExportNds={onExportNds}
          onImportNds={onImportNds}
          onPhaseCreate={onPhaseCreate}
          onPhaseUpdate={onPhaseUpdate}
          onPhaseDelete={onPhaseDelete}
          onPhaseCopy={onPhaseCopy}
          onPhaseSwitch={onPhaseSwitch}
          onConfigChange={onConfigChange}
          connectionString={connectionString}
          isRoomOwner={isRoomOwner}
          headerRight={headerRight}
          readOnly={readOnly}
        />
      </div>

      {/* Row 2: OperatorStrip */}
      <div style={{ gridColumn: '1 / -1' }} className="border-b bg-background">
        <OperatorStrip
          gameSlug={gameSlug}
          readOnly={readOnly}
          onOperatorAssign={onOperatorAssign}
          onBanUpdate={onBanUpdate}
          onBanRemove={onBanRemove}
          onLoadoutUpdate={onLoadoutUpdate}
        />
      </div>

      {/* Row 3 col 1: ATK Side Panel */}
      <SidePanel
        side="attacker"
        gameSlug={gameSlug}
        readOnly={readOnly}
        onVisibilityToggle={onVisibilityToggle}
        onColorChange={onColorChange}
        onLoadoutUpdate={onLoadoutUpdate}
        onFloorClear={onFloorClear}
      />

      {/* Row 3 col 2: Canvas area */}
      <div className="relative overflow-hidden bg-black/30">
        {children}
      </div>

      {/* Row 3 col 3: DEF Side Panel */}
      <SidePanel
        side="defender"
        gameSlug={gameSlug}
        readOnly={readOnly}
        onVisibilityToggle={onVisibilityToggle}
        onColorChange={onColorChange}
        onLoadoutUpdate={onLoadoutUpdate}
        onFloorClear={onFloorClear}
      />
    </div>
  );
}
