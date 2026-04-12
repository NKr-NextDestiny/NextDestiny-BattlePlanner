/**
 * Side panel — operator tool panel for one side (ATK or DEF).
 * Shows: operator avatars, drawing tools, and gadget list for the selected operator.
 * When an operator is selected, shows their unique + secondary + general gadgets.
 */

import { useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Tool } from '@nd-battleplanner/shared';
import type { StratOperatorSlot, Operator, Gadget } from '@nd-battleplanner/shared';
import { apiGet } from '@/lib/api';
import { useStratStore } from '@/stores/strat.store';
import { useCanvasStore } from '@/stores/canvas.store';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Pencil, Minus, MoveRight, Square, Circle, Type, Eraser, MousePointer2, Trash2 } from 'lucide-react';
import { getGadgetFallbackIcon } from './GadgetIcons';
import { LoadoutPopover } from './LoadoutPopover';

interface SidePanelProps {
  side: 'attacker' | 'defender';
  gameSlug: string;
  readOnly?: boolean;
  onVisibilityToggle?: (slotId: string, visible: boolean) => void;
  onColorChange?: (slotId: string, color: string) => void;
  onLoadoutUpdate?: (slotId: string, loadout: Record<string, string | null>) => void;
  onFloorClear?: () => void;
}

const DRAWING_TOOLS: Array<{ tool: Tool; icon: typeof Pencil; label: string }> = [
  { tool: Tool.Pen, icon: Pencil, label: 'Pen' },
  { tool: Tool.Line, icon: Minus, label: 'Line' },
  { tool: Tool.Arrow, icon: MoveRight, label: 'Arrow' },
  { tool: Tool.Rectangle, icon: Square, label: 'Rectangle' },
  { tool: Tool.Ellipse, icon: Circle, label: 'Ellipse' },
  { tool: Tool.Text, icon: Type, label: 'Text' },
  { tool: Tool.Eraser, icon: Eraser, label: 'Eraser' },
  { tool: Tool.Select, icon: MousePointer2, label: 'Select' },
];

const LANDSCAPE_TOOLS: Array<{ tool: Tool; icon: typeof Pencil; label: string }> = [
  { tool: Tool.Pen, icon: Pencil, label: 'Pen' },
  { tool: Tool.Line, icon: Minus, label: 'Line' },
  { tool: Tool.Arrow, icon: MoveRight, label: 'Arrow' },
  { tool: Tool.Rectangle, icon: Square, label: 'Rect' },
  { tool: Tool.Ellipse, icon: Circle, label: 'Ellipse' },
  { tool: Tool.Text, icon: Type, label: 'Text' },
];

const CATEGORY_ORDER: Record<string, number> = { unique: 0, secondary: 1, general: 2 };
const CATEGORY_LABELS: Record<string, string> = { unique: 'Unique', secondary: 'Secondary', general: 'General' };

export function SidePanel({ side, gameSlug, readOnly, onVisibilityToggle, onColorChange, onLoadoutUpdate, onFloorClear }: SidePanelProps) {
  const { t } = useTranslation();
  const operatorSlots = useStratStore(s => s.operatorSlots);
  const slots = useMemo(
    () => operatorSlots.filter(s => s.side === side).sort((a, b) => a.slotNumber - b.slotNumber),
    [operatorSlots, side],
  );
  const activeSlotId = useStratStore(s => s.activeOperatorSlotId);
  const landscapeColor = useStratStore(s => s.landscapeColor);
  const landscapeVisible = useStratStore(s => s.landscapeVisible);
  const setLandscapeColor = useStratStore(s => s.setLandscapeColor);
  const setLandscapeVisible = useStratStore(s => s.setLandscapeVisible);
  const setActiveSlotId = useStratStore(s => s.setActiveOperatorSlotId);
  const updateSlot = useStratStore(s => s.updateOperatorSlot);
  const activeTool = useCanvasStore(s => s.tool);
  const setTool = useCanvasStore(s => s.setTool);
  const setColor = useCanvasStore(s => s.setColor);
  const selectedIcon = useCanvasStore(s => s.selectedIcon);
  const setSelectedIcon = useCanvasStore(s => s.setSelectedIcon);

  const accentColor = side === 'attacker' ? '#1a8fe3' : '#e33a3a';

  // Find the active slot on this side
  const activeSlot = useMemo(
    () => slots.find(s => s.id === activeSlotId) ?? null,
    [slots, activeSlotId],
  );

  // Fetch operators (with gadgets) for this game
  const { data: operatorsData } = useQuery({
    queryKey: ['operators', gameSlug],
    queryFn: () => apiGet<{ data: Operator[] }>(`/games/${gameSlug}/operators`),
    staleTime: 5 * 60 * 1000,
    enabled: !!gameSlug,
  });

  // Fetch all gadgets to get general-category ones
  const { data: gadgetsData } = useQuery({
    queryKey: ['gadgets', gameSlug],
    queryFn: () => apiGet<{ data: Gadget[] }>(`/games/${gameSlug}/gadgets`),
    staleTime: 5 * 60 * 1000,
    enabled: !!gameSlug,
  });

  // Build operator lookup
  const operatorMap = useMemo(() => {
    const all = operatorsData?.data || [];
    const map: Record<string, Operator> = {};
    for (const op of all) map[op.id] = op;
    return map;
  }, [operatorsData]);

  // General gadgets
  const generalGadgets = useMemo(() => {
    const all = gadgetsData?.data || [];
    return all.filter(g => g.category === 'general');
  }, [gadgetsData]);

  // Gadgets for the active operator on this side
  const activeOperatorGadgets = useMemo(() => {
    if (!activeSlot?.operatorId) return [];
    const op = operatorMap[activeSlot.operatorId];
    if (!op?.gadgets) return [...generalGadgets];

    // Combine operator's gadgets + general gadgets (deduped)
    const seen = new Set<string>();
    const result: Gadget[] = [];
    for (const g of op.gadgets) {
      if (!seen.has(g.id)) { seen.add(g.id); result.push(g); }
    }
    for (const g of generalGadgets) {
      if (!seen.has(g.id)) { seen.add(g.id); result.push(g); }
    }
    // Sort by category then name
    result.sort((a, b) => {
      const catDiff = (CATEGORY_ORDER[a.category] ?? 9) - (CATEGORY_ORDER[b.category] ?? 9);
      if (catDiff !== 0) return catDiff;
      return a.name.localeCompare(b.name);
    });
    return result;
  }, [activeSlot, operatorMap, generalGadgets]);

  const handleToolClick = useCallback((tool: Tool) => {
    if (!activeSlot) return;
    setActiveSlotId(activeSlot.id);
    setTool(tool);
    setColor(activeSlot.color);
    if (tool !== Tool.Icon) setSelectedIcon(null);
  }, [activeSlot, setActiveSlotId, setTool, setColor, setSelectedIcon]);

  const handleGadgetClick = useCallback((gadget: Gadget) => {
    if (!activeSlot) return;
    setActiveSlotId(activeSlot.id);
    setTool(Tool.Icon);
    setColor(activeSlot.color);
    const op = activeSlot.operatorId ? operatorMap[activeSlot.operatorId] : null;
    setSelectedIcon({
      type: 'gadget',
      id: gadget.id,
      url: gadget.icon || '',
      name: gadget.name,
      color: activeSlot.color,
      operatorIcon: op?.icon || undefined,
    });
  }, [activeSlot, operatorMap, setActiveSlotId, setTool, setColor, setSelectedIcon]);

  const handleLandscapeTool = (tool: Tool) => {
    setActiveSlotId(null);
    setTool(tool);
    setColor(landscapeColor);
    setSelectedIcon(null);
  };

  const handleVisibilityChange = (slot: StratOperatorSlot, visible: boolean) => {
    updateSlot(slot.id, { visible });
    onVisibilityToggle?.(slot.id, visible);
  };

  const handleColorChange = (slot: StratOperatorSlot, color: string) => {
    updateSlot(slot.id, { color });
    onColorChange?.(slot.id, color);
  };

  return (
    <div
      className="flex flex-col h-full overflow-y-auto border-r bg-background/80 px-2 py-2"
      style={{ borderColor: `${accentColor}33` }}
    >
      {/* Header */}
      <p className="text-[10px] font-bold uppercase tracking-wider text-center mb-2" style={{ color: accentColor }}>
        {side === 'attacker' ? t('editor.sidePanel.attackers') : t('editor.sidePanel.defenders')}
      </p>

      {/* Operator avatars row */}
      <div className="flex items-center justify-around mb-2">
        {slots.map(slot => (
          <Tooltip key={slot.id}>
            <TooltipTrigger asChild>
              <button
                className={`h-8 w-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white overflow-hidden transition-all ${
                  activeSlotId === slot.id ? 'ring-2 ring-primary scale-110' : 'opacity-70 hover:opacity-100'
                }`}
                style={{ backgroundColor: slot.operatorId ? slot.color : '#555' }}
                onClick={() => setActiveSlotId(slot.id)}
              >
                {slot.operatorId && operatorMap[slot.operatorId]?.icon ? (
                  <img
                    src={`/uploads${operatorMap[slot.operatorId]!.icon}`}
                    alt={slot.operatorName || ''}
                    className="h-full w-full object-cover scale-125"
                  />
                ) : (
                  slot.operatorName?.[0] || '?'
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent className="text-xs">{slot.operatorName || t('editor.operatorPicker.slot', { number: slot.slotNumber })}</TooltipContent>
          </Tooltip>
        ))}
      </div>

      {/* Visibility row + color indicators */}
      <div className="flex items-center justify-around mb-2">
        {slots.map(slot => (
          <div key={slot.id} className="flex flex-col items-center gap-0.5">
            <Checkbox
              checked={slot.visible}
              onCheckedChange={(v) => handleVisibilityChange(slot, !!v)}
              className="h-3.5 w-3.5"
              disabled={readOnly}
            />
            <Tooltip>
              <TooltipTrigger asChild>
                <input
                  type="color"
                  value={slot.color}
                  onChange={(e) => handleColorChange(slot, e.target.value)}
                  className="h-3 w-5 p-0 border-0 cursor-pointer rounded-sm"
                  disabled={readOnly}
                />
              </TooltipTrigger>
              <TooltipContent className="text-xs">{t('editor.sidePanel.colorFor', { name: slot.operatorName || t('editor.operatorPicker.slot', { number: slot.slotNumber }) })}</TooltipContent>
            </Tooltip>
          </div>
        ))}
      </div>

      {/* Landscape section */}
      <div className="mb-2 p-1.5 rounded border border-dashed border-green-600/40 bg-green-900/10">
        <div className="flex items-center gap-1.5 mb-1">
          <input
            type="color"
            value={landscapeColor}
            onChange={(e) => { setLandscapeColor(e.target.value); if (!activeSlotId) setColor(e.target.value); }}
            className="h-4 w-4 p-0 border-0 cursor-pointer rounded-sm"
            disabled={readOnly}
          />
          <span className="text-[9px] text-green-400 font-medium">{t('editor.sidePanel.landscape')}</span>
          <Checkbox
            checked={landscapeVisible}
            onCheckedChange={(v) => setLandscapeVisible(!!v)}
            className="h-3 w-3 ml-auto"
            disabled={readOnly}
          />
        </div>
        {!readOnly && (
          <div className="flex gap-0.5">
            {LANDSCAPE_TOOLS.map(({ tool, icon: Icon, label }) => {
              const isActive = !activeSlotId && activeTool === tool;
              const toolKey = label.toLowerCase() === 'rect' ? 'rectangle' : label.toLowerCase();
              return (
                <Tooltip key={tool}>
                  <TooltipTrigger asChild>
                    <button
                      className={`flex items-center justify-center h-6 flex-1 rounded-sm transition-colors ${
                        isActive ? 'bg-green-600 text-white' : 'hover:bg-muted text-muted-foreground'
                      }`}
                      onClick={() => handleLandscapeTool(tool)}
                    >
                      <Icon className="h-3 w-3" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="text-xs">{t('editor.sidePanel.landscapeTool', { tool: t(`editor.sidePanel.tools.${toolKey}`) })}</TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected operator section */}
      {activeSlot && !readOnly && (
        <div className="flex flex-col gap-1">
          {/* Operator name + loadout */}
          <div className="flex items-center gap-1.5 px-1">
            <div
              className="h-3 w-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: activeSlot.color }}
            />
            <span className="text-[10px] font-bold truncate flex-1">
              {activeSlot.operatorName || `Slot ${activeSlot.slotNumber}`}
            </span>
            {activeSlot.operatorId && onLoadoutUpdate && (
              <LoadoutPopover
                slot={activeSlot}
                secondaryGadgets={operatorMap[activeSlot.operatorId]?.gadgets?.filter(g => g.category === 'secondary')}
                onLoadoutUpdate={onLoadoutUpdate}
                readOnly={readOnly}
              />
            )}
          </div>

          {/* Drawing tools row */}
          <div className="flex gap-0.5 mb-1">
            {DRAWING_TOOLS.map(({ tool, icon: Icon, label }) => {
              const isActive = activeSlotId === activeSlot.id && activeTool === tool && !selectedIcon;
              const toolKey = label.toLowerCase();
              return (
                <Tooltip key={tool}>
                  <TooltipTrigger asChild>
                    <button
                      className={`flex items-center justify-center h-7 flex-1 rounded-sm transition-colors ${
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                      }`}
                      onClick={() => handleToolClick(tool)}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="text-xs">{t(`editor.sidePanel.tools.${toolKey}`)}</TooltipContent>
                </Tooltip>
              );
            })}
          </div>

          {/* Gadget list */}
          {activeOperatorGadgets.length > 0 && (
            <div className="flex flex-col gap-px">
              {(() => {
                let lastCat = '';
                return activeOperatorGadgets.map((gadget) => {
                  const showHeader = gadget.category !== lastCat;
                  if (showHeader) lastCat = gadget.category;
                  const isActive = selectedIcon?.id === gadget.id && activeTool === Tool.Icon;

                  return (
                    <div key={gadget.id}>
                      {showHeader && (
                        <div className="text-[8px] font-bold uppercase tracking-wider text-muted-foreground/60 pt-1.5 pb-0.5 px-0.5 border-t border-border/20">
                          {t(`editor.sidePanel.categories.${gadget.category}`, CATEGORY_LABELS[gadget.category] || gadget.category)}
                        </div>
                      )}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            className={`flex items-center gap-2 w-full h-7 px-1.5 rounded-sm transition-colors ${
                              isActive
                                ? 'bg-primary text-primary-foreground'
                                : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                            }`}
                            onClick={() => handleGadgetClick(gadget)}
                          >
                            <div
                              className={`h-5 w-5 rounded flex-shrink-0 flex items-center justify-center ${
                                isActive ? '' : ''
                              }`}
                              style={{
                                backgroundColor: isActive ? undefined : `${activeSlot.color}33`,
                              }}
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
                                  return <FallbackIcon className="h-3.5 w-3.5" />;
                                })()
                              )}
                            </div>
                            <span className="text-[9px] font-medium truncate">{gadget.name}</span>
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="text-xs">{gadget.name}</TooltipContent>
                      </Tooltip>
                    </div>
                  );
                });
              })()}
            </div>
          )}
        </div>
      )}

      {/* Clear floor button */}
      {!readOnly && onFloorClear && (
        <div className="mt-auto pt-2 px-1">
          <button
            className="flex items-center gap-1 w-full h-6 px-2 rounded text-[10px] text-destructive hover:bg-destructive/10 transition-colors"
            onClick={onFloorClear}
          >
            <Trash2 className="h-3 w-3" />
            {t('editor.sidePanel.clearFloor')}
          </button>
        </div>
      )}

      {/* No operator selected hint */}
      {!activeSlot && !readOnly && (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-[9px] text-muted-foreground/50 text-center px-2">
            {t('editor.sidePanel.selectOperator')}
          </p>
        </div>
      )}
    </div>
  );
}
