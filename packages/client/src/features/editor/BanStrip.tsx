/**
 * BanStrip — 3 ban slots for a given side (attacker or defender).
 * Empty slots show "BAN" + click to pick an operator.
 * Filled slots show operator name with red X to remove.
 */

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { OperatorBan } from '@nd-battleplanner/shared';
import { useStratStore } from '@/stores/strat.store';
import { OperatorPickerPopover } from './OperatorPickerPopover';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Ban, X } from 'lucide-react';

interface BanStripProps {
  side: 'attacker' | 'defender';
  gameSlug: string;
  readOnly?: boolean;
  onBanUpdate?: (operatorName: string, side: 'attacker' | 'defender', slotIndex: number) => void;
  onBanRemove?: (banId: string) => void;
}

export function BanStrip({ side, gameSlug, readOnly, onBanUpdate, onBanRemove }: BanStripProps) {
  const { t } = useTranslation();
  const bans = useStratStore((s) => s.bans);
  const sideBans = useMemo(
    () => bans.filter(b => b.side === side).sort((a, b) => a.slotIndex - b.slotIndex),
    [bans, side],
  );

  const getBan = (slotIndex: number): OperatorBan | undefined =>
    sideBans.find(b => b.slotIndex === slotIndex);

  const renderSlot = (slotIndex: number) => {
    const ban = getBan(slotIndex);
    const borderColor = side === 'attacker' ? '#1a8fe3' : '#e33a3a';

    if (ban) {
      return (
        <Tooltip key={`${side}-ban-${slotIndex}`}>
          <TooltipTrigger asChild>
            <div
              className="relative h-7 w-7 rounded-full flex items-center justify-center bg-destructive/20 border-2 cursor-pointer group"
              style={{ borderColor }}
              onClick={() => !readOnly && onBanRemove?.(ban.id)}
            >
              <span className="text-[8px] font-bold text-destructive truncate px-0.5">
                {ban.operatorName.slice(0, 3).toUpperCase()}
              </span>
              {!readOnly && (
                <div className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full items-center justify-center hidden group-hover:flex">
                  <X className="h-2 w-2 text-white" />
                </div>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent className="text-xs">{ban.operatorName} ({t('editor.bans.banned')})</TooltipContent>
        </Tooltip>
      );
    }

    const emptySlot = (
      <div
        className="h-7 w-7 rounded-full flex items-center justify-center border-2 border-dashed opacity-40"
        style={{ borderColor }}
      >
        <Ban className="h-3 w-3 text-destructive" />
      </div>
    );

    if (readOnly || !onBanUpdate) {
      return (
        <Tooltip key={`${side}-ban-${slotIndex}`}>
          <TooltipTrigger asChild>{emptySlot}</TooltipTrigger>
          <TooltipContent className="text-xs">{t('editor.bans.empty')}</TooltipContent>
        </Tooltip>
      );
    }

    return (
      <OperatorPickerPopover
        key={`${side}-ban-${slotIndex}`}
        side={side}
        slotId={`ban-${side}-${slotIndex}`}
        gameSlug={gameSlug}
        trigger={emptySlot}
        onSelect={(_slotId, _operatorId, operatorName) => {
          if (operatorName) onBanUpdate(operatorName, side, slotIndex);
        }}
        isBanPicker
      />
    );
  };

  return (
    <div className="flex items-center gap-0.5">
      {renderSlot(0)}
      {renderSlot(1)}
      {renderSlot(2)}
    </div>
  );
}
