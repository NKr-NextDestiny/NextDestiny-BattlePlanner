/**
 * LoadoutPopover — edit primary/secondary weapon and secondary gadget for an operator slot.
 * Uses dropdown selects populated from static operator loadout data.
 */

import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { StratOperatorSlot, Gadget } from '@nd-battleplanner/shared';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Backpack } from 'lucide-react';
import { getOperatorLoadout } from '@/data/operatorLoadouts';

interface LoadoutPopoverProps {
  slot: StratOperatorSlot;
  /** Gadgets for the assigned operator (filtered to 'secondary' category by parent) */
  secondaryGadgets?: Gadget[];
  onLoadoutUpdate: (slotId: string, loadout: {
    primaryWeapon?: string | null;
    secondaryWeapon?: string | null;
    primaryEquipment?: string | null;
    secondaryEquipment?: string | null;
  }) => void;
  readOnly?: boolean;
  /** Custom trigger element (replaces the default backpack button) */
  trigger?: React.ReactNode;
}

const NONE_VALUE = '__none__';

export function LoadoutPopover({ slot, secondaryGadgets, onLoadoutUpdate, readOnly, trigger }: LoadoutPopoverProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [pw, setPw] = useState(slot.primaryWeapon ?? '');
  const [sw, setSw] = useState(slot.secondaryWeapon ?? '');
  const [se, setSe] = useState(slot.secondaryEquipment ?? '');

  const loadout = useMemo(
    () => slot.operatorName ? getOperatorLoadout(slot.operatorName) : undefined,
    [slot.operatorName],
  );

  useEffect(() => {
    setPw(slot.primaryWeapon ?? '');
    setSw(slot.secondaryWeapon ?? '');
    setSe(slot.secondaryEquipment ?? '');
  }, [slot.primaryWeapon, slot.secondaryWeapon, slot.secondaryEquipment]);

  const save = () => {
    onLoadoutUpdate(slot.id, {
      primaryWeapon: pw || null,
      secondaryWeapon: sw || null,
      primaryEquipment: null,
      secondaryEquipment: se || null,
    });
    setOpen(false);
  };

  const primaryOptions = loadout?.primaryWeapons ?? [];
  const secondaryOptions = loadout?.secondaryWeapons ?? [];
  const gadgetOptions = secondaryGadgets ?? [];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {trigger ?? (
          <Button variant="ghost" size="sm" className="h-5 px-1.5 text-[10px] gap-1">
            <Backpack className="h-3 w-3" />
            {t('editor.loadout.title')}
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-60 p-3" align="start" side="bottom">
        <h4 className="text-xs font-semibold mb-2">
          {slot.operatorName ? `${slot.operatorName} — ${t('editor.loadout.title')}` : t('editor.loadout.title')}
        </h4>
        <div className="space-y-2">
          {/* Primary Weapon */}
          <div>
            <Label className="text-[10px]">{t('editor.loadout.primaryWeapon')}</Label>
            {primaryOptions.length > 0 ? (
              <Select value={pw || NONE_VALUE} onValueChange={(v) => setPw(v === NONE_VALUE ? '' : v)} disabled={readOnly}>
                <SelectTrigger className="h-6 text-xs">
                  <SelectValue placeholder="—" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE_VALUE} className="text-xs">—</SelectItem>
                  {primaryOptions.map((w) => (
                    <SelectItem key={w} value={w} className="text-xs">{w}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="h-6 flex items-center text-xs text-muted-foreground">—</div>
            )}
          </div>

          {/* Secondary Weapon */}
          <div>
            <Label className="text-[10px]">{t('editor.loadout.secondaryWeapon')}</Label>
            {secondaryOptions.length > 0 ? (
              <Select value={sw || NONE_VALUE} onValueChange={(v) => setSw(v === NONE_VALUE ? '' : v)} disabled={readOnly}>
                <SelectTrigger className="h-6 text-xs">
                  <SelectValue placeholder="—" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE_VALUE} className="text-xs">—</SelectItem>
                  {secondaryOptions.map((w) => (
                    <SelectItem key={w} value={w} className="text-xs">{w}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="h-6 flex items-center text-xs text-muted-foreground">—</div>
            )}
          </div>

          {/* Secondary Gadget */}
          {gadgetOptions.length > 0 && (
            <div>
              <Label className="text-[10px]">{t('editor.loadout.secondaryGadget')}</Label>
              <Select value={se || NONE_VALUE} onValueChange={(v) => setSe(v === NONE_VALUE ? '' : v)} disabled={readOnly}>
                <SelectTrigger className="h-6 text-xs">
                  <SelectValue placeholder="—" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE_VALUE} className="text-xs">—</SelectItem>
                  {gadgetOptions.map((g) => (
                    <SelectItem key={g.id} value={g.name} className="text-xs">{g.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {!readOnly && (
            <Button size="sm" className="w-full h-6 text-xs" onClick={save}>
              {t('plans.save')}
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
