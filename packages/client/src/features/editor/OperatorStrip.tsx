/**
 * Horizontal operator slots strip (5 ATK + 5 DEF).
 * 5 ATK "?" slots (blue) + separator + 5 DEF "?" slots (red).
 * Assigned operators show a small loadout trigger on hover.
 */

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';
import { useStratStore } from '@/stores/strat.store';
import { OperatorPickerPopover } from './OperatorPickerPopover';
import { LoadoutPopover } from './LoadoutPopover';
import { BanStrip } from './BanStrip';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Swords, Backpack } from 'lucide-react';
import type { StratOperatorSlot, Operator, Gadget } from '@nd-battleplanner/shared';

interface OperatorStripProps {
  gameSlug: string;
  readOnly?: boolean;
  onOperatorAssign?: (slotId: string, operatorId: string | null) => void;
  onBanUpdate?: (operatorName: string, side: 'attacker' | 'defender', slotIndex: number) => void;
  onBanRemove?: (banId: string) => void;
  onLoadoutUpdate?: (slotId: string, loadout: Record<string, string | null>) => void;
}

export function OperatorStrip({ gameSlug, readOnly, onOperatorAssign, onBanUpdate, onBanRemove, onLoadoutUpdate }: OperatorStripProps) {
  const { t } = useTranslation();
  const operatorSlots = useStratStore((s) => s.operatorSlots);
  const attackerSlots = useMemo(
    () => operatorSlots.filter(s => s.side === 'attacker').sort((a, b) => a.slotNumber - b.slotNumber),
    [operatorSlots],
  );
  const defenderSlots = useMemo(
    () => operatorSlots.filter(s => s.side === 'defender').sort((a, b) => a.slotNumber - b.slotNumber),
    [operatorSlots],
  );
  const activeSlotId = useStratStore((s) => s.activeOperatorSlotId);
  const setActiveSlotId = useStratStore((s) => s.setActiveOperatorSlotId);

  // Fetch operators to get icon URLs and gadgets
  const { data: operatorsData } = useQuery({
    queryKey: ['operators', gameSlug],
    queryFn: () => apiGet<{ data: Operator[] }>(`/games/${gameSlug}/operators`),
    staleTime: 5 * 60 * 1000,
    enabled: !!gameSlug,
  });

  const operatorIconMap = useMemo(() => {
    const map: Record<string, string | null> = {};
    for (const op of operatorsData?.data || []) {
      map[op.id] = op.icon ?? null;
    }
    return map;
  }, [operatorsData]);

  // Build operator → secondary gadgets map for loadout popovers
  const operatorGadgetMap = useMemo(() => {
    const map: Record<string, Gadget[]> = {};
    for (const op of operatorsData?.data || []) {
      if (op.gadgets) {
        map[op.id] = op.gadgets.filter(g => g.category === 'secondary');
      }
    }
    return map;
  }, [operatorsData]);

  const renderSlot = (slot: StratOperatorSlot, borderColor: string) => {
    const isActive = activeSlotId === slot.id;
    const inner = (
      <button
        className={`relative h-9 w-9 rounded-full flex items-center justify-center transition-all ${
          isActive ? 'ring-2 ring-primary ring-offset-1 ring-offset-background' : ''
        }`}
        style={{ border: `2px solid ${borderColor}` }}
        onClick={() => setActiveSlotId(slot.id)}
      >
        {slot.operatorId ? (
          <div className="h-full w-full rounded-full overflow-hidden" style={{ backgroundColor: slot.color }}>
            {operatorIconMap[slot.operatorId] ? (
              <img
                src={`/uploads${operatorIconMap[slot.operatorId]}`}
                alt={slot.operatorName || ''}
                className="h-full w-full object-cover rounded-full scale-125"
              />
            ) : (
              <div
                className="h-full w-full rounded-full flex items-center justify-center text-xs font-bold text-white"
              >
                {slot.operatorName?.[0] || '?'}
              </div>
            )}
          </div>
        ) : (
          <span className="text-sm font-bold text-muted-foreground">?</span>
        )}
      </button>
    );

    // Wrapper with loadout trigger for assigned operators
    const slotWithLoadout = (pickerOrTooltip: React.ReactNode) => {
      if (!slot.operatorId || readOnly || !onLoadoutUpdate) {
        return pickerOrTooltip;
      }

      return (
        <div key={slot.id} className="relative group/slot">
          {pickerOrTooltip}
          <LoadoutPopover
            slot={slot}
            secondaryGadgets={slot.operatorId ? operatorGadgetMap[slot.operatorId] : undefined}
            onLoadoutUpdate={onLoadoutUpdate}
            readOnly={readOnly}
            trigger={
              <button
                className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-4 w-4 rounded-full bg-card border border-border flex items-center justify-center opacity-0 group-hover/slot:opacity-100 transition-opacity z-10 hover:bg-primary hover:text-primary-foreground"
              >
                <Backpack className="h-2.5 w-2.5" />
              </button>
            }
          />
        </div>
      );
    };

    if (readOnly || !onOperatorAssign) {
      return slotWithLoadout(
        <Tooltip key={slot.id}>
          <TooltipTrigger asChild>{inner}</TooltipTrigger>
          <TooltipContent className="text-xs">{slot.operatorName || t('editor.operatorPicker.slot', { number: slot.slotNumber })}</TooltipContent>
        </Tooltip>,
      );
    }

    return slotWithLoadout(
      <OperatorPickerPopover
        key={slot.id}
        side={slot.side}
        slotId={slot.id}
        gameSlug={gameSlug}
        trigger={inner}
        onSelect={onOperatorAssign}
      />,
    );
  };

  return (
    <div className="flex items-center justify-center gap-1.5 py-1">
      {/* ATK slots */}
      <div className="flex items-center gap-1">
        {attackerSlots.map(slot => renderSlot(slot, '#1a8fe3'))}
      </div>

      {/* ATK bans */}
      <BanStrip side="attacker" gameSlug={gameSlug} readOnly={readOnly} onBanUpdate={onBanUpdate} onBanRemove={onBanRemove} />

      {/* Separator */}
      <div className="flex items-center justify-center h-8 w-8 text-muted-foreground">
        <Swords className="h-4 w-4" />
      </div>

      {/* DEF bans */}
      <BanStrip side="defender" gameSlug={gameSlug} readOnly={readOnly} onBanUpdate={onBanUpdate} onBanRemove={onBanRemove} />

      {/* DEF slots */}
      <div className="flex items-center gap-1">
        {defenderSlots.map(slot => renderSlot(slot, '#e33a3a'))}
      </div>
    </div>
  );
}
