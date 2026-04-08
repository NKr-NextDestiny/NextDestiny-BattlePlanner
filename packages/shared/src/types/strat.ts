/**
 * Types for the Strat Planner system.
 */

// --- Strat Config ---

export type StratSide = 'Attackers' | 'Defenders' | 'Unknown';
export type StratMode = 'Bomb' | 'Secure' | 'Hostage' | 'Unknown';
export type StratSite = '1' | '2' | '3' | '4' | '5' | 'Unknown';

export interface StratConfig {
  side: StratSide;
  mode: StratMode;
  site: StratSite;
}

// --- Phases ---

export interface BattleplanPhase {
  id: string;
  battleplanId: string;
  index: number;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

// --- Bans ---

export interface OperatorBan {
  id: string;
  battleplanId: string;
  operatorName: string;
  side: 'attacker' | 'defender';
  slotIndex: number; // 0 or 1
  createdAt: string;
  updatedAt: string;
}

// --- Operator Slot Loadout ---

export interface OperatorSlotLoadout {
  primaryWeapon: string | null;
  secondaryWeapon: string | null;
  primaryEquipment: string | null;
  secondaryEquipment: string | null;
}

// --- SVG Map Layers ---

export type SvgLayerCode =
  | 'bw' | 'ch' | 'txt' | 'fh' | 'dt'
  | 'bmb' | 'hst' | 'sec'
  | 'cam' | 'losf' | 'ld'
  | 'gp' | 'fe' | 'sl' | 'losw' | 'ip'
  | 'cmp' | 'lg';

export interface SvgLayerDef {
  code: SvgLayerCode;
  name: string;
  defaultVisible: boolean;
}

// --- Extended Operator Slot (with strat fields) ---

export interface StratOperatorSlot {
  id: string;
  battleplanId: string;
  slotNumber: number;
  operatorId: string | null;
  operatorName: string | null;
  side: 'attacker' | 'defender';
  color: string;
  visible: boolean;
  primaryWeapon: string | null;
  secondaryWeapon: string | null;
  primaryEquipment: string | null;
  secondaryEquipment: string | null;
  createdAt: string;
  updatedAt: string;
}

// --- Strat-enhanced Draw ---

export interface StratDrawExtensions {
  phaseId: string | null;
  operatorSlotId: string | null;
}

// --- Socket Events ---

export interface StratPhaseCreatePayload {
  battleplanId: string;
  name: string;
  description?: string;
}

export interface StratPhaseUpdatePayload {
  phaseId: string;
  name?: string;
  description?: string;
}

export interface StratPhaseDeletePayload {
  phaseId: string;
}

export interface StratPhaseSwitchPayload {
  phaseId: string;
}

export interface StratBanUpdatePayload {
  battleplanId: string;
  operatorName: string;
  side: 'attacker' | 'defender';
  slotIndex: number;
}

export interface StratBanRemovePayload {
  banId: string;
}

export interface StratConfigUpdatePayload {
  battleplanId: string;
  side?: StratSide;
  mode?: StratMode;
  site?: StratSite;
}

export interface StratLoadoutUpdatePayload {
  slotId: string;
  primaryWeapon?: string | null;
  secondaryWeapon?: string | null;
  primaryEquipment?: string | null;
  secondaryEquipment?: string | null;
}

export interface StratVisibilityTogglePayload {
  slotId: string;
  visible: boolean;
}

export interface StratColorUpdatePayload {
  slotId: string;
  color: string;
}
