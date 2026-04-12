/**
 * LoadoutPopover — edit primary/secondary weapon and equipment for an operator slot.
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { StratOperatorSlot } from '@nd-battleplanner/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Backpack } from 'lucide-react';

interface LoadoutPopoverProps {
  slot: StratOperatorSlot;
  onLoadoutUpdate: (slotId: string, loadout: {
    primaryWeapon?: string | null;
    secondaryWeapon?: string | null;
    primaryEquipment?: string | null;
    secondaryEquipment?: string | null;
  }) => void;
  readOnly?: boolean;
}

export function LoadoutPopover({ slot, onLoadoutUpdate, readOnly }: LoadoutPopoverProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [pw, setPw] = useState(slot.primaryWeapon ?? '');
  const [sw, setSw] = useState(slot.secondaryWeapon ?? '');
  const [pe, setPe] = useState(slot.primaryEquipment ?? '');
  const [se, setSe] = useState(slot.secondaryEquipment ?? '');

  useEffect(() => {
    setPw(slot.primaryWeapon ?? '');
    setSw(slot.secondaryWeapon ?? '');
    setPe(slot.primaryEquipment ?? '');
    setSe(slot.secondaryEquipment ?? '');
  }, [slot.primaryWeapon, slot.secondaryWeapon, slot.primaryEquipment, slot.secondaryEquipment]);

  const save = () => {
    onLoadoutUpdate(slot.id, {
      primaryWeapon: pw || null,
      secondaryWeapon: sw || null,
      primaryEquipment: pe || null,
      secondaryEquipment: se || null,
    });
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="h-5 px-1.5 text-[10px] gap-1">
          <Backpack className="h-3 w-3" />
          {t('editor.loadout.title')}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-3" align="start">
        <h4 className="text-xs font-semibold mb-2">{t('editor.loadout.title')}</h4>
        <div className="space-y-2">
          <div>
            <Label className="text-[10px]">{t('editor.loadout.primaryWeapon')}</Label>
            <Input value={pw} onChange={(e) => setPw(e.target.value)} className="h-6 text-xs" disabled={readOnly} />
          </div>
          <div>
            <Label className="text-[10px]">{t('editor.loadout.secondaryWeapon')}</Label>
            <Input value={sw} onChange={(e) => setSw(e.target.value)} className="h-6 text-xs" disabled={readOnly} />
          </div>
          <div>
            <Label className="text-[10px]">{t('editor.loadout.primaryEquipment')}</Label>
            <Input value={pe} onChange={(e) => setPe(e.target.value)} className="h-6 text-xs" disabled={readOnly} />
          </div>
          <div>
            <Label className="text-[10px]">{t('editor.loadout.secondaryEquipment')}</Label>
            <Input value={se} onChange={(e) => setSe(e.target.value)} className="h-6 text-xs" disabled={readOnly} />
          </div>
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
