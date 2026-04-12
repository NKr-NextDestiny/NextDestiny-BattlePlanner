/**
 * Strat config popover — Side/Mode/Site selectors.
 */

import { useStratStore } from '@/stores/strat.store';
import { useTranslation } from 'react-i18next';
import type { StratSide, StratMode, StratSite } from '@nd-battleplanner/shared';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Settings2 } from 'lucide-react';

const SIDES: StratSide[] = ['Attackers', 'Defenders', 'Unknown'];
const MODES: StratMode[] = ['Bomb', 'Secure', 'Hostage', 'Unknown'];
const SITES: StratSite[] = ['1', '2', '3', '4', '5', 'Unknown'];

interface StratConfigPopoverProps {
  onConfigChange?: (config: { side?: StratSide; mode?: StratMode; site?: StratSite }) => void;
  readOnly?: boolean;
}

export function StratConfigPopover({ onConfigChange, readOnly }: StratConfigPopoverProps) {
  const { t } = useTranslation();
  const stratConfig = useStratStore(s => s.stratConfig);
  const setStratConfig = useStratStore(s => s.setStratConfig);

  const handleChange = (key: string, value: string) => {
    const update = { [key]: value };
    setStratConfig(update);
    onConfigChange?.(update);
  };

  if (readOnly) return null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title={t('editor.stratConfig.title')}>
          <Settings2 className="h-3.5 w-3.5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="start">
        <div className="space-y-3">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">{t('editor.stratConfig.side')}</p>
            <div className="flex gap-1">
              {SIDES.map(s => (
                <Button
                  key={s}
                  variant={stratConfig.side === s ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1 h-6 text-xs px-1"
                  onClick={() => handleChange('side', s)}
                >
                  {s === 'Unknown' ? '?' : t(`editor.stratConfig.sideValues.${s}`)}
                </Button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">{t('editor.stratConfig.mode')}</p>
            <div className="flex gap-1">
              {MODES.map(m => (
                <Button
                  key={m}
                  variant={stratConfig.mode === m ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1 h-6 text-xs px-1"
                  onClick={() => handleChange('mode', m)}
                >
                  {m === 'Unknown' ? '?' : t(`editor.stratConfig.modeValues.${m}`)}
                </Button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">{t('editor.stratConfig.site')}</p>
            <div className="flex gap-1">
              {SITES.map(s => (
                <Button
                  key={s}
                  variant={stratConfig.site === s ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1 h-6 text-xs px-1"
                  onClick={() => handleChange('site', s)}
                >
                  {s === 'Unknown' ? '?' : s}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
