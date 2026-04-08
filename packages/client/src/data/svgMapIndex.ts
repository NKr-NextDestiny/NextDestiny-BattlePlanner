/**
 * Maps SVG filenames (without extension) to TactiHub DB slugs.
 * Also maps DB slugs back to SVG filenames for reverse lookups.
 */

/** SVG filename → DB slug */
export const svgToDbSlug: Record<string, string> = {
  bank: 'bank',
  bartlett: 'bartlett',
  border: 'border',
  chalet: 'chalet',
  closequarters: 'close-quarters',
  club: 'clubhouse',
  coastline: 'coastline',
  consulate: 'consulate',
  district: 'district',
  emerald: 'emerald-plains',
  favela: 'favela',
  fortress: 'fortress',
  hereford: 'hereford',
  house: 'house',
  kafe: 'kafe',
  kanal: 'kanal',
  labs: 'nighthaven-labs',
  lair: 'lair',
  oregon: 'oregon',
  outback: 'outback',
  plane: 'plane',
  skyscraper: 'skyscraper',
  stadiumalpha: 'stadium-alpha',
  stadiumbravo: 'stadium-bravo',
  themepark: 'theme-park',
  tower: 'tower',
  villa: 'villa',
  yacht: 'yacht',
};

/** DB slug → SVG filename (reverse lookup) */
export const dbSlugToSvg: Record<string, string> = Object.fromEntries(
  Object.entries(svgToDbSlug).map(([svg, slug]) => [slug, svg]),
);

/** All SVG filenames that have maps available */
export const availableSvgMaps = Object.keys(svgToDbSlug);

/** Check if a DB slug has an SVG map available */
export function hasSvgMap(dbSlug: string): boolean {
  return dbSlug in dbSlugToSvg;
}

/** Get the URL path for a map's SVG file */
export function getSvgMapUrl(dbSlug: string): string | null {
  const svgName = dbSlugToSvg[dbSlug];
  if (!svgName) return null;
  return `/maps/svg/${svgName}.svg`;
}
