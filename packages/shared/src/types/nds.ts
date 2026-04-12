/**
 * NextDestiny Strat (.nds) file format types.
 *
 * Binary structure:
 *   [4 bytes] Magic: "NDS\x01" (format ID + version)
 *   [4 bytes] Flags: uint32 (bit 0: compressed)
 *   [4 bytes] Payload size: uint32 (uncompressed size)
 *   [4 bytes] CRC32: uint32 (checksum of uncompressed payload)
 *   [N bytes] Payload: gzip-compressed JSON
 */

import type { DrawType, DrawData, SlotSide } from './battleplan.js';
import type { StratSide, StratMode, StratSite } from './strat.js';

// --- Header constants ---

export const NDS_MAGIC = 'NDS\x01';
export const NDS_HEADER_SIZE = 16;
export const NDS_FLAG_COMPRESSED = 1;

// --- Payload types ---

export interface NdsPayload {
  version: '1.0';
  app: string;
  appVersion: string;
  exportedAt: string;
  exportedBy: string;
  game: { slug: string; name: string };
  map: { slug: string; name: string };
  strat: NdsStrat;
}

export interface NdsStrat {
  name: string;
  description: string | null;
  notes: string | null;
  tags: string[];
  config: {
    side: StratSide;
    mode: StratMode;
    site: StratSite;
  };
  bans: NdsBan[];
  operators: NdsOperator[];
  phases: NdsPhase[];
}

export interface NdsBan {
  operatorName: string;
  side: 'attacker' | 'defender';
  slotIndex: number;
}

export interface NdsOperator {
  slotNumber: number;
  side: SlotSide;
  operatorName: string | null;
  color: string;
  visible: boolean;
  loadout: {
    primaryWeapon: string | null;
    secondaryWeapon: string | null;
    primaryEquipment: string | null;
    secondaryEquipment: string | null;
  };
}

export interface NdsPhase {
  index: number;
  name: string;
  description: string | null;
  draws: NdsDraw[];
}

export interface NdsDraw {
  type: DrawType;
  floorIndex: number;
  originX: number;
  originY: number;
  destinationX: number | null;
  destinationY: number | null;
  data: DrawData;
  operatorSlotNumber: number | null;
  operatorSide: SlotSide | null;
}
