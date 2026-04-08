import { create } from 'zustand';
import type {
  StratConfig, StratSide, StratMode, StratSite,
  BattleplanPhase, OperatorBan, StratOperatorSlot,
} from '@nd-battleplanner/shared';

import { mapLayers } from '@/data/mainData';

interface StratStoreState {
  phases: BattleplanPhase[];
  activePhaseId: string | null;
  setPhases: (phases: BattleplanPhase[]) => void;
  setActivePhaseId: (id: string | null) => void;
  addPhase: (phase: BattleplanPhase) => void;
  updatePhase: (phaseId: string, data: Partial<Pick<BattleplanPhase, 'name' | 'description' | 'index'>>) => void;
  removePhase: (phaseId: string) => void;

  bans: OperatorBan[];
  setBans: (bans: OperatorBan[]) => void;
  setBan: (ban: OperatorBan) => void;
  removeBan: (banId: string) => void;

  stratConfig: StratConfig;
  setStratConfig: (config: Partial<StratConfig>) => void;

  operatorSlots: StratOperatorSlot[];
  activeOperatorSlotId: string | null;
  setOperatorSlots: (slots: StratOperatorSlot[]) => void;
  setActiveOperatorSlotId: (id: string | null) => void;
  updateOperatorSlot: (slotId: string, data: Partial<StratOperatorSlot>) => void;

  landscapeColor: string;
  landscapeVisible: boolean;
  setLandscapeColor: (color: string) => void;
  setLandscapeVisible: (visible: boolean) => void;

  svgLayerVisibility: Record<string, boolean>;
  setSvgLayerVisibility: (code: string, visible: boolean) => void;
  resetSvgLayerVisibility: () => void;

  getActiveColor: () => string;
  getAttackerSlots: () => StratOperatorSlot[];
  getDefenderSlots: () => StratOperatorSlot[];
  getVisibleSlotIds: () => Set<string>;
  getBannedOperatorNames: () => Set<string>;

  reset: () => void;
}

function buildDefaultLayerVisibility(): Record<string, boolean> {
  const vis: Record<string, boolean> = {};
  for (const layer of mapLayers) {
    vis[layer.short] = layer.default;
  }
  return vis;
}

const DEFAULT_CONFIG: StratConfig = { side: 'Unknown' as StratSide, mode: 'Unknown' as StratMode, site: 'Unknown' as StratSite };

export const useStratStore = create<StratStoreState>((set, get) => ({
  phases: [],
  activePhaseId: null,
  setPhases: (phases) => set({ phases }),
  setActivePhaseId: (id) => set({ activePhaseId: id }),
  addPhase: (phase) => set((s) => ({ phases: [...s.phases, phase] })),
  updatePhase: (phaseId, data) => set((s) => ({
    phases: s.phases.map(p => p.id === phaseId ? { ...p, ...data } : p),
  })),
  removePhase: (phaseId) => set((s) => ({
    phases: s.phases.filter(p => p.id !== phaseId),
    activePhaseId: s.activePhaseId === phaseId ? (s.phases[0]?.id ?? null) : s.activePhaseId,
  })),

  bans: [],
  setBans: (bans) => set({ bans }),
  setBan: (ban) => set((s) => {
    const existing = s.bans.findIndex(b => b.side === ban.side && b.slotIndex === ban.slotIndex);
    if (existing >= 0) {
      const next = [...s.bans];
      next[existing] = ban;
      return { bans: next };
    }
    return { bans: [...s.bans, ban] };
  }),
  removeBan: (banId) => set((s) => ({ bans: s.bans.filter(b => b.id !== banId) })),

  stratConfig: { ...DEFAULT_CONFIG },
  setStratConfig: (config) => set((s) => ({ stratConfig: { ...s.stratConfig, ...config } })),

  operatorSlots: [],
  activeOperatorSlotId: null,
  setOperatorSlots: (slots) => set({ operatorSlots: slots }),
  setActiveOperatorSlotId: (id) => set({ activeOperatorSlotId: id }),
  updateOperatorSlot: (slotId, data) => set((s) => ({
    operatorSlots: s.operatorSlots.map(slot => slot.id === slotId ? { ...slot, ...data } : slot),
  })),

  landscapeColor: '#00FF00',
  landscapeVisible: true,
  setLandscapeColor: (color) => set({ landscapeColor: color }),
  setLandscapeVisible: (visible) => set({ landscapeVisible: visible }),

  svgLayerVisibility: buildDefaultLayerVisibility(),
  setSvgLayerVisibility: (code, visible) => set((s) => ({
    svgLayerVisibility: { ...s.svgLayerVisibility, [code]: visible },
  })),
  resetSvgLayerVisibility: () => set({ svgLayerVisibility: buildDefaultLayerVisibility() }),

  getActiveColor: () => {
    const { activeOperatorSlotId, operatorSlots, landscapeColor } = get();
    if (!activeOperatorSlotId) return landscapeColor;
    const slot = operatorSlots.find(s => s.id === activeOperatorSlotId);
    return slot?.color ?? landscapeColor;
  },

  getAttackerSlots: () => {
    return get().operatorSlots
      .filter(s => s.side === 'attacker')
      .sort((a, b) => a.slotNumber - b.slotNumber);
  },

  getDefenderSlots: () => {
    return get().operatorSlots
      .filter(s => s.side === 'defender')
      .sort((a, b) => a.slotNumber - b.slotNumber);
  },

  getVisibleSlotIds: () => {
    return new Set(get().operatorSlots.filter(s => s.visible).map(s => s.id));
  },

  getBannedOperatorNames: () => {
    return new Set(get().bans.map(b => b.operatorName));
  },

  reset: () => set({
    phases: [],
    activePhaseId: null,
    bans: [],
    stratConfig: { ...DEFAULT_CONFIG },
    operatorSlots: [],
    activeOperatorSlotId: null,
    landscapeColor: '#00FF00',
    landscapeVisible: true,
    svgLayerVisibility: buildDefaultLayerVisibility(),
  }),
}));
