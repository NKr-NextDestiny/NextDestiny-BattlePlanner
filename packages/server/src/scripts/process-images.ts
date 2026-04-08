/**
 * Standalone script: Converts source map images (JPG) and gadget icons (PNG) to WebP
 * with deterministic file names. No DB access needed.
 *
 * Usage:
 *   pnpm --filter @tactihub/server tsx src/scripts/process-images.ts "C:\path\to\Sternab"
 *
 * Output goes to packages/server/uploads/maps/ and packages/server/uploads/gadgets/
 */

import path from 'path';
import fs from 'fs/promises';
import sharp from 'sharp';

const UPLOAD_DIR = path.resolve('uploads');

// ── Types ───────────────────────────────────────────────

interface FloorDef {
  name: string;
  num: number;
  image: string;
}

interface MapDef {
  slug: string;
  folder: string;
  floors: FloorDef[];
}

interface GadgetIconDef {
  slug: string;
  file: string;
}

// ── Map definitions ─────────────────────────────────────

const MAP_DEFS: MapDef[] = [
  {
    slug: 'bank', folder: 'Bank Rework',
    floors: [
      { name: 'Basement', num: 1, image: 'BankReworkBasementBlue.jpg' },
      { name: 'Ground Floor', num: 2, image: 'BankReworkGroundFloorBlue.jpg' },
      { name: 'Top Floor', num: 3, image: 'BankReworkTopFloorBlue.jpg' },
    ],
  },
  {
    slug: 'border', folder: 'Border',
    floors: [
      { name: 'Ground Floor', num: 1, image: 'BorderGroundFloor.jpg' },
      { name: 'Top Floor', num: 2, image: 'BorderTopFloor.jpg' },
    ],
  },
  {
    slug: 'coastline', folder: 'Coastline',
    floors: [
      { name: 'Ground Floor', num: 1, image: 'CoastlineGroundFloor.jpg' },
      { name: 'Top Floor', num: 2, image: 'CoastlineTopFloor.jpg' },
    ],
  },
  {
    slug: 'consulate', folder: 'Consulate Rework',
    floors: [
      { name: 'Basement', num: 1, image: 'ConsulateRWBasement.jpg' },
      { name: 'Ground Floor', num: 2, image: 'ConsulateRWGround.jpg' },
      { name: 'Top Floor', num: 3, image: 'ConsulateRWTopFloorB.jpg' },
    ],
  },
  {
    slug: 'chalet', folder: 'Chalet Rework',
    floors: [
      { name: 'Basement', num: 1, image: 'ChaletRWBasement.jpg' },
      { name: 'Ground Floor', num: 2, image: 'ChaletRWGroundFloor.jpg' },
      { name: 'Top Floor', num: 3, image: 'ChaletRWTopFloor.jpg' },
    ],
  },
  {
    slug: 'clubhouse', folder: 'Clubhouse',
    floors: [
      { name: 'Basement', num: 1, image: 'ClubhouseBasement.jpg' },
      { name: 'Ground Floor', num: 2, image: 'ClubhouseGroundFloor.jpg' },
      { name: 'Top Floor', num: 3, image: 'ClubhouseTopFloor.jpg' },
    ],
  },
  {
    slug: 'hereford', folder: 'Hereford',
    floors: [
      { name: 'Basement', num: 1, image: 'HerefordBasement.jpg' },
      { name: 'Ground Floor', num: 2, image: 'HerefordGroundFloor.jpg' },
      { name: 'First Floor', num: 3, image: 'HerefordFirstFloor.jpg' },
      { name: 'Top Floor', num: 4, image: 'HerefordTopFloor.jpg' },
    ],
  },
  {
    slug: 'kafe', folder: 'Kafe',
    floors: [
      { name: 'Ground Floor', num: 1, image: 'KafeGroundFloor.jpg' },
      { name: 'Middle Floor', num: 2, image: 'KafeMiddleFloor.jpg' },
      { name: 'Top Floor', num: 3, image: 'KafeTopFloor.jpg' },
    ],
  },
  {
    slug: 'oregon', folder: 'Oregon Rework',
    floors: [
      { name: 'Basement', num: 1, image: 'OregonRWbasement.jpg' },
      { name: 'Ground Floor', num: 2, image: 'OregonRWgroundfloor.jpg' },
      { name: 'Tier 3', num: 3, image: 'OregonRWT3.jpg' },
      { name: 'Top Floor', num: 4, image: 'OregonRWTopFloor.jpg' },
    ],
  },
  {
    slug: 'skyscraper', folder: 'Skyscraper Rework',
    floors: [
      { name: 'Ground Floor', num: 1, image: 'SkyscraperGroundFloor.jpg' },
      { name: 'Top Floor', num: 2, image: 'SkyscraperTopFloor.jpg' },
    ],
  },
  {
    slug: 'theme-park', folder: 'Themepark',
    floors: [
      { name: 'Ground Floor', num: 1, image: 'ThemeparkGroundFloor.jpg' },
      { name: 'Top Floor', num: 2, image: 'ThemeparkTopFloor.jpg' },
    ],
  },
  {
    slug: 'villa', folder: 'Villa',
    floors: [
      { name: 'Basement', num: 1, image: 'VillaBasement.jpg' },
      { name: 'Ground Floor', num: 2, image: 'VillaGroundFloor.jpg' },
      { name: 'Top Floor', num: 3, image: 'VillaTopFloor.jpg' },
    ],
  },
  {
    slug: 'favela', folder: 'Favela',
    floors: [
      { name: 'Basement', num: 1, image: 'FavelaBasement.jpg' },
      { name: 'First Floor', num: 2, image: 'FavelaFirstFloor.jpg' },
      { name: 'Second Floor', num: 3, image: 'FavelaSecondFloor.jpg' },
      { name: 'Top Floor', num: 4, image: 'FavelaTopFloor.jpg' },
    ],
  },
  {
    slug: 'fortress', folder: 'Fortress',
    floors: [
      { name: 'Ground Floor', num: 1, image: 'FortressGroundFloor.jpg' },
      { name: 'Top Floor', num: 2, image: 'FortressTopFloor.jpg' },
    ],
  },
  {
    slug: 'house', folder: 'House Rework',
    floors: [
      { name: 'Basement', num: 1, image: 'HouseRWBasement.jpg' },
      { name: 'Ground Floor', num: 2, image: 'HouseRWGroundFloor.jpg' },
      { name: 'Top Floor', num: 3, image: 'HouseRWTopFloor.jpg' },
    ],
  },
  {
    slug: 'kanal', folder: 'Kanal',
    floors: [
      { name: 'Lower Basement', num: 1, image: 'KanalLowerBottomFloor.jpg' },
      { name: 'Basement', num: 2, image: 'KanalBottomFloor.jpg' },
      { name: 'Ground Floor', num: 3, image: 'KanalGroundFloor.jpg' },
      { name: 'Middle Floor', num: 4, image: 'KanalM.jpg' },
      { name: 'Top Floor', num: 5, image: 'KanalTopFloor.jpg' },
    ],
  },
  {
    slug: 'nighthaven-labs', folder: 'Nighthaven Labs',
    floors: [
      { name: 'Basement', num: 1, image: 'NighthavenBasement.jpg' },
      { name: 'Ground Floor', num: 2, image: 'NighthavenGroundFloor.jpg' },
      { name: 'Top Floor', num: 3, image: 'NighthavenTopFloor.jpg' },
    ],
  },
  {
    slug: 'outback', folder: 'Outback Rework',
    floors: [
      { name: 'Ground Floor', num: 1, image: 'OutbackReworkGroundFloor.jpg' },
      { name: 'Top Floor', num: 2, image: 'OutbackReworkTopFloor.jpg' },
    ],
  },
  {
    slug: 'plane', folder: 'Plane',
    floors: [
      { name: 'Bottom Floor', num: 1, image: 'PlaneBottomFloor.jpg' },
      { name: 'Middle Floor', num: 2, image: 'PlaneMiddleFloor.jpg' },
      { name: 'Top Floor', num: 3, image: 'PlaneTopFloor.jpg' },
    ],
  },
  {
    slug: 'tower', folder: 'Tower',
    floors: [
      { name: 'Bottom Floor', num: 1, image: 'TowerBottomFloor.jpg' },
      { name: 'Top Floor', num: 2, image: 'TowerTopFloor.jpg' },
    ],
  },
  {
    slug: 'yacht', folder: 'Yacht',
    floors: [
      { name: 'Basement', num: 1, image: 'YachtBasement.jpg' },
      { name: 'First Floor', num: 2, image: 'YachtFirstFloor.jpg' },
      { name: 'Second Floor', num: 3, image: 'YachtSecondFloor.jpg' },
      { name: 'Top Floor', num: 4, image: 'YachtTopFloor.jpg' },
    ],
  },
];

// ── Gadget icons ────────────────────────────────────────

const GADGET_ICONS: GadgetIconDef[] = [
  { slug: 'prisma', file: 'Alibi.png' },
  { slug: 'shock-wire', file: 'Bandit.png' },
  { slug: 'armor-panel', file: 'Castle.png' },
  { slug: 'yokai', file: 'Echo.png' },
  { slug: 'grzmot-mine', file: 'Ela.png' },
  { slug: 'welcome-mat', file: 'Frost.png' },
  { slug: 'ads', file: 'Jager.png' },
  { slug: 'edd', file: 'Kapkan.png' },
  { slug: 'gu-mine', file: 'Lesion.png' },
  { slug: 'evil-eye', file: 'Maestro.png' },
  { slug: 'black-mirror', file: 'Mira.png' },
  { slug: 'signal-disruptor', file: 'Mute.png' },
  { slug: 'black-eye', file: 'Valkyrie.png' },
  { slug: 'z8-grenades', file: 'ToxicBabe.png' },
  { slug: 'barbed-wire', file: 'Barb.png' },
  { slug: 'bulletproof-cam', file: 'BulletProofCam.png' },
  { slug: 'nitro-cell', file: 'NitroCell.png' },
  { slug: 'claymore', file: 'Claymore.png' },
  { slug: 'deployable-shield', file: 'Shield.png' },
  { slug: 'impact-grenade', file: 'ImpactGrenade.png' },
  { slug: 'smoke-grenade', file: 'Smoke.png' },
  { slug: 'barricade', file: 'Barricade.png' },
  { slug: 'drone', file: 'Drone.png' },
];

// ── Process single image ────────────────────────────────

async function processImage(src: string, dest: string, width?: number): Promise<boolean> {
  try {
    await fs.access(src);
  } catch {
    return false;
  }

  const buffer = await fs.readFile(src);
  let s = sharp(buffer);
  if (width) s = s.resize(width, undefined, { fit: 'inside' });
  await s.webp({ quality: 85 }).toFile(dest);
  return true;
}

// ── Main ────────────────────────────────────────────────

async function main() {
  const srcRoot = process.argv[2];
  if (!srcRoot) {
    console.error('Usage: tsx src/scripts/process-images.ts <source-folder>');
    process.exit(1);
  }

  const mapsDir = path.join(UPLOAD_DIR, 'maps');
  const gadgetsDir = path.join(UPLOAD_DIR, 'gadgets');
  await fs.mkdir(mapsDir, { recursive: true });
  await fs.mkdir(gadgetsDir, { recursive: true });

  console.log(`Source:  ${srcRoot}`);
  console.log(`Output:  ${path.resolve(UPLOAD_DIR)}`);

  // ── Process map floors ──────────────────────────────

  let floorCount = 0;
  let skipCount = 0;

  for (const map of MAP_DEFS) {
    console.log(`\n${map.slug} (${map.folder})`);

    for (const floor of map.floors) {
      // Deterministic names: {slug}-{num}-blueprint.webp
      const dest = path.join(mapsDir, `${map.slug}-${floor.num}-blueprint.webp`);
      const src = path.join(srcRoot, map.folder, floor.image);

      const ok = await processImage(src, dest, 1200);
      if (!ok) {
        console.warn(`  SKIP ${floor.name}: ${floor.image} not found`);
        skipCount++;
        continue;
      }

      console.log(`  ${floor.name}`);
      floorCount++;
    }
  }

  console.log(`\nFloors: ${floorCount} processed, ${skipCount} skipped`);

  // ── Process gadget icons ────────────────────────────

  const gadgetFolder = path.join(srcRoot, 'Gadgets');
  let gadgetCount = 0;

  try {
    await fs.access(gadgetFolder);
  } catch {
    console.log('\nNo Gadgets folder found — skipping');
    process.exit(0);
  }

  console.log('\nGadget icons:');
  for (const g of GADGET_ICONS) {
    const src = path.join(gadgetFolder, g.file);
    const dest = path.join(gadgetsDir, `${g.slug}.webp`);

    if (await processImage(src, dest)) {
      console.log(`  ${g.slug} <- ${g.file}`);
      gadgetCount++;
    } else {
      console.warn(`  SKIP ${g.slug}: ${g.file} not found`);
    }
  }

  console.log(`\nGadgets: ${gadgetCount} processed`);
  console.log('\nDone!');
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
