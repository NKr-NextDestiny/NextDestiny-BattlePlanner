/**
 * One-time import script: Processes map floor images from a source folder
 * and imports them into the database.
 *
 * Also imports gadget icons from the Gadgets subfolder.
 *
 * Usage:
 *   pnpm --filter @tactihub/server tsx src/scripts/import-maps.ts <source-folder>
 *
 * Example:
 *   pnpm --filter @tactihub/server tsx src/scripts/import-maps.ts "C:\Users\Niklas\Downloads\Sternab-20260211T183417Z-1-001\Sternab"
 */

import { config } from 'dotenv';
config({ path: '../../.env' });

import path from 'path';
import fs from 'fs/promises';
import sharp from 'sharp';
import { nanoid } from 'nanoid';
import { db } from '../db/connection.js';
import { maps, mapFloors, games, gadgets } from '../db/schema/index.js';
import { eq, and } from 'drizzle-orm';

const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';

// ────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────

interface FloorDef {
  name: string;
  floorNumber: number;
  image: string;           // filename relative to map folder
}

interface MapDef {
  slug: string;
  folder: string;          // subfolder name in source
  floors: FloorDef[];
}

interface GadgetIconDef {
  gadgetName: string;      // must match seed gadget name exactly
  file: string;            // filename in Gadgets folder
}

// ────────────────────────────────────────────────────────
// Map definitions
// ────────────────────────────────────────────────────────

const MAP_DEFS: MapDef[] = [
  {
    slug: 'bank',
    folder: 'Bank Rework',
    floors: [
      { name: 'Basement', floorNumber: 1, image: 'BankReworkBasementBlue.jpg' },
      { name: 'Ground Floor', floorNumber: 2, image: 'BankReworkGroundFloorBlue.jpg' },
      { name: 'Top Floor', floorNumber: 3, image: 'BankReworkTopFloorBlue.jpg' },
    ],
  },
  {
    slug: 'border',
    folder: 'Border',
    floors: [
      { name: 'Ground Floor', floorNumber: 1, image: 'BorderGroundFloor.jpg' },
      { name: 'Top Floor', floorNumber: 2, image: 'BorderTopFloor.jpg' },
    ],
  },
  {
    slug: 'coastline',
    folder: 'Coastline',
    floors: [
      { name: 'Ground Floor', floorNumber: 1, image: 'CoastlineGroundFloor.jpg' },
      { name: 'Top Floor', floorNumber: 2, image: 'CoastlineTopFloor.jpg' },
    ],
  },
  {
    slug: 'consulate',
    folder: 'Consulate Rework',
    floors: [
      { name: 'Basement', floorNumber: 1, image: 'ConsulateRWBasement.jpg' },
      { name: 'Ground Floor', floorNumber: 2, image: 'ConsulateRWGround.jpg' },
      { name: 'Top Floor', floorNumber: 3, image: 'ConsulateRWTopFloorB.jpg' },
    ],
  },
  {
    slug: 'chalet',
    folder: 'Chalet Rework',
    floors: [
      { name: 'Basement', floorNumber: 1, image: 'ChaletRWBasement.jpg' },
      { name: 'Ground Floor', floorNumber: 2, image: 'ChaletRWGroundFloor.jpg' },
      { name: 'Top Floor', floorNumber: 3, image: 'ChaletRWTopFloor.jpg' },
    ],
  },
  {
    slug: 'clubhouse',
    folder: 'Clubhouse',
    floors: [
      { name: 'Basement', floorNumber: 1, image: 'ClubhouseBasement.jpg' },
      { name: 'Ground Floor', floorNumber: 2, image: 'ClubhouseGroundFloor.jpg' },
      { name: 'Top Floor', floorNumber: 3, image: 'ClubhouseTopFloor.jpg' },
    ],
  },
  {
    slug: 'hereford',
    folder: 'Hereford',
    floors: [
      { name: 'Basement', floorNumber: 1, image: 'HerefordBasement.jpg' },
      { name: 'Ground Floor', floorNumber: 2, image: 'HerefordGroundFloor.jpg' },
      { name: 'First Floor', floorNumber: 3, image: 'HerefordFirstFloor.jpg' },
      { name: 'Top Floor', floorNumber: 4, image: 'HerefordTopFloor.jpg' },
    ],
  },
  {
    slug: 'kafe',
    folder: 'Kafe',
    floors: [
      { name: 'Ground Floor', floorNumber: 1, image: 'KafeGroundFloor.jpg' },
      { name: 'Middle Floor', floorNumber: 2, image: 'KafeMiddleFloor.jpg' },
      { name: 'Top Floor', floorNumber: 3, image: 'KafeTopFloor.jpg' },
    ],
  },
  {
    slug: 'oregon',
    folder: 'Oregon Rework',
    floors: [
      { name: 'Basement', floorNumber: 1, image: 'OregonRWbasement.jpg' },
      { name: 'Ground Floor', floorNumber: 2, image: 'OregonRWgroundfloor.jpg' },
      { name: 'Tier 3', floorNumber: 3, image: 'OregonRWT3.jpg' },
      { name: 'Top Floor', floorNumber: 4, image: 'OregonRWTopFloor.jpg' },
    ],
  },
  {
    slug: 'skyscraper',
    folder: 'Skyscraper Rework',
    floors: [
      { name: 'Ground Floor', floorNumber: 1, image: 'SkyscraperGroundFloor.jpg' },
      { name: 'Top Floor', floorNumber: 2, image: 'SkyscraperTopFloor.jpg' },
    ],
  },
  {
    slug: 'theme-park',
    folder: 'Themepark',
    floors: [
      { name: 'Ground Floor', floorNumber: 1, image: 'ThemeparkGroundFloor.jpg' },
      { name: 'Top Floor', floorNumber: 2, image: 'ThemeparkTopFloor.jpg' },
    ],
  },
  {
    slug: 'villa',
    folder: 'Villa',
    floors: [
      { name: 'Basement', floorNumber: 1, image: 'VillaBasement.jpg' },
      { name: 'Ground Floor', floorNumber: 2, image: 'VillaGroundFloor.jpg' },
      { name: 'Top Floor', floorNumber: 3, image: 'VillaTopFloor.jpg' },
    ],
  },
  {
    slug: 'favela',
    folder: 'Favela',
    floors: [
      { name: 'Basement', floorNumber: 1, image: 'FavelaBasement.jpg' },
      { name: 'First Floor', floorNumber: 2, image: 'FavelaFirstFloor.jpg' },
      { name: 'Second Floor', floorNumber: 3, image: 'FavelaSecondFloor.jpg' },
      { name: 'Top Floor', floorNumber: 4, image: 'FavelaTopFloor.jpg' },
    ],
  },
  {
    slug: 'fortress',
    folder: 'Fortress',
    floors: [
      { name: 'Ground Floor', floorNumber: 1, image: 'FortressGroundFloor.jpg' },
      { name: 'Top Floor', floorNumber: 2, image: 'FortressTopFloor.jpg' },
    ],
  },
  {
    slug: 'house',
    folder: 'House Rework',
    floors: [
      { name: 'Basement', floorNumber: 1, image: 'HouseRWBasement.jpg' },
      { name: 'Ground Floor', floorNumber: 2, image: 'HouseRWGroundFloor.jpg' },
      { name: 'Top Floor', floorNumber: 3, image: 'HouseRWTopFloor.jpg' },
    ],
  },
  {
    slug: 'kanal',
    folder: 'Kanal',
    floors: [
      { name: 'Lower Basement', floorNumber: 1, image: 'KanalLowerBottomFloor.jpg' },
      { name: 'Basement', floorNumber: 2, image: 'KanalBottomFloor.jpg' },
      { name: 'Ground Floor', floorNumber: 3, image: 'KanalGroundFloor.jpg' },
      { name: 'Middle Floor', floorNumber: 4, image: 'KanalM.jpg' },
      { name: 'Top Floor', floorNumber: 5, image: 'KanalTopFloor.jpg' },
    ],
  },
  {
    slug: 'nighthaven-labs',
    folder: 'Nighthaven Labs',
    floors: [
      { name: 'Basement', floorNumber: 1, image: 'NighthavenBasement.jpg' },
      { name: 'Ground Floor', floorNumber: 2, image: 'NighthavenGroundFloor.jpg' },
      { name: 'Top Floor', floorNumber: 3, image: 'NighthavenTopFloor.jpg' },
    ],
  },
  {
    slug: 'outback',
    folder: 'Outback Rework',
    floors: [
      { name: 'Ground Floor', floorNumber: 1, image: 'OutbackReworkGroundFloor.jpg' },
      { name: 'Top Floor', floorNumber: 2, image: 'OutbackReworkTopFloor.jpg' },
    ],
  },
  {
    slug: 'plane',
    folder: 'Plane',
    floors: [
      { name: 'Bottom Floor', floorNumber: 1, image: 'PlaneBottomFloor.jpg' },
      { name: 'Middle Floor', floorNumber: 2, image: 'PlaneMiddleFloor.jpg' },
      { name: 'Top Floor', floorNumber: 3, image: 'PlaneTopFloor.jpg' },
    ],
  },
  {
    slug: 'tower',
    folder: 'Tower',
    floors: [
      { name: 'Bottom Floor', floorNumber: 1, image: 'TowerBottomFloor.jpg' },
      { name: 'Top Floor', floorNumber: 2, image: 'TowerTopFloor.jpg' },
    ],
  },
  {
    slug: 'yacht',
    folder: 'Yacht',
    floors: [
      { name: 'Basement', floorNumber: 1, image: 'YachtBasement.jpg' },
      { name: 'First Floor', floorNumber: 2, image: 'YachtFirstFloor.jpg' },
      { name: 'Second Floor', floorNumber: 3, image: 'YachtSecondFloor.jpg' },
      { name: 'Top Floor', floorNumber: 4, image: 'YachtTopFloor.jpg' },
    ],
  },
];

// ────────────────────────────────────────────────────────
// Gadget icon mapping  (file → seed gadget name)
// ────────────────────────────────────────────────────────

const GADGET_ICON_DEFS: GadgetIconDef[] = [
  // Unique gadgets (named by operator)
  { gadgetName: 'Prisma', file: 'Alibi.png' },
  { gadgetName: 'Shock Wire', file: 'Bandit.png' },
  { gadgetName: 'Armor Panel', file: 'Castle.png' },
  { gadgetName: 'Yokai', file: 'Echo.png' },
  { gadgetName: 'Grzmot Mine', file: 'Ela.png' },
  { gadgetName: 'Welcome Mat', file: 'Frost.png' },
  { gadgetName: 'ADS', file: 'Jager.png' },
  { gadgetName: 'EDD', file: 'Kapkan.png' },
  { gadgetName: 'Gu Mine', file: 'Lesion.png' },
  { gadgetName: 'Evil Eye', file: 'Maestro.png' },
  { gadgetName: 'Black Mirror', file: 'Mira.png' },
  { gadgetName: 'Signal Disruptor', file: 'Mute.png' },
  { gadgetName: 'Black Eye', file: 'Valkyrie.png' },
  { gadgetName: 'Z8 Grenades', file: 'ToxicBabe.png' },
  // Secondary gadgets
  { gadgetName: 'Barbed Wire', file: 'Barb.png' },
  { gadgetName: 'Bulletproof Cam', file: 'BulletProofCam.png' },
  { gadgetName: 'Nitro Cell (C4)', file: 'NitroCell.png' },
  { gadgetName: 'Claymore', file: 'Claymore.png' },
  { gadgetName: 'Deployable Shield', file: 'Shield.png' },
  { gadgetName: 'Impact Grenade', file: 'ImpactGrenade.png' },
  { gadgetName: 'Smoke Grenade', file: 'Smoke.png' },
  // General
  { gadgetName: 'Barricade', file: 'Barricade.png' },
  { gadgetName: 'Drone', file: 'Drone.png' },
];

// ────────────────────────────────────────────────────────
// Helper: process a single image file → webp in uploads/
// ────────────────────────────────────────────────────────

async function processImage(
  srcPath: string,
  category: string,
  opts: { width?: number } = {},
): Promise<string> {
  const buffer = await fs.readFile(srcPath);
  const filename = `${nanoid()}.webp`;
  const dir = path.join(UPLOAD_DIR, category);
  await fs.mkdir(dir, { recursive: true });
  const outPath = path.join(dir, filename);

  let s = sharp(buffer);
  if (opts.width) s = s.resize(opts.width, undefined, { fit: 'inside' });
  await s.webp({ quality: 85 }).toFile(outPath);

  return `/${category}/${filename}`;
}

// ────────────────────────────────────────────────────────
// Main
// ────────────────────────────────────────────────────────

async function main() {
  const srcRoot = process.argv[2];
  if (!srcRoot) {
    console.error('Usage: tsx src/scripts/import-maps.ts <source-folder>');
    process.exit(1);
  }

  console.log(`Source folder: ${srcRoot}`);
  console.log(`Upload dir:    ${path.resolve(UPLOAD_DIR)}`);

  // Find R6 Siege game
  const [r6] = await db.select().from(games).where(eq(games.slug, 'r6'));
  if (!r6) {
    console.error('R6 Siege game not found in DB. Run seed first.');
    process.exit(1);
  }

  // ── Import map floors ────────────────────────────────
  let totalFloors = 0;

  for (const mapDef of MAP_DEFS) {
    const [map] = await db.select().from(maps)
      .where(and(eq(maps.gameId, r6.id), eq(maps.slug, mapDef.slug)));

    if (!map) {
      console.warn(`  ⚠ Map "${mapDef.slug}" not found in DB — skipping`);
      continue;
    }

    console.log(`\n📍 ${map.name} (${mapDef.folder})`);

    // Delete existing placeholder floors
    await db.delete(mapFloors).where(eq(mapFloors.mapId, map.id));

    for (const floor of mapDef.floors) {
      const imgSrc = path.join(srcRoot, mapDef.folder, floor.image);

      try {
        await fs.access(imgSrc);
      } catch {
        console.warn(`  ⚠ Image not found: ${floor.image} — skipping floor "${floor.name}"`);
        continue;
      }

      const imagePath = await processImage(imgSrc, 'maps', { width: 1200 });

      await db.insert(mapFloors).values({
        mapId: map.id,
        name: floor.name,
        floorNumber: floor.floorNumber,
        imagePath,
      });

      console.log(`  ✓ ${floor.name}`);
      totalFloors++;
    }
  }

  console.log(`\n✅ Imported ${totalFloors} floors across ${MAP_DEFS.length} maps`);

  // ── Import gadget icons ──────────────────────────────
  const gadgetFolder = path.join(srcRoot, 'Gadgets');
  let gadgetCount = 0;

  try {
    await fs.access(gadgetFolder);
  } catch {
    console.log('\n⚠ No Gadgets folder found — skipping gadget icons');
    process.exit(0);
  }

  console.log('\n🎯 Importing gadget icons...');

  for (const gDef of GADGET_ICON_DEFS) {
    const [gadget] = await db.select().from(gadgets)
      .where(and(eq(gadgets.gameId, r6.id), eq(gadgets.name, gDef.gadgetName)));

    if (!gadget) {
      console.warn(`  ⚠ Gadget "${gDef.gadgetName}" not found in DB — skipping`);
      continue;
    }

    const iconSrc = path.join(gadgetFolder, gDef.file);
    try {
      await fs.access(iconSrc);
    } catch {
      console.warn(`  ⚠ Icon file not found: ${gDef.file} — skipping`);
      continue;
    }

    const iconPath = await processImage(iconSrc, 'gadgets');
    await db.update(gadgets).set({ icon: iconPath, updatedAt: new Date() }).where(eq(gadgets.id, gadget.id));
    console.log(`  ✓ ${gDef.gadgetName} ← ${gDef.file}`);
    gadgetCount++;
  }

  console.log(`\n✅ Imported ${gadgetCount} gadget icons`);
  console.log('\nDone!');
  process.exit(0);
}

main().catch((err) => {
  console.error('Import error:', err);
  process.exit(1);
});
