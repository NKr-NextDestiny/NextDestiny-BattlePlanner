/**
 * BattleplanViewer — read-only strategy viewer.
 * Shows plan metadata (title, author, votes, tags, description) above EditorShell.
 * No drawing, no socket, no undo/redo.
 */

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPut } from '@/lib/api';
import { useAuthStore } from '@/stores/auth.store';
import { useStratStore } from '@/stores/strat.store';
import { EditorShell } from '@/features/editor/EditorShell';
import MapCanvas from '@/features/canvas/MapCanvas';
import { exportFloorAsPng, exportAllFloorsAsPdf } from '@/features/canvas/utils/exportCanvas';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ThumbsUp, Copy, Pencil, Check, X } from 'lucide-react';

export default function BattleplanViewer() {
  const { gameSlug, planId } = useParams<{ gameSlug: string; planId: string }>();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const stratStore = useStratStore;

  // Fetch battleplan
  const { data: planData, isLoading } = useQuery({
    queryKey: ['battleplan', planId],
    queryFn: () => apiGet<any>(`/battleplans/${planId}`).then(r => r.data),
    enabled: !!planId,
  });

  const isOwner = !!user && !!planData && planData.ownerId === user.id;
  const mapSlug = planData?.map?.slug;

  // Floor management
  const sortedFloors = useMemo(() => {
    const floors = planData?.floors || [];
    return [...floors].sort((a: any, b: any) => (a.mapFloor?.floorNumber ?? 0) - (b.mapFloor?.floorNumber ?? 0));
  }, [planData]);

  const [currentFloorIndex, setCurrentFloorIndex] = useState(0);
  const currentFloor = sortedFloors[currentFloorIndex];

  // Initialize strat store from plan data
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
    return () => store.reset();
  }, [planData, stratStore]);

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

  // Voting
  const voteMutation = useMutation({
    mutationFn: () => apiPost(`/battleplans/${planId}/vote`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['battleplan', planId] }),
  });

  // Copy
  const copyMutation = useMutation({
    mutationFn: () => apiPost(`/battleplans/${planId}/copy`),
  });

  // Editable description
  const [editingDesc, setEditingDesc] = useState(false);
  const [descDraft, setDescDraft] = useState('');

  const descMutation = useMutation({
    mutationFn: (description: string) => apiPut(`/battleplans/${planId}`, { description }),
    onSuccess: () => {
      setEditingDesc(false);
      queryClient.invalidateQueries({ queryKey: ['battleplan', planId] });
    },
  });

  // Editable notes
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesDraft, setNotesDraft] = useState('');

  const notesMutation = useMutation({
    mutationFn: (notes: string) => apiPut(`/battleplans/${planId}`, { notes }),
    onSuccess: () => {
      setEditingNotes(false);
      queryClient.invalidateQueries({ queryKey: ['battleplan', planId] });
    },
  });

  // Export
  const handleExportPng = useCallback(() => {
    if (!currentFloor) return;
    exportFloorAsPng(currentFloor, [], currentFloor.mapFloor?.imagePath);
  }, [currentFloor]);

  const handleExportPdf = useCallback(() => {
    exportAllFloorsAsPdf(
      [...sortedFloors].reverse(),
      {},
      currentFloor?.mapFloor?.name?.split(' ')[0] || 'strategy',
    );
  }, [sortedFloors, currentFloor]);

  // Phase switch (read-only, just for viewing)
  const handlePhaseSwitch = useCallback((phaseId: string) => {
    stratStore.getState().setActivePhaseId(phaseId);
  }, [stratStore]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'k' || e.key === 'K') setCurrentFloorIndex(i => Math.min(i + 1, sortedFloors.length - 1));
      if (e.key === 'j' || e.key === 'J') setCurrentFloorIndex(i => Math.max(i - 1, 0));
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  });

  if (isLoading) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading plan...</div>;
  }

  if (!planData) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Plan not found</div>;
  }

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 56px)' }}>
      {/* Plan metadata header */}
      <div className="px-4 py-3 border-b bg-background/80 shrink-0">
        <div className="flex items-center gap-3 flex-wrap">
          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" asChild>
            <Link to={`/${gameSlug}/plans/public`}><ArrowLeft className="h-3 w-3 mr-1" />Plans</Link>
          </Button>

          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-semibold truncate">{planData.title}</h1>
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <span>{planData.map?.name}</span>
              <span>by {planData.owner?.username || 'Unknown'}</span>
              {planData.stratSide && planData.stratSide !== 'Unknown' && (
                <span className="px-1 py-0.5 rounded bg-muted text-[10px]">{planData.stratSide}</span>
              )}
              {planData.stratMode && planData.stratMode !== 'Unknown' && (
                <span className="px-1 py-0.5 rounded bg-muted text-[10px]">{planData.stratMode}</span>
              )}
            </div>
          </div>

          {/* Tags */}
          {planData.tags?.length > 0 && (
            <div className="flex gap-1 flex-wrap">
              {planData.tags.map((tag: string) => (
                <span key={tag} className="px-1.5 py-0.5 rounded-full bg-primary/20 text-primary text-[10px]">{tag}</span>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-1">
            {user && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs gap-1"
                  onClick={() => voteMutation.mutate()}
                  disabled={voteMutation.isPending}
                >
                  <ThumbsUp className="h-3 w-3" />
                  {planData.voteCount ?? 0}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs gap-1"
                  onClick={() => copyMutation.mutate()}
                  disabled={copyMutation.isPending}
                >
                  <Copy className="h-3 w-3" />
                  Copy
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Description */}
        {(planData.description || isOwner) && (
          <div className="mt-2">
            {editingDesc ? (
              <div className="flex gap-1">
                <textarea
                  value={descDraft}
                  onChange={(e) => setDescDraft(e.target.value)}
                  className="flex-1 text-xs bg-muted rounded px-2 py-1 resize-none"
                  rows={2}
                />
                <Button size="sm" className="h-7 w-7 p-0" onClick={() => descMutation.mutate(descDraft)}>
                  <Check className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setEditingDesc(false)}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <div className="flex items-start gap-1">
                <p className="text-xs text-muted-foreground flex-1">{planData.description || 'No description'}</p>
                {isOwner && (
                  <Button variant="ghost" size="sm" className="h-5 w-5 p-0 shrink-0" onClick={() => { setDescDraft(planData.description || ''); setEditingDesc(true); }}>
                    <Pencil className="h-2.5 w-2.5" />
                  </Button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Notes */}
        {(planData.notes || isOwner) && (
          <div className="mt-1">
            {editingNotes ? (
              <div className="flex gap-1">
                <textarea
                  value={notesDraft}
                  onChange={(e) => setNotesDraft(e.target.value)}
                  className="flex-1 text-xs bg-muted rounded px-2 py-1 resize-none"
                  rows={2}
                />
                <Button size="sm" className="h-7 w-7 p-0" onClick={() => notesMutation.mutate(notesDraft)}>
                  <Check className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setEditingNotes(false)}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <div className="flex items-start gap-1">
                <p className="text-xs text-muted-foreground/70 flex-1 italic">{planData.notes || 'No notes'}</p>
                {isOwner && (
                  <Button variant="ghost" size="sm" className="h-5 w-5 p-0 shrink-0" onClick={() => { setNotesDraft(planData.notes || ''); setEditingNotes(true); }}>
                    <Pencil className="h-2.5 w-2.5" />
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Editor */}
      {sortedFloors.length > 0 && currentFloor ? (
        <div className="flex-1 overflow-hidden">
          <EditorShell
            mapName={planData.map?.name}
            gameSlug={gameSlug || 'r6-siege'}
            floors={floorInfo}
            currentFloorIndex={currentFloorIndex}
            onFloorChange={setCurrentFloorIndex}
            onExportPng={handleExportPng}
            onExportPdf={handleExportPdf}
            onPhaseSwitch={handlePhaseSwitch}
            readOnly
          >
            <MapCanvas
              floor={currentFloor}
              floorIndex={currentFloorIndex}
              readOnly
              currentUserId={user?.id ?? null}
              activePhaseId={activePhaseId}
              visibleSlotIds={visibleSlotIds}
              landscapeVisible={landscapeVisible}
              mapSlug={mapSlug}
            />
          </EditorShell>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          No floors available
        </div>
      )}
    </div>
  );
}
