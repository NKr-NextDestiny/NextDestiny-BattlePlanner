/**
 * Inline popover for assigning an operator to a slot.
 * Shows searchable grid of operators, dims banned/assigned ones.
 */

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';
import { useStratStore } from '@/stores/strat.store';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface Operator {
  id: string;
  name: string;
  icon: string | null;
  color: string;
  isAttacker: boolean;
}

interface OperatorPickerPopoverProps {
  side: 'attacker' | 'defender';
  slotId: string;
  gameSlug: string;
  trigger: React.ReactNode;
  onSelect: (slotId: string, operatorId: string | null, operatorName?: string) => void;
}

export function OperatorPickerPopover({
  side, slotId, gameSlug, trigger, onSelect,
}: OperatorPickerPopoverProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const bans = useStratStore((s) => s.bans);
  const bannedNames = useMemo(() => new Set(bans.map(b => b.operatorName)), [bans]);
  const slots = useStratStore((s) => s.operatorSlots);
  const assignedIds = useMemo(
    () => new Set(slots.filter(s => s.side === side && s.operatorId && s.id !== slotId).map(s => s.operatorId!)),
    [slots, side, slotId],
  );

  const { data } = useQuery({
    queryKey: ['operators', gameSlug],
    queryFn: () => apiGet<{ data: Operator[] }>(`/games/${gameSlug}/operators`),
    enabled: !!gameSlug && open,
  });

  const operators = useMemo(() => {
    const all = data?.data || [];
    const filtered = all.filter(op => side === 'attacker' ? op.isAttacker : !op.isAttacker);
    if (!search) return filtered;
    const lower = search.toLowerCase();
    return filtered.filter(op => op.name.toLowerCase().includes(lower));
  }, [data, side, search]);

  const handlePick = (op: Operator) => {
    onSelect(slotId, op.id, op.name);
    setOpen(false);
    setSearch('');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent className="w-80 p-3" align="center">
        <div className="relative mb-2">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search operator..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-7 h-7 text-xs"
            autoFocus
          />
        </div>
        <div className="grid grid-cols-6 gap-1 max-h-60 overflow-y-auto">
          {operators.map(op => {
            const isBanned = bannedNames.has(op.name);
            const isAssigned = assignedIds.has(op.id);
            const dimmed = isBanned || isAssigned;
            return (
              <button
                key={op.id}
                className={`flex flex-col items-center gap-0.5 p-1 rounded transition-colors ${
                  dimmed ? 'opacity-30 cursor-not-allowed' : 'hover:bg-muted cursor-pointer'
                }`}
                onClick={() => !dimmed && handlePick(op)}
                disabled={dimmed}
                title={`${op.name}${isBanned ? ' (banned)' : isAssigned ? ' (assigned)' : ''}`}
              >
                {op.icon ? (
                  <div className="h-8 w-8 rounded-full overflow-hidden" style={{ backgroundColor: op.color }}>
                    <img src={`/uploads${op.icon}`} alt={op.name} className="h-full w-full object-cover scale-125" />
                  </div>
                ) : (
                  <div
                    className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ backgroundColor: op.color }}
                  >
                    {op.name[0]}
                  </div>
                )}
                <span className="text-[8px] leading-tight truncate w-full text-center">{op.name}</span>
              </button>
            );
          })}
          {operators.length === 0 && (
            <p className="col-span-6 text-xs text-muted-foreground text-center py-4">No operators found</p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
