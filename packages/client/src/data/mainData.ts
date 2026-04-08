/**
 * Static map metadata.
 * Floor ranges, layer definitions, floor terms, and map pools.
 */

export interface FloorTerm {
  name: string;
  css?: string;
}

export interface MapLayerDef {
  short: string;
  full: string;
  default: boolean;
}

export interface MapMeta {
  revision: number;
  name: string;
  imgUrlPrefix: string;
  minFloor: number;
  maxFloor: number;
  scaleFactor: number;
}

export interface MapPool {
  name: string;
  mapPool: string[];
}

export const floorTerms: Record<string, FloorTerm> = {
  '-1': { name: 'Sub-Basement', css: 'neg-one' },
  '0': { name: 'Basement', css: 'zero' },
  '1': { name: '1st Floor', css: 'one' },
  '2': { name: '2nd Floor', css: 'two' },
  '3': { name: '3rd Floor', css: 'three' },
  '4': { name: '4th Floor', css: 'four' },
  '5': { name: '5th Floor', css: 'five' },
  '10': { name: 'Roof' },
};

export const mapLayers: MapLayerDef[] = [
  { short: 'bmb', full: 'Bomb', default: true },
  { short: 'sec', full: 'Secure', default: false },
  { short: 'hst', full: 'Hostage', default: false },
  { short: 'fh', full: 'Floor hatch', default: true },
  { short: 'ch', full: 'Ceiling hatch', default: true },
  { short: 'bw', full: 'Breakable wall', default: true },
  { short: 'losw', full: 'Line of sight wall', default: true },
  { short: 'losf', full: 'Line of sight floor', default: true },
  { short: 'sl', full: 'Skylight', default: true },
  { short: 'dt', full: 'Drone tunnel', default: true },
  { short: 'cam', full: 'Security camera', default: true },
  { short: 'ld', full: 'Ladder', default: true },
  { short: 'fe', full: 'Fire extinguisher', default: true },
  { short: 'gp', full: 'Gas pipe', default: true },
  { short: 'ip', full: 'Insertion point', default: true },
  { short: 'txt', full: 'Calls', default: true },
  { short: 'cmp', full: 'Compass', default: true },
  { short: 'lg', full: 'Legend', default: true },
];

/** Objective layers — visibility depends on strat config mode */
export const objectiveLayerCodes = ['bmb', 'sec', 'hst'] as const;

/** Structural layers */
export const structuralLayerCodes = ['bw', 'ch', 'fh', 'sl', 'losw', 'losf', 'fe', 'gp', 'txt'] as const;

/** Tactical layers */
export const tacticalLayerCodes = ['cam', 'dt', 'ld', 'ip'] as const;

export const mapData: Record<string, MapMeta> = {
  bank: { revision: 8, name: 'Bank', imgUrlPrefix: 'bank', minFloor: 0, maxFloor: 3, scaleFactor: 2 },
  bartlett: { revision: 2, name: 'Bartlett University', imgUrlPrefix: 'bartlett', minFloor: 1, maxFloor: 3, scaleFactor: 2 },
  border: { revision: 8, name: 'Border', imgUrlPrefix: 'border', minFloor: 1, maxFloor: 3, scaleFactor: 2 },
  chalet: { revision: 8, name: 'Chalet', imgUrlPrefix: 'chalet', minFloor: 0, maxFloor: 3, scaleFactor: 2 },
  closequarters: { revision: 2, name: 'Close Quarters', imgUrlPrefix: 'closequarters', minFloor: 1, maxFloor: 2, scaleFactor: 2 },
  club: { revision: 6, name: 'Club House', imgUrlPrefix: 'club', minFloor: 0, maxFloor: 3, scaleFactor: 2 },
  coastline: { revision: 4, name: 'Coastline', imgUrlPrefix: 'coastline', minFloor: 1, maxFloor: 3, scaleFactor: 2 },
  consulate: { revision: 8, name: 'Consulate', imgUrlPrefix: 'consulate', minFloor: 0, maxFloor: 3, scaleFactor: 2 },
  district: { revision: 1, name: 'District', imgUrlPrefix: 'district', minFloor: 1, maxFloor: 1, scaleFactor: 2 },
  emerald: { revision: 6, name: 'Emerald Plains', imgUrlPrefix: 'emerald', minFloor: 1, maxFloor: 3, scaleFactor: 2 },
  favela: { revision: 3, name: 'Favela', imgUrlPrefix: 'favela', minFloor: 0, maxFloor: 4, scaleFactor: 2 },
  fortress: { revision: 8, name: 'Fortress', imgUrlPrefix: 'fortress', minFloor: 1, maxFloor: 5, scaleFactor: 2 },
  hereford: { revision: 5, name: 'Hereford Base', imgUrlPrefix: 'hereford', minFloor: 0, maxFloor: 4, scaleFactor: 1 },
  house: { revision: 4, name: 'House', imgUrlPrefix: 'house', minFloor: 0, maxFloor: 3, scaleFactor: 1 },
  kafe: { revision: 5, name: 'Kafe Dostoyevsky', imgUrlPrefix: 'kafe', minFloor: 1, maxFloor: 4, scaleFactor: 2 },
  kanal: { revision: 3, name: 'Kanal', imgUrlPrefix: 'kanal', minFloor: -1, maxFloor: 3, scaleFactor: 2 },
  lair: { revision: 7, name: 'Lair', imgUrlPrefix: 'lair', minFloor: 0, maxFloor: 3, scaleFactor: 2 },
  labs: { revision: 6, name: 'Nighthaven Labs', imgUrlPrefix: 'labs', minFloor: 0, maxFloor: 3, scaleFactor: 2 },
  oregon: { revision: 4, name: 'Oregon', imgUrlPrefix: 'oregon', minFloor: 0, maxFloor: 4, scaleFactor: 2 },
  outback: { revision: 3, name: 'Outback', imgUrlPrefix: 'outback', minFloor: 1, maxFloor: 3, scaleFactor: 2 },
  plane: { revision: 3, name: 'Presidential Plane', imgUrlPrefix: 'plane', minFloor: 1, maxFloor: 4, scaleFactor: 2 },
  skyscraper: { revision: 6, name: 'Skyscraper', imgUrlPrefix: 'skyscraper', minFloor: 1, maxFloor: 3, scaleFactor: 2 },
  stadiumalpha: { revision: 2, name: 'Stadium Alpha', imgUrlPrefix: 'stadiumalpha', minFloor: 0, maxFloor: 3, scaleFactor: 2 },
  stadiumbravo: { revision: 5, name: 'Stadium Bravo', imgUrlPrefix: 'stadiumbravo', minFloor: 0, maxFloor: 3, scaleFactor: 2 },
  themepark: { revision: 5, name: 'Theme Park', imgUrlPrefix: 'themepark', minFloor: 1, maxFloor: 3, scaleFactor: 2 },
  tower: { revision: 2, name: 'Tower', imgUrlPrefix: 'tower', minFloor: 1, maxFloor: 5, scaleFactor: 2 },
  villa: { revision: 7, name: 'Villa', imgUrlPrefix: 'villa', minFloor: 0, maxFloor: 3, scaleFactor: 2 },
  yacht: { revision: 2, name: 'Yacht', imgUrlPrefix: 'yacht', minFloor: 1, maxFloor: 5, scaleFactor: 2 },
};

export const mapPools: Record<string, MapPool> = {
  quick: {
    name: 'Quick Play',
    mapPool: ['bank', 'border', 'chalet', 'club', 'coastline', 'consulate', 'emerald', 'favela', 'fortress', 'house', 'kafe', 'kanal', 'lair', 'labs', 'oregon', 'outback', 'plane', 'skyscraper', 'stadiumalpha', 'stadiumbravo', 'themepark', 'tower', 'villa', 'yacht'],
  },
  unranked: {
    name: 'Unranked',
    mapPool: ['bank', 'border', 'chalet', 'club', 'coastline', 'consulate', 'emerald', 'favela', 'fortress', 'house', 'kafe', 'kanal', 'lair', 'labs', 'oregon', 'outback', 'plane', 'skyscraper', 'stadiumalpha', 'stadiumbravo', 'themepark', 'tower', 'villa', 'yacht'],
  },
  ranked: {
    name: 'Ranked',
    mapPool: ['bank', 'border', 'chalet', 'club', 'coastline', 'consulate', 'emerald', 'kafe', 'kanal', 'lair', 'labs', 'oregon', 'outback', 'skyscraper', 'themepark', 'villa'],
  },
  all: {
    name: 'All',
    mapPool: ['bank', 'border', 'chalet', 'club', 'coastline', 'consulate', 'emerald', 'favela', 'fortress', 'house', 'kafe', 'kanal', 'lair', 'labs', 'oregon', 'outback', 'plane', 'skyscraper', 'stadiumalpha', 'stadiumbravo', 'themepark', 'tower', 'villa', 'yacht'],
  },
};

/** Get display name for a floor number */
export function getFloorName(floorNum: number): string {
  return floorTerms[String(floorNum)]?.name ?? `Floor ${floorNum}`;
}

/** Get floors for a map as an array of floor numbers */
export function getMapFloors(mapKey: string): number[] {
  const meta = mapData[mapKey];
  if (!meta) return [];
  const floors: number[] = [];
  for (let i = meta.minFloor; i <= meta.maxFloor; i++) {
    floors.push(i);
  }
  return floors;
}

/** Get default layer visibility map */
export function getDefaultLayerVisibility(): Record<string, boolean> {
  const visibility: Record<string, boolean> = {};
  for (const layer of mapLayers) {
    visibility[layer.short] = layer.default;
  }
  return visibility;
}
