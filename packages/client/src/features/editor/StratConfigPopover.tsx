/**
 * Strat config popover — Side/Mode/Site selectors.
 */

import { useStratStore } from '@/stores/strat.store';
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
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="Strat Config">
          <Settings2 className="h-3.5 w-3.5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="start">
        <div className="space-y-3">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Side</p>
            <div className="flex gap-1">
              {SIDES.map(s => (
                <Button
                  key={s}
                  variant={stratConfig.side === s ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1 h-6 text-xs px-1"
                  onClick={() => handleChange('side', s)}
                >
                  {s === 'Unknown' ? '?' : s.slice(0, 3)}
                </Button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Mode</p>
            <div className="flex gap-1">
              {MODES.map(m => (
                <Button
                  key={m}
                  variant={stratConfig.mode === m ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1 h-6 text-xs px-1"
                  onClick={() => handleChange('mode', m)}
                >
                  {m === 'Unknown' ? '?' : m.slice(0, 3)}
                </Button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Site</p>
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
