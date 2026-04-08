/**
 * Phase selector dropdown — "Action Phase 0" style.
 * Add, rename, delete, switch phases.
 */

import { useState } from 'react';
import { useStratStore } from '@/stores/strat.store';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Plus, Pencil, Trash2, ChevronDown } from 'lucide-react';

interface PhaseDropdownProps {
  onPhaseCreate?: (name: string) => void;
  onPhaseUpdate?: (phaseId: string, name: string) => void;
  onPhaseDelete?: (phaseId: string) => void;
  onPhaseSwitch?: (phaseId: string) => void;
  readOnly?: boolean;
}

export function PhaseDropdown({
  onPhaseCreate, onPhaseUpdate, onPhaseDelete, onPhaseSwitch, readOnly,
}: PhaseDropdownProps) {
  const phases = useStratStore(s => s.phases);
  const activePhaseId = useStratStore(s => s.activePhaseId);
  const setActivePhaseId = useStratStore(s => s.setActivePhaseId);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const activePhase = phases.find(p => p.id === activePhaseId);
  const label = activePhase ? activePhase.name : 'Action Phase 0';

  const handleSwitch = (phaseId: string) => {
    setActivePhaseId(phaseId);
    onPhaseSwitch?.(phaseId);
  };

  const handleCreate = () => {
    const name = `Phase ${phases.length}`;
    onPhaseCreate?.(name);
  };

  const startEdit = (phaseId: string, currentName: string) => {
    setEditingId(phaseId);
    setEditName(currentName);
  };

  const confirmEdit = () => {
    if (editingId && editName.trim()) {
      onPhaseUpdate?.(editingId, editName.trim());
    }
    setEditingId(null);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-7 text-xs gap-1 px-2">
          {label}
          <ChevronDown className="h-3 w-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2" align="start">
        <div className="space-y-1">
          {phases.map(phase => (
            <div
              key={phase.id}
              className={`flex items-center gap-1 px-2 py-1 rounded text-xs cursor-pointer transition-colors ${
                phase.id === activePhaseId ? 'bg-primary/20 text-primary' : 'hover:bg-muted'
              }`}
              onClick={() => handleSwitch(phase.id)}
            >
              {editingId === phase.id ? (
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && confirmEdit()}
                  onBlur={confirmEdit}
                  className="h-5 text-xs flex-1"
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <>
                  <span className="flex-1 truncate">{phase.name}</span>
                  {!readOnly && (
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100">
                      <button
                        className="h-4 w-4 flex items-center justify-center rounded hover:bg-muted-foreground/20"
                        onClick={(e) => { e.stopPropagation(); startEdit(phase.id, phase.name); }}
                      >
                        <Pencil className="h-2.5 w-2.5" />
                      </button>
                      <button
                        className="h-4 w-4 flex items-center justify-center rounded hover:bg-destructive/20 text-destructive"
                        onClick={(e) => { e.stopPropagation(); onPhaseDelete?.(phase.id); }}
                      >
                        <Trash2 className="h-2.5 w-2.5" />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
          {phases.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-2">No phases yet</p>
          )}
        </div>
        {!readOnly && (
          <Button variant="ghost" size="sm" className="w-full h-6 text-xs mt-1" onClick={handleCreate}>
            <Plus className="h-3 w-3 mr-1" /> Add Phase
          </Button>
        )}
      </PopoverContent>
    </Popover>
  );
}
