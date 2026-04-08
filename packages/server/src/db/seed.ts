import { config } from 'dotenv';
config({ path: '../../.env' });
import { db, client } from './connection.js';
import { users, settings, games, maps, mapFloors, operators, gadgets, operatorGadgets } from './schema/index.js';
import { eq } from 'drizzle-orm';

async function seed() {
  console.log('Seeding database...');

  // 1. Create admin user via Discord ID from env
  const adminDiscordId = process.env.DISCORD_ADMIN_ID || 'CHANGE_ME';
  const [admin] = await db.insert(users).values({
    username: 'Admin',
    discordId: adminDiscordId,
    discordUsername: 'Admin',
    discordRoles: [],
    role: 'admin',
  }).onConflictDoNothing().returning();
  console.log('Admin user created:', admin?.discordId || 'already exists');

  // 2. Initialize settings
  await db.insert(settings).values({ key: 'admin_discord_role_ids', value: '[]' }).onConflictDoNothing();
  await db.insert(settings).values({ key: 'admin_discord_user_ids', value: JSON.stringify([adminDiscordId]) }).onConflictDoNothing();
  console.log('Settings initialized');

  // 3. Seed Rainbow Six Siege
  const [r6Game] = await db.insert(games).values({
    name: 'Rainbow Six Siege',
    slug: 'r6',
    description: 'Tom Clancy\'s Rainbow Six Siege - Tactical FPS',
    icon: '/games/r6-logo.webp',
    isActive: true,
  }).onConflictDoNothing().returning();

  if (r6Game) {
    console.log('Seeding R6 Siege...');

    // R6 Maps — each with correct floor layout
    // svgFloor: must match <g id="Floor {n}"> in the SVG file
    // img: 1-based WebP image number (omitted if no WebP exists for this floor)
    type FloorDef = { name: string; svgFloor: number; img?: number };
    const r6Maps: Array<{ name: string; slug: string; isCompetitive: boolean; floors: FloorDef[] }> = [
      // Competitive — SVG floors verified against /public/maps/svg/*.svg
      { name: 'Bank', slug: 'bank', isCompetitive: true, floors: [{ name: 'Basement', svgFloor: 0, img: 1 }, { name: '1F', svgFloor: 1, img: 2 }, { name: '2F', svgFloor: 2, img: 3 }, { name: 'Roof', svgFloor: 3 }] },
      { name: 'Border', slug: 'border', isCompetitive: true, floors: [{ name: '1F', svgFloor: 1, img: 1 }, { name: '2F', svgFloor: 2, img: 2 }, { name: 'Roof', svgFloor: 3 }] },
      { name: 'Coastline', slug: 'coastline', isCompetitive: true, floors: [{ name: '1F', svgFloor: 1, img: 1 }, { name: '2F', svgFloor: 2, img: 2 }, { name: 'Roof', svgFloor: 3 }] },
      { name: 'Consulate', slug: 'consulate', isCompetitive: true, floors: [{ name: 'Basement', svgFloor: 0, img: 1 }, { name: '1F', svgFloor: 1, img: 2 }, { name: '2F', svgFloor: 2, img: 3 }, { name: 'Roof', svgFloor: 3 }] },
      { name: 'Chalet', slug: 'chalet', isCompetitive: true, floors: [{ name: 'Basement', svgFloor: 0, img: 1 }, { name: '1F', svgFloor: 1, img: 2 }, { name: '2F', svgFloor: 2, img: 3 }, { name: 'Roof', svgFloor: 3 }] },
      { name: 'Clubhouse', slug: 'clubhouse', isCompetitive: true, floors: [{ name: 'Basement', svgFloor: 0, img: 1 }, { name: '1F', svgFloor: 1, img: 2 }, { name: '2F', svgFloor: 2, img: 3 }, { name: 'Roof', svgFloor: 3 }] },
      { name: 'Hereford', slug: 'hereford', isCompetitive: true, floors: [{ name: 'Basement', svgFloor: 0, img: 1 }, { name: '1F', svgFloor: 1, img: 2 }, { name: '2F', svgFloor: 2, img: 3 }, { name: '3F', svgFloor: 3, img: 4 }, { name: 'Roof', svgFloor: 4 }] },
      { name: 'Kafe', slug: 'kafe', isCompetitive: true, floors: [{ name: '1F', svgFloor: 1, img: 1 }, { name: '2F', svgFloor: 2, img: 2 }, { name: '3F', svgFloor: 3, img: 3 }, { name: 'Roof', svgFloor: 4 }] },
      { name: 'Oregon', slug: 'oregon', isCompetitive: true, floors: [{ name: 'Basement', svgFloor: 0, img: 1 }, { name: '1F', svgFloor: 1, img: 2 }, { name: '2F', svgFloor: 2, img: 3 }, { name: '3F', svgFloor: 3, img: 4 }, { name: 'Roof', svgFloor: 4 }] },
      { name: 'Skyscraper', slug: 'skyscraper', isCompetitive: true, floors: [{ name: '1F', svgFloor: 1, img: 1 }, { name: '2F', svgFloor: 2, img: 2 }, { name: 'Roof', svgFloor: 3 }] },
      { name: 'Theme Park', slug: 'theme-park', isCompetitive: true, floors: [{ name: '1F', svgFloor: 1, img: 1 }, { name: '2F', svgFloor: 2, img: 2 }, { name: 'Roof', svgFloor: 3 }] },
      { name: 'Villa', slug: 'villa', isCompetitive: true, floors: [{ name: 'Basement', svgFloor: 0, img: 1 }, { name: '1F', svgFloor: 1, img: 2 }, { name: '2F', svgFloor: 2, img: 3 }, { name: 'Roof', svgFloor: 3 }] },
      // Non-competitive
      { name: 'Favela', slug: 'favela', isCompetitive: false, floors: [{ name: 'Basement', svgFloor: 0, img: 1 }, { name: '1F', svgFloor: 1, img: 2 }, { name: '2F', svgFloor: 2, img: 3 }, { name: '3F', svgFloor: 3, img: 4 }, { name: 'Roof', svgFloor: 4 }] },
      { name: 'Fortress', slug: 'fortress', isCompetitive: false, floors: [{ name: '1F', svgFloor: 1, img: 1 }, { name: '2F', svgFloor: 2, img: 2 }, { name: '3F', svgFloor: 3 }, { name: '4F', svgFloor: 4 }, { name: 'Roof', svgFloor: 5 }] },
      { name: 'House', slug: 'house', isCompetitive: false, floors: [{ name: 'Basement', svgFloor: 0, img: 1 }, { name: '1F', svgFloor: 1, img: 2 }, { name: '2F', svgFloor: 2, img: 3 }, { name: 'Roof', svgFloor: 3 }] },
      { name: 'Kanal', slug: 'kanal', isCompetitive: false, floors: [{ name: 'Basement', svgFloor: 0, img: 2 }, { name: '1F', svgFloor: 1, img: 3 }, { name: '2F', svgFloor: 2, img: 4 }, { name: 'Roof', svgFloor: 3 }] },
      { name: 'Nighthaven Labs', slug: 'nighthaven-labs', isCompetitive: false, floors: [{ name: 'Basement', svgFloor: 0, img: 1 }, { name: '1F', svgFloor: 1, img: 2 }, { name: '2F', svgFloor: 2, img: 3 }, { name: 'Roof', svgFloor: 3 }] },
      { name: 'Outback', slug: 'outback', isCompetitive: false, floors: [{ name: '1F', svgFloor: 1, img: 1 }, { name: '2F', svgFloor: 2, img: 2 }, { name: 'Roof', svgFloor: 3 }] },
      { name: 'Plane', slug: 'plane', isCompetitive: false, floors: [{ name: '1F', svgFloor: 1, img: 1 }, { name: '2F', svgFloor: 2, img: 2 }, { name: '3F', svgFloor: 3, img: 3 }, { name: 'Roof', svgFloor: 4 }] },
      { name: 'Tower', slug: 'tower', isCompetitive: false, floors: [{ name: '1F', svgFloor: 1, img: 1 }, { name: '2F', svgFloor: 2, img: 2 }, { name: '3F', svgFloor: 3 }, { name: '4F', svgFloor: 4 }, { name: 'Roof', svgFloor: 5 }] },
      { name: 'Yacht', slug: 'yacht', isCompetitive: false, floors: [{ name: '1F', svgFloor: 1, img: 1 }, { name: '2F', svgFloor: 2, img: 2 }, { name: '3F', svgFloor: 3, img: 3 }, { name: '4F', svgFloor: 4, img: 4 }, { name: 'Roof', svgFloor: 5 }] },
      // SVG-only maps (no WebP images)
      { name: 'Bartlett University', slug: 'bartlett', isCompetitive: false, floors: [{ name: '1F', svgFloor: 1 }, { name: '2F', svgFloor: 2 }, { name: '3F', svgFloor: 3 }] },
      { name: 'Close Quarters', slug: 'close-quarters', isCompetitive: false, floors: [{ name: '1F', svgFloor: 1 }, { name: '2F', svgFloor: 2 }] },
      { name: 'Emerald Plains', slug: 'emerald-plains', isCompetitive: true, floors: [{ name: '1F', svgFloor: 1 }, { name: '2F', svgFloor: 2 }, { name: '3F', svgFloor: 3 }] },
      { name: 'Lair', slug: 'lair', isCompetitive: true, floors: [{ name: 'Basement', svgFloor: 0 }, { name: '1F', svgFloor: 1 }, { name: '2F', svgFloor: 2 }, { name: '3F', svgFloor: 3 }] },
      { name: 'Stadium Alpha', slug: 'stadium-alpha', isCompetitive: false, floors: [{ name: 'Basement', svgFloor: 0 }, { name: '1F', svgFloor: 1 }, { name: '2F', svgFloor: 2 }, { name: '3F', svgFloor: 3 }] },
      { name: 'Stadium Bravo', slug: 'stadium-bravo', isCompetitive: false, floors: [{ name: 'Basement', svgFloor: 0 }, { name: '1F', svgFloor: 1 }, { name: '2F', svgFloor: 2 }, { name: '3F', svgFloor: 3 }] },
    ];

    for (const map of r6Maps) {
      const [m] = await db.insert(maps).values({
        gameId: r6Game.id,
        name: map.name,
        slug: map.slug,
        isCompetitive: map.isCompetitive,
        thumbnail: `/maps/${map.slug}-cover.webp`,
      }).returning();

      for (const f of map.floors) {
        await db.insert(mapFloors).values({
          mapId: m.id,
          name: f.name,
          floorNumber: f.svgFloor, // must match SVG <g id="Floor {n}">
          imagePath: f.img ? `/maps/${map.slug}-${f.img}-blueprint.webp` : null,
        });
      }
    }
    console.log(`Created ${r6Maps.length} R6 maps`);

    // R6 Operators
    const r6Operators = [
      // Defenders
      { name: 'Clash', color: '#718190', isAttacker: false },
      { name: 'Maestro', color: '#666E24', isAttacker: false },
      { name: 'Alibi', color: '#666E24', isAttacker: false },
      { name: 'Vigil', color: '#FFFFFF', isAttacker: false },
      { name: 'Ela', color: '#539D9B', isAttacker: false },
      { name: 'Lesion', color: '#A94825', isAttacker: false },
      { name: 'Mira', color: '#521A7F', isAttacker: false },
      { name: 'Echo', color: '#984153', isAttacker: false },
      { name: 'Caveira', color: '#478B40', isAttacker: false },
      { name: 'Valkyrie', color: '#C39100', isAttacker: false },
      { name: 'Frost', color: '#00789D', isAttacker: false },
      { name: 'Mute', color: '#906E79', isAttacker: false },
      { name: 'Smoke', color: '#906E79', isAttacker: false },
      { name: 'Castle', color: '#D65B2B', isAttacker: false },
      { name: 'Pulse', color: '#D65B2B', isAttacker: false },
      { name: 'Doc', color: '#3A6082', isAttacker: false },
      { name: 'Rook', color: '#3A6082', isAttacker: false },
      { name: 'Jager', color: '#F8C334', isAttacker: false },
      { name: 'Bandit', color: '#F8C334', isAttacker: false },
      { name: 'Tachanka', color: '#AB1513', isAttacker: false },
      { name: 'Kapkan', color: '#AB1513', isAttacker: false },
      // Attackers
      { name: 'Maverick', color: '#718190', isAttacker: true },
      { name: 'Lion', color: '#FCAE1D', isAttacker: true },
      { name: 'Finka', color: '#FCAE1D', isAttacker: true },
      { name: 'Dokkaebi', color: '#FFFFFF', isAttacker: true },
      { name: 'Zofia', color: '#539D9B', isAttacker: true },
      { name: 'Ying', color: '#A94825', isAttacker: true },
      { name: 'Jackal', color: '#521A7F', isAttacker: true },
      { name: 'Hibana', color: '#984153', isAttacker: true },
      { name: 'Capitao', color: '#478B40', isAttacker: true },
      { name: 'Blackbeard', color: '#C39100', isAttacker: true },
      { name: 'Buck', color: '#00789D', isAttacker: true },
      { name: 'Sledge', color: '#906E79', isAttacker: true },
      { name: 'Thatcher', color: '#906E79', isAttacker: true },
      { name: 'Ash', color: '#D65B2B', isAttacker: true },
      { name: 'Thermite', color: '#D65B2B', isAttacker: true },
      { name: 'Montagne', color: '#3A6082', isAttacker: true },
      { name: 'Twitch', color: '#3A6082', isAttacker: true },
      { name: 'Blitz', color: '#F8C334', isAttacker: true },
      { name: 'IQ', color: '#F8C334', isAttacker: true },
      { name: 'Fuze', color: '#AB1513', isAttacker: true },
      { name: 'Glaz', color: '#AB1513', isAttacker: true },
      // Year 3 S4
      { name: 'Nomad', color: '#A57545', isAttacker: true },
      // Year 4
      { name: 'Gridlock', color: '#C25B09', isAttacker: true },
      { name: 'Nokk', color: '#465E73', isAttacker: true },
      { name: 'Amaru', color: '#6B3FA0', isAttacker: true },
      { name: 'Kali', color: '#1B5583', isAttacker: true },
      // Year 5
      { name: 'Iana', color: '#8C4FC6', isAttacker: true },
      { name: 'Ace', color: '#2E8B57', isAttacker: true },
      { name: 'Zero', color: '#4B6043', isAttacker: true },
      // Year 6
      { name: 'Flores', color: '#D4A017', isAttacker: true },
      { name: 'Osa', color: '#2080C0', isAttacker: true },
      // Year 7
      { name: 'Sens', color: '#7B2D8E', isAttacker: true },
      { name: 'Grim', color: '#3C5A14', isAttacker: true },
      // Year 8
      { name: 'Brava', color: '#C7A02A', isAttacker: true },
      { name: 'Ram', color: '#8B4513', isAttacker: true },
      // Year 9
      { name: 'Deimos', color: '#8B0000', isAttacker: true },
      { name: 'Striker', color: '#607B8B', isAttacker: true },
      // Year 10
      { name: 'Rauora', color: '#C06030', isAttacker: true },
      // Year 3 S4 Defenders
      { name: 'Kaid', color: '#A0522D', isAttacker: false },
      // Year 4
      { name: 'Mozzie', color: '#C25B09', isAttacker: false },
      { name: 'Warden', color: '#2F4F4F', isAttacker: false },
      { name: 'Goyo', color: '#6B3FA0', isAttacker: false },
      { name: 'Wamai', color: '#1B5583', isAttacker: false },
      // Year 5
      { name: 'Oryx', color: '#B8860B', isAttacker: false },
      { name: 'Melusi', color: '#2E8B57', isAttacker: false },
      { name: 'Aruni', color: '#C06030', isAttacker: false },
      // Year 6
      { name: 'Thunderbird', color: '#4B6043', isAttacker: false },
      { name: 'Thorn', color: '#2D5F2D', isAttacker: false },
      // Year 7
      { name: 'Azami', color: '#1C3A5F', isAttacker: false },
      { name: 'Solis', color: '#7B2D8E', isAttacker: false },
      // Year 8
      { name: 'Fenrir', color: '#465E73', isAttacker: false },
      { name: 'Tubarao', color: '#1A6B8A', isAttacker: false },
      // Year 9
      { name: 'Sentry', color: '#607B8B', isAttacker: false },
      { name: 'Skopos', color: '#8B4513', isAttacker: false },
      // Year 10
      { name: 'Denari', color: '#C7A02A', isAttacker: false },
    ];

    for (const op of r6Operators) {
      const iconName = op.name.toLowerCase()
        .replace(/ä/g, 'a').replace(/ö/g, 'o').replace(/ü/g, 'u')
        .replace(/[^a-z0-9]/g, '');
      await db.insert(operators).values({
        gameId: r6Game.id,
        name: op.name,
        color: op.color,
        isAttacker: op.isAttacker,
        icon: `/operators/${iconName}.webp`,
      });
    }
    console.log(`Created ${r6Operators.length} R6 operators`);

    // R6 Gadgets (icon paths reference pre-seeded images in uploads/gadgets/)
    const r6Gadgets: Array<{ name: string; category: 'unique' | 'secondary' | 'general'; icon?: string }> = [
      // Unique gadgets (icons matched from Sternab/Gadgets)
      { name: 'CCE Shield', category: 'unique' },
      { name: 'Evil Eye', category: 'unique', icon: '/gadgets/evil-eye.webp' },
      { name: 'Prisma', category: 'unique', icon: '/gadgets/prisma.webp' },
      { name: 'EE-ONE-D', category: 'unique' },
      { name: 'Adrenal Surge', category: 'unique' },
      { name: 'ERC-7', category: 'unique' },
      { name: 'Logic Bomb', category: 'unique' },
      { name: 'KS79 Lifeline', category: 'unique' },
      { name: 'Grzmot Mine', category: 'unique', icon: '/gadgets/grzmot-mine.webp' },
      { name: 'Candela', category: 'unique' },
      { name: 'Gu Mine', category: 'unique', icon: '/gadgets/gu-mine.webp' },
      { name: 'Black Mirror', category: 'unique', icon: '/gadgets/black-mirror.webp' },
      { name: 'Eyenox', category: 'unique' },
      { name: 'X-Kairos', category: 'unique' },
      { name: 'Yokai', category: 'unique', icon: '/gadgets/yokai.webp' },
      { name: 'Silent Step', category: 'unique' },
      { name: 'Micro Crossbow', category: 'unique' },
      { name: 'TAPS Mk III', category: 'unique' },
      { name: 'Skeleton Key', category: 'unique' },
      { name: 'Welcome Mat', category: 'unique', icon: '/gadgets/welcome-mat.webp' },
      { name: 'Signal Disruptor', category: 'unique', icon: '/gadgets/signal-disruptor.webp' },
      { name: 'The Caber', category: 'unique' },
      { name: 'Z8 Grenades', category: 'unique', icon: '/gadgets/z8-grenades.webp' },
      { name: 'EMP Grenade', category: 'unique' },
      { name: 'Breaching Round', category: 'unique' },
      { name: 'Armor Panel', category: 'unique', icon: '/gadgets/armor-panel.webp' },
      { name: 'Heartbeat Sensor', category: 'unique' },
      { name: 'Exothermic Charge', category: 'unique' },
      { name: 'Extendable Shield', category: 'unique' },
      { name: 'Shock Drone', category: 'unique' },
      { name: 'Stim Pistol', category: 'unique' },
      { name: 'Armor Pack', category: 'unique' },
      { name: 'ADS', category: 'unique', icon: '/gadgets/ads.webp' },
      { name: 'Shock Wire', category: 'unique', icon: '/gadgets/shock-wire.webp' },
      { name: 'Flash Shield', category: 'unique' },
      { name: 'Electronics Detector', category: 'unique' },
      { name: 'Cluster Charge', category: 'unique' },
      { name: 'Flip Sight', category: 'unique' },
      { name: 'Mounted LMG', category: 'unique' },
      { name: 'EDD', category: 'unique', icon: '/gadgets/edd.webp' },
      { name: 'Smelting Torch', category: 'unique' },
      { name: 'Black Eye', category: 'unique', icon: '/gadgets/black-eye.webp' },
      // Year 3 S4+ unique gadgets (new operators)
      { name: 'Airjab Launcher', category: 'unique' },
      { name: 'Rtila Electroclaw', category: 'unique' },
      { name: 'Trax Stingers', category: 'unique' },
      { name: 'Pest Launcher', category: 'unique' },
      { name: 'HEL Presence Reduction', category: 'unique' },
      { name: 'Glance Smart Glasses', category: 'unique' },
      { name: 'Garra Hook', category: 'unique' },
      { name: 'Volcan Shield', category: 'unique' },
      { name: 'LV Explosive Lance', category: 'unique' },
      { name: 'Mag-NET System', category: 'unique' },
      { name: 'Gemini Replicator', category: 'unique' },
      { name: 'Remah Dash', category: 'unique' },
      { name: 'S.E.L.M.A. Aqua Breacher', category: 'unique' },
      { name: 'Banshee Sonic Defence', category: 'unique' },
      { name: 'ARGUS Launcher', category: 'unique' },
      { name: 'Surya Laser Gate', category: 'unique' },
      { name: 'RCE-Ratero Charge', category: 'unique' },
      { name: 'Kona Station', category: 'unique' },
      { name: 'Talon-8 Clear Shield', category: 'unique' },
      { name: 'Razorbloom Shell', category: 'unique' },
      { name: 'R.O.U. Projector System', category: 'unique' },
      { name: 'Kiba Barrier', category: 'unique' },
      { name: 'Kawan Hive Launcher', category: 'unique' },
      { name: 'SPEC-IO Electro-Sensor', category: 'unique' },
      { name: 'Kludge Drone', category: 'unique' },
      { name: 'F-NATT Dread Mine', category: 'unique' },
      { name: 'BU-GI Auto-Breacher', category: 'unique' },
      { name: 'Zoto Canister', category: 'unique' },
      { name: 'DeathMARK', category: 'unique' },
      { name: 'V10 Pantheon Shell', category: 'unique' },
      { name: 'D.O.M. Panel Launcher', category: 'unique' },
      { name: 'T.R.I.P. Connector', category: 'unique' },
      // Secondary gadgets
      { name: 'Barbed Wire', category: 'secondary', icon: '/gadgets/barbed-wire.webp' },
      { name: 'Breaching Charge', category: 'secondary' },
      { name: 'Bulletproof Cam', category: 'secondary', icon: '/gadgets/bulletproof-cam.webp' },
      { name: 'Nitro Cell (C4)', category: 'secondary', icon: '/gadgets/nitro-cell.webp' },
      { name: 'Claymore', category: 'secondary', icon: '/gadgets/claymore.webp' },
      { name: 'Deployable Shield', category: 'secondary', icon: '/gadgets/deployable-shield.webp' },
      { name: 'Frag Grenade', category: 'secondary' },
      { name: 'Impact Grenade', category: 'secondary', icon: '/gadgets/impact-grenade.webp' },
      { name: 'Smoke Grenade', category: 'secondary', icon: '/gadgets/smoke-grenade.webp' },
      { name: 'Stun Grenade', category: 'secondary' },
      { name: 'Hard Breach Charge', category: 'secondary' },
      { name: 'Impact EMP Grenade', category: 'secondary' },
      { name: 'Proximity Alarm', category: 'secondary' },
      { name: 'Observation Blocker', category: 'secondary' },
      // General
      { name: 'Barricade', category: 'general', icon: '/gadgets/barricade.webp' },
      { name: 'Drone', category: 'general', icon: '/gadgets/drone.webp' },
      { name: 'Objective', category: 'general' },
      { name: 'Rappel', category: 'general' },
      { name: 'Reinforcement', category: 'general' },
    ];

    for (const g of r6Gadgets) {
      await db.insert(gadgets).values({
        gameId: r6Game.id,
        name: g.name,
        category: g.category,
        icon: g.icon ?? null,
      });
    }
    console.log(`Created ${r6Gadgets.length} R6 gadgets`);

    // Build name→id lookups for operator-gadget linking
    const allOps = await db.select().from(operators).where(eq(operators.gameId, r6Game.id));
    const allGadgets = await db.select().from(gadgets).where(eq(gadgets.gameId, r6Game.id));
    const opByName: Record<string, string> = {};
    for (const o of allOps) opByName[o.name] = o.id;
    const gadgetByName: Record<string, string> = {};
    for (const g of allGadgets) gadgetByName[g.name] = g.id;

    // Operator → [unique gadget, ...secondary gadgets] (Y10S4 loadouts)
    const opGadgetMap: Record<string, string[]> = {
      // ── Defenders ──
      'Smoke':       ['Z8 Grenades', 'Barbed Wire', 'Deployable Shield'],
      'Mute':        ['Signal Disruptor', 'Nitro Cell (C4)', 'Bulletproof Cam'],
      'Castle':      ['Armor Panel', 'Bulletproof Cam', 'Proximity Alarm'],
      'Pulse':       ['Heartbeat Sensor', 'Nitro Cell (C4)', 'Deployable Shield', 'Observation Blocker'],
      'Doc':         ['Stim Pistol', 'Barbed Wire', 'Bulletproof Cam'],
      'Rook':        ['Armor Pack', 'Proximity Alarm', 'Observation Blocker'],
      'Jager':       ['ADS', 'Bulletproof Cam', 'Observation Blocker'],
      'Bandit':      ['Shock Wire', 'Barbed Wire', 'Nitro Cell (C4)'],
      'Tachanka':    ['Mounted LMG', 'Barbed Wire', 'Deployable Shield', 'Proximity Alarm'],
      'Kapkan':      ['EDD', 'Barbed Wire', 'Nitro Cell (C4)', 'Impact Grenade'],
      'Frost':       ['Welcome Mat', 'Deployable Shield', 'Bulletproof Cam'],
      'Valkyrie':    ['Black Eye', 'Nitro Cell (C4)', 'Impact Grenade'],
      'Caveira':     ['Silent Step', 'Impact Grenade', 'Proximity Alarm', 'Observation Blocker'],
      'Echo':        ['Yokai', 'Deployable Shield', 'Impact Grenade'],
      'Mira':        ['Black Mirror', 'Nitro Cell (C4)', 'Proximity Alarm'],
      'Lesion':      ['Gu Mine', 'Bulletproof Cam', 'Observation Blocker'],
      'Ela':         ['Grzmot Mine', 'Barbed Wire', 'Deployable Shield', 'Observation Blocker'],
      'Vigil':       ['ERC-7', 'Impact Grenade', 'Bulletproof Cam'],
      'Maestro':     ['Evil Eye', 'Barbed Wire', 'Impact Grenade', 'Observation Blocker'],
      'Alibi':       ['Prisma', 'Proximity Alarm', 'Observation Blocker'],
      'Clash':       ['CCE Shield', 'Barbed Wire', 'Deployable Shield', 'Impact Grenade'],
      'Kaid':        ['Rtila Electroclaw', 'Barbed Wire', 'Nitro Cell (C4)', 'Observation Blocker'],
      'Mozzie':      ['Pest Launcher', 'Barbed Wire', 'Nitro Cell (C4)'],
      'Warden':      ['Glance Smart Glasses', 'Nitro Cell (C4)', 'Deployable Shield', 'Observation Blocker'],
      'Goyo':        ['Volcan Shield', 'Proximity Alarm', 'Impact Grenade'],
      'Wamai':       ['Mag-NET System', 'Proximity Alarm', 'Impact Grenade'],
      'Oryx':        ['Remah Dash', 'Barbed Wire', 'Proximity Alarm'],
      'Melusi':      ['Banshee Sonic Defence', 'Impact Grenade', 'Bulletproof Cam'],
      'Aruni':       ['Surya Laser Gate', 'Barbed Wire', 'Bulletproof Cam'],
      'Thunderbird': ['Kona Station', 'Barbed Wire', 'Deployable Shield'],
      'Thorn':       ['Razorbloom Shell', 'Barbed Wire', 'Deployable Shield', 'Proximity Alarm'],
      'Azami':       ['Kiba Barrier', 'Barbed Wire', 'Impact Grenade'],
      'Solis':       ['SPEC-IO Electro-Sensor', 'Proximity Alarm', 'Impact Grenade'],
      'Fenrir':      ['F-NATT Dread Mine', 'Bulletproof Cam', 'Observation Blocker'],
      'Tubarao':     ['Zoto Canister', 'Nitro Cell (C4)', 'Proximity Alarm'],
      'Sentry':      ['V10 Pantheon Shell', 'Barbed Wire', 'Deployable Shield'],
      'Skopos':      ['T.R.I.P. Connector', 'Proximity Alarm', 'Impact Grenade'],
      'Denari':      ['D.O.M. Panel Launcher', 'Deployable Shield', 'Observation Blocker'],
      // ── Attackers ──
      'Sledge':      ['The Caber', 'Stun Grenade', 'Impact EMP Grenade'],
      'Thatcher':    ['EMP Grenade', 'Breaching Charge', 'Claymore'],
      'Ash':         ['Breaching Round', 'Breaching Charge', 'Claymore'],
      'Thermite':    ['Exothermic Charge', 'Breaching Charge', 'Stun Grenade'],
      'Montagne':    ['Extendable Shield', 'Hard Breach Charge', 'Impact EMP Grenade'],
      'Twitch':      ['Shock Drone', 'Breaching Charge', 'Claymore'],
      'Blitz':       ['Flash Shield', 'Breaching Charge', 'Stun Grenade'],
      'IQ':          ['Electronics Detector', 'Breaching Charge', 'Claymore', 'Frag Grenade'],
      'Fuze':        ['Cluster Charge', 'Breaching Charge', 'Hard Breach Charge'],
      'Glaz':        ['Flip Sight', 'Claymore', 'Frag Grenade'],
      'Buck':        ['Skeleton Key', 'Hard Breach Charge', 'Stun Grenade'],
      'Blackbeard':  ['TAPS Mk III', 'Breaching Charge', 'Claymore', 'Stun Grenade', 'Frag Grenade'],
      'Capitao':     ['Micro Crossbow', 'Hard Breach Charge', 'Impact EMP Grenade'],
      'Hibana':      ['X-Kairos', 'Breaching Charge', 'Claymore', 'Stun Grenade'],
      'Jackal':      ['Eyenox', 'Claymore', 'Smoke Grenade'],
      'Ying':        ['Candela', 'Breaching Charge', 'Hard Breach Charge'],
      'Zofia':       ['KS79 Lifeline', 'Breaching Charge', 'Claymore'],
      'Dokkaebi':    ['Logic Bomb', 'Stun Grenade', 'Impact EMP Grenade'],
      'Lion':        ['EE-ONE-D', 'Claymore', 'Frag Grenade', 'Stun Grenade'],
      'Finka':       ['Adrenal Surge', 'Hard Breach Charge', 'Stun Grenade', 'Frag Grenade'],
      'Maverick':    ['Smelting Torch', 'Frag Grenade', 'Smoke Grenade'],
      'Nomad':       ['Airjab Launcher', 'Breaching Charge', 'Stun Grenade'],
      'Gridlock':    ['Trax Stingers', 'Breaching Charge', 'Impact EMP Grenade', 'Frag Grenade'],
      'Nokk':        ['HEL Presence Reduction', 'Hard Breach Charge', 'Impact EMP Grenade'],
      'Amaru':       ['Garra Hook', 'Hard Breach Charge', 'Stun Grenade'],
      'Kali':        ['LV Explosive Lance', 'Claymore', 'Breaching Charge', 'Smoke Grenade'],
      'Iana':        ['Gemini Replicator', 'Smoke Grenade', 'Impact EMP Grenade'],
      'Ace':         ['S.E.L.M.A. Aqua Breacher', 'Stun Grenade', 'Breaching Charge'],
      'Zero':        ['ARGUS Launcher', 'Hard Breach Charge', 'Claymore'],
      'Flores':      ['RCE-Ratero Charge', 'Claymore', 'Stun Grenade', 'Frag Grenade'],
      'Osa':         ['Talon-8 Clear Shield', 'Hard Breach Charge', 'Impact EMP Grenade', 'Frag Grenade'],
      'Sens':        ['R.O.U. Projector System', 'Hard Breach Charge', 'Claymore', 'Frag Grenade'],
      'Grim':        ['Kawan Hive Launcher', 'Breaching Charge', 'Hard Breach Charge', 'Impact EMP Grenade'],
      'Brava':       ['Kludge Drone', 'Claymore', 'Smoke Grenade'],
      'Ram':         ['BU-GI Auto-Breacher', 'Stun Grenade', 'Hard Breach Charge'],
      'Deimos':      ['DeathMARK', 'Claymore', 'Frag Grenade', 'Smoke Grenade'],
      'Striker':     ['Breaching Charge', 'Stun Grenade'],
      'Rauora':      ['Smoke Grenade', 'Breaching Charge'],
    };

    let linkedCount = 0;
    for (const [opName, gadgetNames] of Object.entries(opGadgetMap)) {
      const opId = opByName[opName];
      if (!opId) { console.warn(`  Operator not found: ${opName}`); continue; }
      for (const gName of gadgetNames) {
        const gId = gadgetByName[gName];
        if (!gId) { console.warn(`  Gadget not found: ${gName}`); continue; }
        await db.insert(operatorGadgets).values({ operatorId: opId, gadgetId: gId }).onConflictDoNothing();
        linkedCount++;
      }
    }
    console.log(`Linked ${linkedCount} operator-gadget relationships`);
  }

  console.log('Seeding complete!');
}

seed()
  .catch((err) => {
    console.error('Seed error:', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await client.end();
  });
