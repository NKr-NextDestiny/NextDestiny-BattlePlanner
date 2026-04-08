/**
 * SandboxPage — local-only strategy editor.
 * Game + Map selection → EditorShell with MapCanvas.
 * No Socket.IO, no REST persistence. All draws stored in React state.
 */

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';
import { useCanvasStore } from '@/stores/canvas.store';
import { useStratStore } from '@/stores/strat.store';
import type { StratOperatorSlot } from '@nd-battleplanner/shared';
import { EditorShell } from '@/features/editor/EditorShell';
import MapCanvas from '@/features/canvas/MapCanvas';
import { exportFloorAsPng, exportAllFloorsAsPdf } from '@/features/canvas/utils/exportCanvas';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

console.log('[SandboxPage] module loaded');
let drawCounter = 0;

/** Generate 5 operator slots for one side */
function makeSlots(side: 'attacker' | 'defender'): StratOperatorSlot[] {
  const colors = side === 'attacker'
    ? ['#1a8fe3', '#2ecc71', '#e67e22', '#9b59b6', '#e74c3c']
    : ['#e33a3a', '#3498db', '#f1c40f', '#1abc9c', '#e84393'];
  const now = new Date().toISOString();
  return Array.from({ length: 5 }, (_, i) => ({
    id: `${side}-slot-${i + 1}`,
    battleplanId: 'sandbox',
    side: side as 'attacker' | 'defender',
    slotNumber: i + 1,
    operatorId: null,
    operatorName: null,
    color: colors[i]!,
    visible: true,
    primaryWeapon: null,
    secondaryWeapon: null,
    primaryEquipment: null,
    secondaryEquipment: null,
    createdAt: now,
    updatedAt: now,
  }));
}

export default function SandboxPage() {
  const canvasStore = useCanvasStore;
  const stratStore = useStratStore;
  const isRedoingRef = useRef(false);

  // --- Selection state ---
  const [selectedGameSlug, setSelectedGameSlug] = useState<string | null>(null);
  const [selectedMapSlug, setSelectedMapSlug] = useState<string | null>(null);

  // Fetch games (server wraps in { data: ... })
  const { data: gamesResp, isLoading: gamesLoading } = useQuery({
    queryKey: ['games'],
    queryFn: () => apiGet<{ data: any[] }>('/games'),
  });

  // Auto-select first game if there's only one
  useEffect(() => {
    const games = gamesResp?.data;
    if (games?.length && !selectedGameSlug) {
      setSelectedGameSlug(games[0].slug);
    }
  }, [gamesResp, selectedGameSlug]);

  // Fetch maps for selected game
  const { data: gameData } = useQuery({
    queryKey: ['game', selectedGameSlug],
    queryFn: () => apiGet<any>(`/games/${selectedGameSlug}`).then(r => r.data),
    enabled: !!selectedGameSlug,
  });

  // Fetch map details (floors)
  const { data: mapData } = useQuery({
    queryKey: ['map', selectedGameSlug, selectedMapSlug],
    queryFn: () => apiGet<any>(`/games/${selectedGameSlug}/maps/${selectedMapSlug}`).then(r => r.data),
    enabled: !!selectedGameSlug && !!selectedMapSlug,
  });

  // Build floor data from map
  const sortedFloors = useMemo(() => {
    if (!mapData?.floors) return [];
    return [...mapData.floors]
      .sort((a: any, b: any) => (a.floorNumber ?? 0) - (b.floorNumber ?? 0))
      .map((f: any) => ({
        id: `sandbox-floor-${f.id}`,
        mapFloorId: f.id,
        mapFloor: {
          id: f.id,
          name: f.name,
          floorNumber: f.floorNumber,
          imagePath: f.imagePath,
        },
        draws: [],
      }));
  }, [mapData]);

  const [currentFloorIndex, setCurrentFloorIndex] = useState(0);
  const currentFloor = sortedFloors[currentFloorIndex];

  // Reset floor index when map changes
  useEffect(() => { setCurrentFloorIndex(0); }, [selectedMapSlug]);

  // Initialize strat store with sandbox slots
  useEffect(() => {
    const store = stratStore.getState();
    store.reset();
    const atkSlots = makeSlots('attacker');
    const defSlots = makeSlots('defender');
    store.setOperatorSlots([...atkSlots, ...defSlots]);
    const now = new Date().toISOString();
    store.setPhases([{ id: 'sandbox-phase-0', battleplanId: 'sandbox', name: 'Action Phase 0', index: 0, description: null, createdAt: now, updatedAt: now }]);
    store.setActivePhaseId('sandbox-phase-0');
    return () => store.reset();
  }, [stratStore]);

  // Local draws
  const [localDraws, setLocalDraws] = useState<Record<string, any[]>>({});

  // Draw create (local only)
  const handleDrawCreate = useCallback((floorId: string, draws: any[]) => {
    const { activePhaseId } = stratStore.getState();
    const { activeOperatorSlotId } = stratStore.getState();

    const withIds = draws.map(d => {
      const id = `local-${++drawCounter}`;
      return {
        ...d,
        id,
        userId: 'sandbox',
        phaseId: activePhaseId,
        operatorSlotId: activeOperatorSlotId,
      };
    });

    setLocalDraws(prev => ({
      ...prev,
      [floorId]: [...(prev[floorId] || []), ...withIds],
    }));

    if (!isRedoingRef.current) {
      for (const d of withIds) {
        canvasStore.getState().pushMyDraw({ id: d.id, floorId, payload: d });
      }
    }
  }, [canvasStore, stratStore]);

  // Draw delete (local only)
  const handleDrawDelete = useCallback((drawIds: string[]) => {
    setLocalDraws(prev => {
      const next = { ...prev };
      for (const fid in next) {
        next[fid] = next[fid]!.filter(d => !drawIds.includes(d.id));
      }
      return next;
    });
  }, []);

  // Draw update (local only)
  const handleDrawUpdate = useCallback((drawId: string, updates: any) => {
    setLocalDraws(prev => {
      const next = { ...prev };
      for (const fid in next) {
        next[fid] = next[fid]!.map(d =>
          d.id === drawId ? { ...d, ...updates, data: { ...d.data, ...updates.data } } : d,
        );
      }
      return next;
    });
  }, []);

  // Undo
  const handleUndo = useCallback(() => {
    const entry = canvasStore.getState().popUndo();
    if (!entry) return;
    if (entry.action === 'update' && entry.previousState) {
      handleDrawUpdate(entry.id, entry.previousState);
    } else if (entry.action === 'create') {
      handleDrawDelete([entry.id]);
    }
  }, [canvasStore, handleDrawUpdate, handleDrawDelete]);

  // Redo
  const handleRedo = useCallback(() => {
    const entry = canvasStore.getState().popRedo();
    if (!entry) return;
    if (entry.action === 'update') {
      handleDrawUpdate(entry.id, entry.payload);
    } else if (entry.action === 'create') {
      isRedoingRef.current = true;
      handleDrawCreate(entry.floorId, [entry.payload]);
      isRedoingRef.current = false;
    }
  }, [canvasStore, handleDrawUpdate, handleDrawCreate]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) { e.preventDefault(); handleUndo(); }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); handleRedo(); }
      if (e.key === 'k' || e.key === 'K') setCurrentFloorIndex(i => Math.min(i + 1, sortedFloors.length - 1));
      if (e.key === 'j' || e.key === 'J') setCurrentFloorIndex(i => Math.max(i - 1, 0));
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  });

  // Phase callbacks (local)
  const handlePhaseCreate = useCallback((name: string) => {
    const id = `sandbox-phase-${Date.now()}`;
    const now = new Date().toISOString();
    stratStore.getState().addPhase({ id, battleplanId: 'sandbox', name, index: stratStore.getState().phases.length, description: null, createdAt: now, updatedAt: now });
  }, [stratStore]);

  const handlePhaseUpdate = useCallback((phaseId: string, name: string) => {
    stratStore.getState().updatePhase(phaseId, { name });
  }, [stratStore]);

  const handlePhaseDelete = useCallback((phaseId: string) => {
    stratStore.getState().removePhase(phaseId);
  }, [stratStore]);

  const handlePhaseSwitch = useCallback((phaseId: string) => {
    stratStore.getState().setActivePhaseId(phaseId);
  }, [stratStore]);

  // Config change (local)
  const handleConfigChange = useCallback((config: any) => {
    stratStore.getState().setStratConfig(config);
  }, [stratStore]);

  // Operator assign (local)
  const handleOperatorAssign = useCallback((slotId: string, operatorId: string | null, operatorName?: string) => {
    stratStore.getState().updateOperatorSlot(slotId, { operatorId, operatorName: operatorName ?? null });
  }, [stratStore]);

  // Visibility / color (local)
  const handleVisibilityToggle = useCallback((slotId: string, visible: boolean) => {
    stratStore.getState().updateOperatorSlot(slotId, { visible });
  }, [stratStore]);

  const handleColorChange = useCallback((slotId: string, color: string) => {
    stratStore.getState().updateOperatorSlot(slotId, { color });
  }, [stratStore]);

  // Export
  const handleExportPng = useCallback(() => {
    if (!currentFloor) return;
    exportFloorAsPng(currentFloor, localDraws[currentFloor.id] || [], currentFloor.mapFloor?.imagePath);
  }, [currentFloor, localDraws]);

  const handleExportPdf = useCallback(() => {
    exportAllFloorsAsPdf(
      [...sortedFloors].reverse(),
      localDraws,
      currentFloor?.mapFloor?.name?.split(' ')[0] || 'strategy',
    );
  }, [sortedFloors, localDraws, currentFloor]);

  // Floor info for TopNavBar
  const floorInfo = useMemo(() =>
    sortedFloors.map((f: any) => ({
      name: f.mapFloor?.name || `Floor ${f.mapFloor?.floorNumber ?? '?'}`,
      floorNumber: f.mapFloor?.floorNumber ?? 0,
    })),
    [sortedFloors],
  );

  const activePhaseId = useStratStore((s) => s.activePhaseId);
  const operatorSlots = useStratStore((s) => s.operatorSlots);
  const visibleSlotIds = useMemo(() => new Set(operatorSlots.filter(s => s.visible).map(s => s.id)), [operatorSlots]);
  const landscapeVisible = useStratStore((s) => s.landscapeVisible);

  // --- Selection UI ---
  if (!selectedMapSlug || sortedFloors.length === 0) {
    const gameList = gamesResp?.data ?? [];
    const mapList = gameData?.maps || [];

    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background text-foreground gap-6">
        <h1 className="text-2xl font-bold">Sandbox Mode</h1>
        <p className="text-muted-foreground text-sm">Select a game and map to start drawing</p>

        {gamesLoading && (
          <div className="text-sm text-muted-foreground animate-pulse">Loading games...</div>
        )}

        <div className="flex gap-4">
          {/* Game selection */}
          <div className="flex flex-col gap-3">
            <span className="text-sm font-medium text-muted-foreground">Game</span>
            <div className="flex flex-wrap gap-3">
              {gameList.map((g: any) => (
                <Button
                  key={g.id || g.slug}
                  variant={selectedGameSlug === g.slug ? 'default' : 'outline'}
                  className="gap-2 h-10 px-4 text-sm"
                  onClick={() => { setSelectedGameSlug(g.slug); setSelectedMapSlug(null); }}
                >
                  {g.icon && <img src={`/uploads${g.icon}`} alt="" className="h-6 w-6" />}
                  {g.name}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Map grid */}
        {selectedGameSlug && mapList.length > 0 && (
          <div className="flex flex-col gap-3 max-w-4xl">
            <span className="text-sm font-medium text-muted-foreground">Map</span>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
              {mapList.map((m: any) => (
                <button
                  key={m.id || m.slug}
                  className="flex flex-col gap-1.5 p-2 rounded-lg border border-border bg-card hover:border-primary/50 hover:bg-card/80 transition-colors cursor-pointer"
                  onClick={() => setSelectedMapSlug(m.slug)}
                >
                  {m.thumbnail && (
                    <img
                      src={`/uploads${m.thumbnail}`}
                      alt={m.name}
                      className="w-full h-24 object-cover rounded-md"
                    />
                  )}
                  <span className="text-sm font-medium text-center">{m.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <Button variant="ghost" size="sm" asChild>
          <Link to="/"><ArrowLeft className="h-3 w-3 mr-1" />Back to Home</Link>
        </Button>
      </div>
    );
  }

  // --- Editor ---
  return (
    <div className="h-screen flex flex-col">
      <EditorShell
        mapName={mapData?.name || selectedMapSlug}
        gameSlug={selectedGameSlug!}
        floors={floorInfo}
        currentFloorIndex={currentFloorIndex}
        onFloorChange={setCurrentFloorIndex}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onExportPng={handleExportPng}
        onExportPdf={handleExportPdf}
        onOperatorAssign={handleOperatorAssign}
        onVisibilityToggle={handleVisibilityToggle}
        onColorChange={handleColorChange}
        onPhaseCreate={handlePhaseCreate}
        onPhaseUpdate={handlePhaseUpdate}
        onPhaseDelete={handlePhaseDelete}
        onPhaseSwitch={handlePhaseSwitch}
        onConfigChange={handleConfigChange}
        readOnly={false}
        headerRight={
          <div className="flex items-center gap-1 ml-2">
            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={() => { setSelectedMapSlug(null); canvasStore.getState().clearHistory(); setLocalDraws({}); }}>
              Change Map
            </Button>
            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" asChild>
              <Link to="/"><ArrowLeft className="h-3 w-3 mr-1" />Home</Link>
            </Button>
          </div>
        }
      >
        <MapCanvas
          floor={currentFloor!}
          floorIndex={currentFloorIndex}
          readOnly={false}
          onDrawCreate={handleDrawCreate}
          onDrawDelete={handleDrawDelete}
          onDrawUpdate={handleDrawUpdate}
          localDraws={localDraws[currentFloor!.id] || []}
          currentUserId="sandbox"
          activePhaseId={activePhaseId}
          visibleSlotIds={visibleSlotIds}
          landscapeVisible={landscapeVisible}
          mapSlug={selectedMapSlug}
        />
      </EditorShell>
    </div>
  );
}
