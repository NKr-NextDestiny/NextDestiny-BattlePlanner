/**
 * 5-column × N-row tool matrix for one side's operator slots.
 * Clicking a cell sets BOTH the active operator AND the active tool.
 * Below the standard tools, operator-specific gadget rows are shown.
 */

import { Tool } from '@nd-battleplanner/shared';
import type { StratOperatorSlot, Gadget } from '@nd-battleplanner/shared';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Pencil, Minus, Square, Type, Eraser, MousePointer2 } from 'lucide-react';
import { getGadgetFallbackIcon } from './GadgetIcons';

const TOOL_ROWS: Array<{ tool: Tool; icon: typeof Pencil; label: string }> = [
  { tool: Tool.Pen, icon: Pencil, label: 'Pen' },
  { tool: Tool.Line, icon: Minus, label: 'Line' },
  { tool: Tool.Rectangle, icon: Square, label: 'Rectangle' },
  { tool: Tool.Text, icon: Type, label: 'Text' },
  { tool: Tool.Eraser, icon: Eraser, label: 'Eraser' },
  { tool: Tool.Select, icon: MousePointer2, label: 'Select' },
];

const CATEGORY_LABELS: Record<string, string> = {
  unique: 'Unique',
  secondary: 'Secondary',
  general: 'General',
};

interface SidePanelToolGridProps {
  slots: StratOperatorSlot[];
  activeTool: Tool;
  activeSlotId: string | null;
  onCellClick: (slotId: string, tool: Tool) => void;
  gadgetRows: Gadget[];
  slotGadgetIds: Map<string, Set<string>>;
  onGadgetClick: (slotId: string, gadget: Gadget) => void;
  activeGadgetId: string | null;
  readOnly?: boolean;
}

export function SidePanelToolGrid({
  slots, activeTool, activeSlotId, onCellClick,
  gadgetRows, slotGadgetIds, onGadgetClick, activeGadgetId,
  readOnly,
}: SidePanelToolGridProps) {
  if (readOnly) return null;

  const colCount = slots.length;

  // Group gadgets by category for section headers
  let lastCategory = '';

  return (
    <div className="flex flex-col gap-px">
      {/* Standard tool rows */}
      <div className="grid gap-px" style={{ gridTemplateColumns: `repeat(${colCount}, 1fr)` }}>
        {TOOL_ROWS.map(({ tool, icon: Icon, label }) =>
          slots.map((slot) => {
            const isActive = activeSlotId === slot.id && activeTool === tool && activeGadgetId === null;
            return (
              <Tooltip key={`${slot.id}-${tool}`}>
                <TooltipTrigger asChild>
                  <button
                    className={`flex items-center justify-center h-7 w-full rounded-sm transition-colors ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                    } ${!slot.operatorId && tool !== Tool.Eraser && tool !== Tool.Select ? 'opacity-40' : ''}`}
                    onClick={() => onCellClick(slot.id, tool)}
                    disabled={!slot.operatorId && tool !== Tool.Eraser && tool !== Tool.Select}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  {label} — {slot.operatorName || `Slot ${slot.slotNumber}`}
                </TooltipContent>
              </Tooltip>
            );
          })
        )}
      </div>

      {/* Gadget rows */}
      {gadgetRows.length > 0 && (
        <div className="mt-1">
          <div className="grid gap-px" style={{ gridTemplateColumns: `repeat(${colCount}, 1fr)` }}>
            {gadgetRows.map((gadget) => {
              // Insert category header when category changes
              const showHeader = gadget.category !== lastCategory;
              if (showHeader) lastCategory = gadget.category;

              return [
                // Category header row
                showHeader && (
                  <div
                    key={`header-${gadget.category}`}
                    className="text-[8px] font-bold uppercase tracking-wider text-muted-foreground/60 pt-1.5 pb-0.5 px-0.5 border-t border-border/20"
                    style={{ gridColumn: `1 / -1` }}
                  >
                    {CATEGORY_LABELS[gadget.category] || gadget.category}
                  </div>
                ),
                // Gadget cells for each slot
                ...slots.map((slot) => {
                  const available = slotGadgetIds.get(slot.id)?.has(gadget.id) ?? false;
                  const isActive = activeSlotId === slot.id && activeGadgetId === gadget.id;

                  return (
                    <Tooltip key={`${slot.id}-gadget-${gadget.id}`}>
                      <TooltipTrigger asChild>
                        <button
                          className={`flex items-center justify-center h-7 w-full rounded-sm transition-colors ${
                            isActive
                              ? 'bg-primary text-primary-foreground'
                              : available
                                ? 'hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer'
                                : 'opacity-20 cursor-not-allowed'
                          }`}
                          onClick={() => available && onGadgetClick(slot.id, gadget)}
                          disabled={!available}
                        >
                          {gadget.icon ? (
                            <img
                              src={`/uploads${gadget.icon}`}
                              alt={gadget.name}
                              className="h-4 w-4 rounded object-contain"
                            />
                          ) : (
                            (() => {
                              const FallbackIcon = getGadgetFallbackIcon(gadget.name);
                              return <FallbackIcon className="h-4 w-4" />;
                            })()
                          )}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs">
                        {gadget.name} — {slot.operatorName || `Slot ${slot.slotNumber}`}
                      </TooltipContent>
                    </Tooltip>
                  );
                }),
              ];
            })}
          </div>
        </div>
      )}
    </div>
  );
}
