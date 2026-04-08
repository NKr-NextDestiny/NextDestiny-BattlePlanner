/**
 * SVG layer visibility popover — grouped checkboxes.
 */

import { useStratStore } from '@/stores/strat.store';
import { mapLayers } from '@/data/mainData';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Layers, RotateCcw } from 'lucide-react';

const OBJECTIVE_CODES = ['bmb', 'sec', 'hst'];
const STRUCTURAL_CODES = ['bw', 'ch', 'fh', 'sl', 'losw', 'losf'];
const TACTICAL_CODES = ['cam', 'dt', 'ld', 'ip', 'gp', 'fe'];
const OTHER_CODES = ['cmp', 'lg', 'txt'];

interface LayerGroup {
  label: string;
  codes: string[];
}

const GROUPS: LayerGroup[] = [
  { label: 'Objectives', codes: OBJECTIVE_CODES },
  { label: 'Structural', codes: STRUCTURAL_CODES },
  { label: 'Tactical', codes: TACTICAL_CODES },
  { label: 'Other', codes: OTHER_CODES },
];

export function LayerTogglePopover() {
  const svgLayerVisibility = useStratStore(s => s.svgLayerVisibility);
  const setSvgLayerVisibility = useStratStore(s => s.setSvgLayerVisibility);
  const resetSvgLayerVisibility = useStratStore(s => s.resetSvgLayerVisibility);

  const getLayerName = (code: string) => mapLayers.find(l => l.short === code)?.full ?? code;

  const toggleGroup = (codes: string[], allVisible: boolean) => {
    for (const code of codes) {
      setSvgLayerVisibility(code, !allVisible);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="SVG Layers">
          <Layers className="h-3.5 w-3.5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-52 p-3" align="start">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-medium">SVG Layers</p>
          <Button variant="ghost" size="sm" className="h-5 px-1" onClick={resetSvgLayerVisibility} title="Reset to defaults">
            <RotateCcw className="h-3 w-3" />
          </Button>
        </div>
        <div className="space-y-3">
          {GROUPS.map(group => {
            const allVisible = group.codes.every(c => svgLayerVisibility[c] !== false);
            return (
              <div key={group.label}>
                <div className="flex items-center gap-2 mb-1">
                  <Checkbox
                    checked={allVisible}
                    onCheckedChange={() => toggleGroup(group.codes, allVisible)}
                    className="h-3 w-3"
                  />
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{group.label}</span>
                </div>
                <div className="ml-5 space-y-0.5">
                  {group.codes.map(code => (
                    <div key={code} className="flex items-center gap-2">
                      <Checkbox
                        checked={svgLayerVisibility[code] !== false}
                        onCheckedChange={(v) => setSvgLayerVisibility(code, !!v)}
                        className="h-3 w-3"
                      />
                      <span className="text-xs">{getLayerName(code)}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
