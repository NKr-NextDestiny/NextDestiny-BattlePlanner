/**
 * RoomPage — real-time collaborative strategy editor.
 * Manages Socket.IO connection, API calls, optimistic draws, undo/redo.
 * Delegates rendering to EditorShell + MapCanvas.
 */

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import { getSocket, connectSocket, disconnectSocket } from '@/lib/socket';
import { useAuthStore } from '@/stores/auth.store';
import { useCanvasStore } from '@/stores/canvas.store';
import { useStratStore } from '@/stores/strat.store';
import { useRoomStore } from '@/stores/room.store';
import { EditorShell } from '@/features/editor/EditorShell';
import { ChatDrawer } from '@/features/editor/ChatDrawer';
import MapCanvas from '@/features/canvas/MapCanvas';
import { exportFloorAsPng, exportAllFloorsAsPdf } from '@/features/canvas/utils/exportCanvas';
import type { LaserLineData, CursorData } from '@/features/canvas/types';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

console.log('[RoomPage] module loaded');
let drawCounter = 0;

export default function RoomPage() {
  const { connectionString } = useParams<{ connectionString: string }>();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = !!user;
  const isRedoingRef = useRef(false);

  // Stores
  const canvasStore = useCanvasStore;
  const stratStore = useStratStore;
  const roomStore = useRoomStore;

  // Room query (server wraps in { data: ... })
  const { data: roomData } = useQuery({
    queryKey: ['room', connectionString],
    queryFn: () => apiGet<any>(`/rooms/${connectionString}`).then(r => r.data),
    enabled: !!connectionString,
  });

  const battleplanId = roomData?.battleplanId;

  // Battleplan query (server wraps in { data: ... })
  const { data: planData, refetch: refetchPlan } = useQuery({
    queryKey: ['battleplan', battleplanId],
    queryFn: () => apiGet<any>(`/battleplans/${battleplanId}`).then(r => r.data),
    enabled: !!battleplanId,
  });

  const gameSlug = planData?.game?.slug || 'r6-siege';

  // Floor management
  const sortedFloors = useMemo(() => {
    const floors = planData?.floors || [];
    return [...floors].sort((a: any, b: any) => (a.mapFloor?.floorNumber ?? 0) - (b.mapFloor?.floorNumber ?? 0));
  }, [planData]);

  const [currentFloorIndex, setCurrentFloorIndex] = useState(0);
  const currentFloor = sortedFloors[currentFloorIndex];

  const mapSlug = planData?.map?.slug;

  // Local draws (optimistic + guest)
  const [localDraws, setLocalDraws] = useState<Record<string, any[]>>({});
  const [peerLaserLines, setPeerLaserLines] = useState<LaserLineData[]>([]);

  // Strat store initialization
  useEffect(() => {
    if (!planData) return;
    const store = stratStore.getState();
    store.setOperatorSlots(planData.operatorSlots || []);
    store.setPhases(planData.phases || []);
    store.setBans(planData.bans || []);
    if (planData.stratSide || planData.stratMode || planData.stratSite) {
      store.setStratConfig({
        side: planData.stratSide || 'Unknown',
        mode: planData.stratMode || 'Unknown',
        site: planData.stratSite || 'Unknown',
      });
    }
    if (planData.phases?.length > 0 && !store.activePhaseId) {
      store.setActivePhaseId(planData.phases[0].id);
    }
  }, [planData, stratStore]);

  // Deduplication: remove optimistic draws that are now confirmed
  useEffect(() => {
    if (!planData?.floors) return;
    setLocalDraws(prev => {
      const next = { ...prev };
      let changed = false;
      for (const floor of planData.floors) {
        const serverIds = new Set((floor.draws || []).map((d: any) => d.id));
        const local = next[floor.id];
        if (!local) continue;
        const filtered = local.filter((d: any) => !serverIds.has(d.id));
        if (filtered.length !== local.length) {
          next[floor.id] = filtered;
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [planData]);

  // Socket connection
  useEffect(() => {
    if (!connectionString) return;
    connectSocket();
    const socket = getSocket();

    socket.emit('room:join', { connectionString });

    // Room events
    socket.on('room:joined', ({ color, users }: any) => {
      roomStore.getState().setMyColor(color);
      roomStore.getState().setUsers(users);
    });
    socket.on('room:user-joined', (u: any) => roomStore.getState().addUser(u));
    socket.on('room:user-left', ({ userId }: any) => {
      roomStore.getState().removeUser(userId);
      roomStore.getState().removeCursor(userId);
    });

    // Cursor events
    socket.on('cursor:moved', (cursor: any) => roomStore.getState().updateCursor(cursor));

    // Draw events
    socket.on('draw:created', () => refetchPlan());
    socket.on('draw:deleted', () => refetchPlan());
    socket.on('draw:updated', () => refetchPlan());

    // Battleplan events
    socket.on('battleplan:changed', ({ battleplan }: any) => {
      roomStore.getState().setBattleplan(battleplan);
      queryClient.invalidateQueries({ queryKey: ['battleplan', battleplanId] });
    });

    // Chat
    socket.on('chat:messaged', (msg: any) => roomStore.getState().addChatMessage(msg));

    // Operator slot
    socket.on('operator-slot:updated', () => refetchPlan());
    socket.on('attacker-lineup:created', () => refetchPlan());

    // Laser
    socket.on('laser:line', ({ userId, points, color }: any) => {
      setPeerLaserLines(prev => [...prev, { id: `laser-${Date.now()}`, userId, points, color, fadeStart: Date.now() }]);
    });

    // Strat events
    socket.on('strat:phase-created', () => refetchPlan());
    socket.on('strat:phase-updated', () => refetchPlan());
    socket.on('strat:phase-deleted', () => refetchPlan());
    socket.on('strat:phase-switched', ({ phaseId }: any) => stratStore.getState().setActivePhaseId(phaseId));
    socket.on('strat:ban-updated', () => refetchPlan());
    socket.on('strat:ban-removed', () => refetchPlan());
    socket.on('strat:config-updated', () => refetchPlan());
    socket.on('strat:loadout-updated', () => refetchPlan());
    socket.on('strat:visibility-toggled', ({ slotId, visible }: any) => stratStore.getState().updateOperatorSlot(slotId, { visible }));
    socket.on('strat:color-updated', ({ slotId, color }: any) => stratStore.getState().updateOperatorSlot(slotId, { color }));
    socket.on('strat:slot-updated', () => refetchPlan());

    return () => {
      socket.emit('room:leave', { connectionString });
      socket.removeAllListeners();
      disconnectSocket();
      roomStore.getState().reset();
      stratStore.getState().reset();
      canvasStore.getState().clearHistory();
    };
  }, [connectionString, battleplanId, queryClient, refetchPlan, canvasStore, stratStore, roomStore]);

  // Clean up fading peer laser lines
  useEffect(() => {
    if (peerLaserLines.length === 0) return;
    const timer = setInterval(() => {
      setPeerLaserLines(prev => prev.filter(l => Date.now() - (l.fadeStart ?? 0) < 3000));
    }, 500);
    return () => clearInterval(timer);
  }, [peerLaserLines.length]);

  // Keyboard shortcuts (undo/redo, floor switch)
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

  // Cursor broadcasting
  const cursorThrottle = useRef(0);
  const handleCursorMove = useCallback((x: number, y: number, isLaser: boolean) => {
    const now = Date.now();
    if (now - cursorThrottle.current < 50) return;
    cursorThrottle.current = now;
    getSocket()?.emit('cursor:move', { x, y, floorId: currentFloor?.id, isLaser });
  }, [currentFloor?.id]);

  // Draw creation
  const handleDrawCreate = useCallback((floorId: string, draws: any[]) => {
    const { activePhaseId } = stratStore.getState();
    const { activeOperatorSlotId } = stratStore.getState();

    const enrichedDraws = draws.map(d => ({
      ...d,
      phaseId: activePhaseId,
      operatorSlotId: activeOperatorSlotId,
    }));

    if (!isAuthenticated) {
      const localIds: string[] = [];
      const withIds = enrichedDraws.map(d => {
        const id = `local-${++drawCounter}`;
        localIds.push(id);
        return { ...d, id, userId: null };
      });
      setLocalDraws(prev => ({ ...prev, [floorId]: [...(prev[floorId] || []), ...withIds] }));
      if (!isRedoingRef.current) {
        for (const d of withIds) {
          canvasStore.getState().pushMyDraw({ id: d.id, floorId, payload: d });
        }
      }
      return;
    }

    // Optimistic: add temp draws immediately
    const tempIds: string[] = [];
    const tempDraws = enrichedDraws.map(d => {
      const id = `optimistic-${++drawCounter}`;
      tempIds.push(id);
      return { ...d, id, userId: user!.id };
    });
    setLocalDraws(prev => ({ ...prev, [floorId]: [...(prev[floorId] || []), ...tempDraws] }));

    // Broadcast
    getSocket()?.emit('draw:create', { battleplanFloorId: floorId, draws: enrichedDraws });

    // Persist (server expects { items })
    apiPost<any>(`/battleplan-floors/${floorId}/draws`, { items: enrichedDraws }).then(res => {
      const resData = res.data || res;
      const serverIds: string[] = Array.isArray(resData) ? resData.map((d: any) => d.id) : [];
      // Replace temp IDs
      setLocalDraws(prev => {
        const floorDraws = prev[floorId] || [];
        const updated = floorDraws.map(d => {
          const idx = tempIds.indexOf(d.id);
          return idx >= 0 && serverIds[idx] ? { ...d, id: serverIds[idx] } : d;
        });
        return { ...prev, [floorId]: updated };
      });
      // Push to history
      if (!isRedoingRef.current) {
        for (let i = 0; i < serverIds.length; i++) {
          canvasStore.getState().pushMyDraw({
            id: serverIds[i]!,
            floorId,
            payload: enrichedDraws[i],
          });
        }
      }
      // Update undo stack IDs
      for (let i = 0; i < tempIds.length; i++) {
        if (serverIds[i]) canvasStore.getState().updateDrawId(tempIds[i]!, serverIds[i]!);
      }
      refetchPlan();
    });
  }, [isAuthenticated, user, canvasStore, stratStore, refetchPlan]);

  // Draw delete
  const handleDrawDelete = useCallback((drawIds: string[]) => {
    for (const id of drawIds) {
      if (id.startsWith('local-') || id.startsWith('optimistic-')) {
        setLocalDraws(prev => {
          const next = { ...prev };
          for (const fid in next) {
            next[fid] = next[fid]!.filter(d => d.id !== id);
          }
          return next;
        });
        continue;
      }
      getSocket()?.emit('draw:delete', { drawIds: [id] });
      apiDelete(`/draws/${id}`).then(() => refetchPlan());
    }
  }, [refetchPlan]);

  // Draw update
  const handleDrawUpdate = useCallback((drawId: string, updates: any) => {
    getSocket()?.emit('draw:update', { drawId, data: updates });
    apiPut(`/draws/${drawId}`, updates).then(() => refetchPlan());
  }, [refetchPlan]);

  // Laser line
  const handleLaserLine = useCallback((points: Array<{ x: number; y: number }>, color: string) => {
    getSocket()?.emit('laser:line', { points, color });
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

  // Operator assign
  const handleOperatorAssign = useCallback((slotId: string, operatorId: string | null) => {
    getSocket()?.emit('operator-slot:update', { slotId, operatorId });
    apiPost(`/operator-slots/${slotId}`, { operatorId }).then(() => refetchPlan());
  }, [refetchPlan]);

  // Visibility toggle
  const handleVisibilityToggle = useCallback((slotId: string, visible: boolean) => {
    getSocket()?.emit('strat:visibility-toggle', { slotId, visible });
    apiPost(`/operator-slots/${slotId}/visibility`, { visible });
  }, []);

  // Color change
  const handleColorChange = useCallback((slotId: string, color: string) => {
    getSocket()?.emit('strat:color-update', { slotId, color });
    apiPost(`/operator-slots/${slotId}/color`, { color });
  }, []);

  // Phase callbacks
  const handlePhaseCreate = useCallback((name: string) => {
    getSocket()?.emit('strat:phase-create', { battleplanId, name });
    apiPost(`/battleplans/${battleplanId}/phases`, { name }).then(() => refetchPlan());
  }, [battleplanId, refetchPlan]);

  const handlePhaseUpdate = useCallback((phaseId: string, name: string) => {
    getSocket()?.emit('strat:phase-update', { phaseId, name });
    apiPost(`/battleplans/${battleplanId}/phases/${phaseId}/update`, { name }).then(() => refetchPlan());
  }, [battleplanId, refetchPlan]);

  const handlePhaseDelete = useCallback((phaseId: string) => {
    getSocket()?.emit('strat:phase-delete', { phaseId });
    apiPost(`/battleplans/${battleplanId}/phases/${phaseId}/delete`).then(() => refetchPlan());
  }, [battleplanId, refetchPlan]);

  const handlePhaseSwitch = useCallback((phaseId: string) => {
    getSocket()?.emit('strat:phase-switch', { phaseId });
  }, []);

  // Config change
  const handleConfigChange = useCallback((config: any) => {
    getSocket()?.emit('strat:config-update', { battleplanId, ...config });
    apiPost(`/battleplans/${battleplanId}/strat-config`, config);
  }, [battleplanId]);

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

  // Peer cursors as Map
  const cursors = useRoomStore((s) => s.cursors);
  const cursorMap = useMemo(() => {
    const map = new Map<string, CursorData>();
    for (const [id, c] of cursors) {
      if (c.floorId && c.floorId !== currentFloor?.id) continue;
      const roomUser = roomStore.getState().users.find(u => u.userId === id);
      map.set(id, { x: c.x, y: c.y, color: roomUser?.color || '#fff', userId: id, isLaser: c.isLaser });
    }
    return map;
  }, [cursors, currentFloor?.id, roomStore]);

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

  if (!roomData || !planData) {
    return <div className="flex items-center justify-center h-screen text-muted-foreground">Loading room...</div>;
  }

  if (sortedFloors.length === 0) {
    return <div className="flex items-center justify-center h-screen text-muted-foreground">No floors available</div>;
  }

  return (
    <div className="h-screen flex flex-col">
      <EditorShell
        mapName={planData?.map?.name}
        gameSlug={gameSlug}
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
            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" asChild>
              <Link to="/"><ArrowLeft className="h-3 w-3 mr-1" />Back</Link>
            </Button>
          </div>
        }
      >
        <MapCanvas
          floor={currentFloor}
          floorIndex={currentFloorIndex}
          readOnly={false}
          onDrawCreate={handleDrawCreate}
          onDrawDelete={handleDrawDelete}
          onDrawUpdate={handleDrawUpdate}
          onLaserLine={handleLaserLine}
          onCursorMove={handleCursorMove}
          peerLaserLines={peerLaserLines}
          cursors={cursorMap}
          localDraws={localDraws[currentFloor?.id] || []}
          currentUserId={user?.id ?? null}
          activePhaseId={activePhaseId}
          visibleSlotIds={visibleSlotIds}
          landscapeVisible={landscapeVisible}
          mapSlug={mapSlug}
        />
        <ChatDrawer />
      </EditorShell>
    </div>
  );
}
