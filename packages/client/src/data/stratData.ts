/**
 * Static operator loadout data.
 * Contains all attackers and defenders with their weapons, equipment, and abilities.
 */

export interface OperatorLoadout {
  name: string;
  color: string;
  ability: string | null;
  subAbilities: string[];
  primaryWeapons: string[];
  secondaryWeapons: string[];
  meleeWeapons: string[];
  primaryEquipments: string[];
  secondaryEquipments: string[];
  environment: string[];
}

export interface SquadData {
  name: 'attackers' | 'defenders';
  ops: OperatorLoadout[];
  interactions: string[];
  postures: string[];
}

export interface SideInfo {
  name: string;
  color: string;
}

export interface ModeInfo {
  name: string;
  color: string;
}

export interface SiteInfo {
  name: string;
  color: string;
}

export const sides: SideInfo[] = [
  { name: 'Attackers', color: '#1487e1' },
  { name: 'Defenders', color: '#ff3232' },
  { name: 'Unknown', color: 'black' },
];

export const modes: ModeInfo[] = [
  { name: 'Bomb', color: '#ff7f00' },
  { name: 'Secure', color: '#007f00' },
  { name: 'Hostage', color: 'red' },
  { name: 'Unknown', color: 'black' },
];

export const sitesInfo: SiteInfo[] = [
  { name: '1', color: 'darkgrey' },
  { name: '2', color: 'darkgrey' },
  { name: '3', color: 'darkgrey' },
  { name: '4', color: 'darkgrey' },
  { name: 'Unknown', color: 'black' },
];

export const attackers: OperatorLoadout[] = [
  { name: 'Striker', color: '#f58222', ability: null, subAbilities: [], primaryWeapons: ['M4', 'M249', 'SR-25'], secondaryWeapons: ['ITA12S', '5.7 USG'], meleeWeapons: ['Knife'], primaryEquipments: ['Breach Charge', 'Claymore', 'Impact EMP Grenade', 'Frag Grenade', 'Hard Breach Charge', 'Smoke Grenade', 'Stun Grenade'], secondaryEquipments: ['Breach Charge', 'Claymore', 'Impact EMP Grenade', 'Frag Grenade', 'Hard Breach Charge', 'Smoke Grenade', 'Stun Grenade'], environment: [] },
  { name: 'Sledge', color: '#906f79', ability: 'Breaching Hammer', subAbilities: [], primaryWeapons: ['L85A2', 'M590A1'], secondaryWeapons: ['Reaper MK2', 'P226 Mk 25'], meleeWeapons: ['Knife'], primaryEquipments: ['Frag Grenade', 'Stun Grenade', 'Impact EMP Grenade'], secondaryEquipments: [], environment: [] },
  { name: 'Thatcher', color: '#906f79', ability: 'E.G.S. Disruptor', subAbilities: [], primaryWeapons: ['L85A2', 'AR33', 'PMR90A2', 'M590A1'], secondaryWeapons: ['P226 Mk 25'], meleeWeapons: ['Knife'], primaryEquipments: ['Claymore', 'Breach Charge'], secondaryEquipments: [], environment: [] },
  { name: 'Ash', color: '#d75b2a', ability: 'Breaching round', subAbilities: [], primaryWeapons: ['R4-C', 'G36C'], secondaryWeapons: ['5.7 USG', 'M45 MEUSOC'], meleeWeapons: ['Knife'], primaryEquipments: ['Claymore', 'Breach Charge'], secondaryEquipments: [], environment: [] },
  { name: 'Thermite', color: '#d75b2a', ability: 'Exothermic Charge', subAbilities: [], primaryWeapons: ['556xi', 'M1014'], secondaryWeapons: ['M45 MEUSOC', '5.7 USG', 'ITA12S'], meleeWeapons: ['Knife'], primaryEquipments: ['Smoke Grenade', 'Stun Grenade'], secondaryEquipments: [], environment: [] },
  { name: 'Twitch', color: '#3b6183', ability: 'Shock Drone', subAbilities: [], primaryWeapons: ['F2', '417', 'SG-CQB'], secondaryWeapons: ['P9', 'LFP586'], meleeWeapons: ['Knife'], primaryEquipments: ['Claymore', 'Smoke Grenade'], secondaryEquipments: [], environment: [] },
  { name: 'Montagne', color: '#3b6183', ability: 'Le Roc Shield', subAbilities: ['Undeployed Shield', 'Deployed Shield'], primaryWeapons: ['Le Roc Shield'], secondaryWeapons: ['P9', 'LFP586'], meleeWeapons: ['Knife'], primaryEquipments: ['Impact EMP Grenade', 'Smoke Grenade', 'Hard Breach Charge'], secondaryEquipments: [], environment: [] },
  { name: 'Glaz', color: '#aa1f23', ability: 'Flip Sight', subAbilities: [], primaryWeapons: ['OTs-03'], secondaryWeapons: ['PMM', 'Bearing 9', 'GONNE-6'], meleeWeapons: ['Knife'], primaryEquipments: ['Smoke Grenade', 'Frag Grenade', 'Claymore'], secondaryEquipments: [], environment: [] },
  { name: 'Fuze', color: '#aa1f23', ability: 'Cluster Charge', subAbilities: [], primaryWeapons: ['Ballistic Shield', 'AK-12', '6P41'], secondaryWeapons: ['PMM', 'GSh-18'], meleeWeapons: ['Knife'], primaryEquipments: ['Breach Charge', 'Hard Breach Charge', 'Smoke Grenade'], secondaryEquipments: [], environment: [] },
  { name: 'Blitz', color: '#f8c333', ability: 'G-52 Tactical Shield', subAbilities: [], primaryWeapons: ['G-52 Tactical Shield'], secondaryWeapons: ['P12'], meleeWeapons: ['Knife'], primaryEquipments: ['Smoke Grenade', 'Breach Charge'], secondaryEquipments: [], environment: [] },
  { name: 'IQ', color: '#f8c333', ability: 'Electronics Detector', subAbilities: [], primaryWeapons: ['G8A1', '552 Commando', 'AUG A2'], secondaryWeapons: ['P12'], meleeWeapons: ['Knife'], primaryEquipments: ['Frag Grenade', 'Claymore', 'Breach Charge'], secondaryEquipments: [], environment: [] },
  { name: 'Buck', color: '#00789e', ability: 'Skeleton Key', subAbilities: [], primaryWeapons: ['C8-SFW', 'CAMRS Skeleton Key'], secondaryWeapons: ['Mk1 9mm'], meleeWeapons: ['Knife'], primaryEquipments: ['Stun Grenade', 'Claymore'], secondaryEquipments: [], environment: [] },
  { name: 'Blackbeard', color: '#c1922d', ability: 'Rifle Shield', subAbilities: [], primaryWeapons: ['Mk17 CQB', 'SR-25'], secondaryWeapons: [], meleeWeapons: ['Knife'], primaryEquipments: ['Frag Grenade', 'Claymore'], secondaryEquipments: [], environment: [] },
  { name: 'Capitão', color: '#488a40', ability: 'Tactical Crossbow', subAbilities: ['Asphyxiating Bolts', 'Micro Smoke Grenades'], primaryWeapons: ['PARA-308', 'M249', 'PMR90A2'], secondaryWeapons: ['PRB92', 'GONNE-6'], meleeWeapons: ['Knife'], primaryEquipments: ['Hard Breach Charge', 'Impact EMP Grenade', 'Claymore'], secondaryEquipments: [], environment: [] },
  { name: 'Hibana', color: '#9a283f', ability: 'X-Kairos', subAbilities: ['X-Kairos x 2', 'X-Kairos x 4', 'X-Kairos x 6'], primaryWeapons: ['Type-89', 'SuperNova', 'PMR90A2'], secondaryWeapons: ['Bearing 9', 'P229'], meleeWeapons: ['Knife'], primaryEquipments: ['Breach Charge', 'Stun Grenade', 'Claymore'], secondaryEquipments: [], environment: [] },
  { name: 'Jackal', color: '#702f8e', ability: 'Eyenox Model III', subAbilities: [], primaryWeapons: ['C7E', 'PDW9', 'ITA12L'], secondaryWeapons: ['ITA12S', 'USP40'], meleeWeapons: ['Knife'], primaryEquipments: ['Claymore', 'Smoke Grenade'], secondaryEquipments: [], environment: [] },
  { name: 'Ying', color: '#ab4825', ability: 'Candela', subAbilities: [], primaryWeapons: ['T-95 LSW', 'SIX12'], secondaryWeapons: ['Q-929', 'Reaper MK2'], meleeWeapons: ['Knife'], primaryEquipments: ['Hard Breach Charge', 'Smoke Grenade'], secondaryEquipments: [], environment: [] },
  { name: 'Zofia', color: '#339999', ability: 'KS79 Lifeline', subAbilities: ['Impact Grenade', 'Concusion Grenade'], primaryWeapons: ['M762', 'LMG-E'], secondaryWeapons: ['RG15'], meleeWeapons: ['Knife'], primaryEquipments: ['Hard Breach Charge', 'Claymore'], secondaryEquipments: [], environment: [] },
  { name: 'Dokkaebi', color: '#c4cecf', ability: 'Logic Bomb', subAbilities: [], primaryWeapons: ['Mk 14 EBR', 'BOSG.12.2'], secondaryWeapons: ['SMG-12', 'C75 Auto', 'GONNE-6'], meleeWeapons: ['Knife'], primaryEquipments: ['Smoke Grenade', 'Impact EMP Grenade', 'Stun Grenade'], secondaryEquipments: [], environment: [] },
  { name: 'Lion', color: '#faae1b', ability: 'EE-ONE-D', subAbilities: [], primaryWeapons: ['V308', '417', 'SG-CQB'], secondaryWeapons: ['P9', 'LFP586'], meleeWeapons: ['Knife'], primaryEquipments: ['Frag Grenade', 'Stun Grenade', 'Claymore'], secondaryEquipments: [], environment: [] },
  { name: 'Finka', color: '#faae1b', ability: 'Adrenal Surge', subAbilities: [], primaryWeapons: ['Spear .308', '6P41', 'SASG-12'], secondaryWeapons: ['PMM', 'GSh-18'], meleeWeapons: ['Knife'], primaryEquipments: ['Frag Grenade', 'Smoke Grenade', 'Stun Grenade'], secondaryEquipments: [], environment: [] },
  { name: 'Maverick', color: '#70808f', ability: 'Breaching Torch', subAbilities: [], primaryWeapons: ['M4', 'AR-15.50'], secondaryWeapons: ['1911 TACOPS', 'Reaper MK2'], meleeWeapons: ['Knife'], primaryEquipments: ['Claymore', 'Stun Grenade', 'Frag Grenade'], secondaryEquipments: [], environment: [] },
  { name: 'Nomad', color: '#a8834f', ability: 'Airjab Launcher', subAbilities: [], primaryWeapons: ['AK-74M', 'ARX200'], secondaryWeapons: ['PRB92', '.44 Mag Semi-Auto'], meleeWeapons: ['Knife'], primaryEquipments: ['Breach Charge', 'Stun Grenade'], secondaryEquipments: [], environment: [] },
  { name: 'Gridlock', color: '#d3005a', ability: 'Trax Stingers', subAbilities: [], primaryWeapons: ['F90', 'M249 SAW'], secondaryWeapons: ['Super Shorty', 'SDP 9mm'], meleeWeapons: ['Knife'], primaryEquipments: ['Smoke Grenade', 'Frag Grenade', 'Impact EMP Grenade'], secondaryEquipments: [], environment: [] },
  { name: 'Nøkk', color: '#2d3b89', ability: 'HEL Presence Reduction', subAbilities: [], primaryWeapons: ['FMG-9', 'SIX12 SD', 'PMR90A2'], secondaryWeapons: ['5.7 USG', 'D-50'], meleeWeapons: ['Knife'], primaryEquipments: ['Impact EMP Grenade', 'Hard Breach Charge', 'Frag Grenade'], secondaryEquipments: [], environment: [] },
  { name: 'Amaru', color: '#17650b', ability: 'Garra Hook', subAbilities: [], primaryWeapons: ['G8A1', 'SuperNova'], secondaryWeapons: ['ITA12S', 'SMG-11', 'GONNE-6'], meleeWeapons: ['Knife'], primaryEquipments: ['Stun Grenade', 'Hard Breach Charge'], secondaryEquipments: [], environment: [] },
  { name: 'Kali', color: '#2dc6d0', ability: 'LV Explosive Lance', subAbilities: [], primaryWeapons: ['CSRX 300'], secondaryWeapons: ['SPSMG9', 'C75 Auto', 'P226 Mk 25'], meleeWeapons: ['Knife'], primaryEquipments: ['Claymore', 'Breach Charge', 'Smoke Grenade'], secondaryEquipments: [], environment: [] },
  { name: 'Iana', color: '#946a97', ability: 'Genmini Replicator', subAbilities: [], primaryWeapons: ['G36C', 'ARX200'], secondaryWeapons: ['Mk1 9mm', 'GONNE-6'], meleeWeapons: ['Knife'], primaryEquipments: ['Impact EMP Grenade', 'Smoke Grenade'], secondaryEquipments: [], environment: [] },
  { name: 'Ace', color: '#2b7f91', ability: 'S.E.L.M.A. Aqua Breacher', subAbilities: [], primaryWeapons: ['AK-12', 'M1014'], secondaryWeapons: ['P9'], meleeWeapons: ['Knife'], primaryEquipments: ['Claymore', 'Stun Grenade'], secondaryEquipments: [], environment: [] },
  { name: 'Zero', color: '#6ca542', ability: 'Argus Launcher', subAbilities: [], primaryWeapons: ['SC3000K', 'MP7'], secondaryWeapons: ['5.7 USG', 'GONNE-6'], meleeWeapons: ['Knife'], primaryEquipments: ['Hard Breach Charge', 'Claymore'], secondaryEquipments: [], environment: [] },
  { name: 'Flores', color: '#8c0000', ability: 'REC-Ratero Charge', subAbilities: [], primaryWeapons: ['AR33', 'SR-25'], secondaryWeapons: ['GSh-18'], meleeWeapons: ['Knife'], primaryEquipments: ['Claymore', 'Stun Grenade'], secondaryEquipments: [], environment: [] },
  { name: 'Osa', color: '#f9a31d', ability: 'TALON-8 Shield', subAbilities: [], primaryWeapons: ['556xi', 'PDW9'], secondaryWeapons: ['PMM'], meleeWeapons: ['Knife'], primaryEquipments: ['Claymore', 'Frag Grenade', 'Impact EMP Grenade'], secondaryEquipments: [], environment: [] },
  { name: 'Sens', color: '#68c5ad', ability: 'R.O.U. Projector System', subAbilities: [], primaryWeapons: ['POF9', '417'], secondaryWeapons: ['SDP 9mm'], meleeWeapons: ['Knife'], primaryEquipments: ['Frag Grenade', 'Hard Breach Charge', 'Claymore'], secondaryEquipments: [], environment: [] },
  { name: 'Grim', color: '#d9c724', ability: 'Kawan Hive Launcher', subAbilities: ['Sticky Canister', 'Bouncing Canister'], primaryWeapons: ['552 Commando', 'SG-CQB'], secondaryWeapons: ['Bailiff 410', 'P229'], meleeWeapons: ['Knife'], primaryEquipments: ['Hard Breach Charge', 'Impact EMP Grenade', 'Claymore'], secondaryEquipments: [], environment: [] },
  { name: 'Brava', color: '#45abf3', ability: 'Kludge Drone', subAbilities: [], primaryWeapons: ['PARA-308', 'CAMRS'], secondaryWeapons: ['Super Shorty', 'USP40'], meleeWeapons: ['Knife'], primaryEquipments: ['Claymore', 'Smoke Grenade'], secondaryEquipments: [], environment: [] },
  { name: 'Ram', color: '#ffa529', ability: 'BU-GI Auto-Breacher', subAbilities: [], primaryWeapons: ['R4-C', 'LMG-E'], secondaryWeapons: ['Mk1 9mm'], meleeWeapons: ['Knife'], primaryEquipments: ['Stun Grenade', 'Smoke Grenade'], secondaryEquipments: [], environment: [] },
  { name: 'Deimos', color: '#ee4b38', ability: 'DeathMARK', subAbilities: [], primaryWeapons: ['AK-74M', 'M590A1'], secondaryWeapons: ['.44 Vendetta'], meleeWeapons: ['Knife'], primaryEquipments: ['Frag Grenade', 'Hard Breach Charge'], secondaryEquipments: [], environment: [] },
  { name: 'Rauora', color: '#f16c21', ability: 'D.O.M. Panel Launcher', subAbilities: [], primaryWeapons: ['417', 'M249'], secondaryWeapons: ['Reaper MK2', 'GSh-18'], meleeWeapons: ['Knife'], primaryEquipments: ['Smoke Grenade', 'Breach Charge'], secondaryEquipments: [], environment: [] },
];

export const defenders: OperatorLoadout[] = [
  { name: 'Sentry', color: '#f58222', ability: null, subAbilities: [], primaryWeapons: ['Commando 9', 'M870', 'TCSG12'], secondaryWeapons: ['C75 Auto', 'Super Shorty'], meleeWeapons: ['Knife'], primaryEquipments: ['Barbed Wire', 'Bulletproof Camera', 'Deployable Shield', 'Observation Blocker', 'Impact Grenade', 'Nitro Cell', 'Proximity Alarm'], secondaryEquipments: ['Barbed Wire', 'Bulletproof Camera', 'Deployable Shield', 'Observation Blocker', 'Impact Grenade', 'Nitro Cell', 'Proximity Alarm'], environment: ['Barricade', 'Reinforce'] },
  { name: 'Smoke', color: '#906f79', ability: 'Remote Gas Grenade', subAbilities: [], primaryWeapons: ['M590A1', 'FMG-9'], secondaryWeapons: ['SMG-11', 'P226 Mk 25'], meleeWeapons: ['Knife'], primaryEquipments: ['Barbed Wire', 'Proximity Alarm'], secondaryEquipments: [], environment: ['Barricade', 'Reinforce'] },
  { name: 'Mute', color: '#906f79', ability: 'Signal Disruptor', subAbilities: [], primaryWeapons: ['M590A1', 'MP5K'], secondaryWeapons: ['SMG-11', 'P226 Mk 25'], meleeWeapons: ['Knife'], primaryEquipments: ['Nitro Cell', 'Bulletproof Camera'], secondaryEquipments: [], environment: ['Barricade', 'Reinforce'] },
  { name: 'Castle', color: '#d75b2a', ability: 'Armor Panel', subAbilities: [], primaryWeapons: ['UMP45', 'M1014'], secondaryWeapons: ['Super Shorty', '5.7 USG', 'M45 MEUSOC'], meleeWeapons: ['Knife'], primaryEquipments: ['Bulletproof Camera', 'Proximity Alarm'], secondaryEquipments: [], environment: ['Barricade', 'Reinforce'] },
  { name: 'Pulse', color: '#d75b2a', ability: 'Cardiac Sensor', subAbilities: [], primaryWeapons: ['UMP45', 'M1014'], secondaryWeapons: ['Reaper MK2', '5.7 USG', 'M45 MEUSOC'], meleeWeapons: ['Knife'], primaryEquipments: ['Nitro Cell', 'Deployable Shield', 'Observation Blocker'], secondaryEquipments: [], environment: ['Barricade', 'Reinforce'] },
  { name: 'Doc', color: '#3b6183', ability: 'Stim Pistol', subAbilities: [], primaryWeapons: ['P90', 'MP5', 'SG-CQB'], secondaryWeapons: ['Bailiff 410', 'LFP586', 'P9'], meleeWeapons: ['Knife'], primaryEquipments: ['Bulletproof Camera', 'Barbed Wire'], secondaryEquipments: [], environment: ['Barricade', 'Reinforce'] },
  { name: 'Rook', color: '#3b6183', ability: 'Armor Pack', subAbilities: [], primaryWeapons: ['MP5', 'P90', 'SG-CQB'], secondaryWeapons: ['LFP586', 'P9', 'Reaper MK2'], meleeWeapons: ['Knife'], primaryEquipments: ['Proximity Alarm', 'Impact Grenade', 'Nitro Cell'], secondaryEquipments: [], environment: ['Barricade', 'Reinforce'] },
  { name: 'Kapkan', color: '#aa1f23', ability: 'Entry Denial Device', subAbilities: [], primaryWeapons: ['9x19VSN', 'SASG-12'], secondaryWeapons: ['GSh-18', 'PMM'], meleeWeapons: ['Knife'], primaryEquipments: ['Bulletproof Camera', 'Barbed Wire'], secondaryEquipments: [], environment: ['Barricade', 'Reinforce'] },
  { name: 'Tachanka', color: '#aa1f23', ability: 'Shumikha Launcher', subAbilities: [], primaryWeapons: ['DP27', '9x19VSN'], secondaryWeapons: ['Bearing 9', 'PMM', 'GSh-18'], meleeWeapons: ['Knife'], primaryEquipments: ['Barbed Wire', 'Deployable Shield', 'Proximity Alarm'], secondaryEquipments: [], environment: ['Barricade', 'Reinforce'] },
  { name: 'Jäger', color: '#f8c333', ability: 'Active Defense', subAbilities: [], primaryWeapons: ['416-C Carbine', 'M870'], secondaryWeapons: ['P-10C', 'P12'], meleeWeapons: ['Knife'], primaryEquipments: ['Bulletproof Camera', 'Observation Blocker'], secondaryEquipments: [], environment: ['Barricade', 'Reinforce'] },
  { name: 'Bandit', color: '#f8c333', ability: 'Shock Wire', subAbilities: [], primaryWeapons: ['MP7', 'M870'], secondaryWeapons: ['Keratos .357', 'P12'], meleeWeapons: ['Knife'], primaryEquipments: ['Barbed Wire', 'Nitro Cell'], secondaryEquipments: [], environment: ['Barricade', 'Reinforce'] },
  { name: 'Frost', color: '#00789e', ability: 'Welcome Mat', subAbilities: [], primaryWeapons: ['9mm C1', 'Super 90'], secondaryWeapons: ['ITA12S', 'Mk1 9mm'], meleeWeapons: ['Knife'], primaryEquipments: ['Deployable Shield', 'Bulletproof Camera'], secondaryEquipments: [], environment: ['Barricade', 'Reinforce'] },
  { name: 'Valkyrie', color: '#c1922d', ability: 'Black Eye', subAbilities: [], primaryWeapons: ['MPX', 'SPAS-12'], secondaryWeapons: ['D-50'], meleeWeapons: ['Knife'], primaryEquipments: ['Impact Grenade', 'Nitro Cell'], secondaryEquipments: [], environment: ['Barricade', 'Reinforce'] },
  { name: 'Caveira', color: '#488a40', ability: 'Silent Step', subAbilities: [], primaryWeapons: ['M12', 'SPAS-15'], secondaryWeapons: ['Luison'], meleeWeapons: ['Knife'], primaryEquipments: ['Impact Grenade', 'Proximity Alarm', 'Observation Blocker'], secondaryEquipments: [], environment: ['Barricade', 'Reinforce'] },
  { name: 'Echo', color: '#9a283f', ability: 'Yokai', subAbilities: [], primaryWeapons: ['MP5SD', 'SuperNova'], secondaryWeapons: ['P229', 'Bearing 9'], meleeWeapons: ['Knife'], primaryEquipments: ['Deployable Shield', 'Impact Grenade'], secondaryEquipments: [], environment: ['Barricade', 'Reinforce'] },
  { name: 'Mira', color: '#702f8e', ability: 'Black Mirror', subAbilities: [], primaryWeapons: ['Vector .45 ACP', 'ITA12L'], secondaryWeapons: ['ITA12S', 'USP40'], meleeWeapons: ['Knife'], primaryEquipments: ['Nitro Cell', 'Proximity Alarm'], secondaryEquipments: [], environment: ['Barricade', 'Reinforce'] },
  { name: 'Lesion', color: '#ab4825', ability: 'Gu', subAbilities: [], primaryWeapons: ['T-5 SMG', 'SIX12 SD'], secondaryWeapons: ['Q-929'], meleeWeapons: ['Knife'], primaryEquipments: ['Observation Blocker', 'Bulletproof Camera'], secondaryEquipments: [], environment: ['Barricade', 'Reinforce'] },
  { name: 'Ela', color: '#339999', ability: 'Grzmot Mine', subAbilities: [], primaryWeapons: ['Scorpion EVO 3 A1', 'FO-12'], secondaryWeapons: ['RG15'], meleeWeapons: ['Knife'], primaryEquipments: ['Deployable Shield', 'Impact Grenade', 'Barbed Wire'], secondaryEquipments: [], environment: ['Barricade', 'Reinforce'] },
  { name: 'Vigil', color: '#c4cecf', ability: 'ERC-7', subAbilities: [], primaryWeapons: ['K1A', 'BOSG.12.2'], secondaryWeapons: ['C75 Auto', 'SMG-12'], meleeWeapons: ['Knife'], primaryEquipments: ['Impact Grenade', 'Bulletproof Camera'], secondaryEquipments: [], environment: ['Barricade', 'Reinforce'] },
  { name: 'Maestro', color: '#929637', ability: 'Evil Eye', subAbilities: [], primaryWeapons: ['ALDA 5.56', 'ACS12'], secondaryWeapons: ['Bailiff 410', 'Keratos .357'], meleeWeapons: ['Knife'], primaryEquipments: ['Barbed Wire', 'Impact Grenade', 'Observation Blocker'], secondaryEquipments: [], environment: ['Barricade', 'Reinforce'] },
  { name: 'Alibi', color: '#929637', ability: 'Prisma', subAbilities: [], primaryWeapons: ['Mx4 Storm', 'ACS12'], secondaryWeapons: ['Bailiff 410', 'Keratos .357'], meleeWeapons: ['Knife'], primaryEquipments: ['Proximity Alarm', 'Observation Blocker'], secondaryEquipments: [], environment: ['Barricade', 'Reinforce'] },
  { name: 'Clash', color: '#70808f', ability: 'CCE Shield', subAbilities: [], primaryWeapons: ['CCE Shield'], secondaryWeapons: ['SPSMG9', 'Super Shorty', 'P-10C'], meleeWeapons: ['Knife'], primaryEquipments: ['Barbed Wire', 'Impact Grenade'], secondaryEquipments: [], environment: ['Barricade', 'Reinforce'] },
  { name: 'Kaid', color: '#a8834f', ability: 'Rtila Electroclaw', subAbilities: [], primaryWeapons: ['AUG A3', 'TCSG12'], secondaryWeapons: ['LFP586', '.44 Mag Semi-Auto'], meleeWeapons: ['Knife'], primaryEquipments: ['Barbed Wire', 'Observation Blocker', 'Nitro Cell'], secondaryEquipments: [], environment: ['Barricade', 'Reinforce'] },
  { name: 'Mozzie', color: '#d3005a', ability: 'Pest Launcher', subAbilities: [], primaryWeapons: ['Commando 9', 'P10 RONI'], secondaryWeapons: ['SDP 9mm'], meleeWeapons: ['Knife'], primaryEquipments: ['Barbed Wire', 'Nitro Cell', 'Impact Grenade'], secondaryEquipments: [], environment: ['Barricade', 'Reinforce'] },
  { name: 'Warden', color: '#2d3b89', ability: 'Glance Smart Glaces', subAbilities: [], primaryWeapons: ['M590A1', 'MPX'], secondaryWeapons: ['SMG-12', 'P-10C'], meleeWeapons: ['Knife'], primaryEquipments: ['Deployable Shield', 'Nitro Cell', 'Observation Blocker'], secondaryEquipments: [], environment: ['Barricade', 'Reinforce'] },
  { name: 'Goyo', color: '#17650b', ability: 'Volcan Shield', subAbilities: [], primaryWeapons: ['Vector .45 ACP', 'TCSG12'], secondaryWeapons: ['P229'], meleeWeapons: ['Knife'], primaryEquipments: ['Impact Grenade', 'Proximity Alarm', 'Bulletproof Camera'], secondaryEquipments: [], environment: ['Barricade', 'Reinforce'] },
  { name: 'Wamai', color: '#2dc6d0', ability: 'MAG-NET System', subAbilities: [], primaryWeapons: ['AUG A2', 'MP5K'], secondaryWeapons: ['Keratos .357', 'P12', 'Super Shorty'], meleeWeapons: ['Knife'], primaryEquipments: ['Impact Grenade', 'Proximity Alarm'], secondaryEquipments: [], environment: ['Barricade', 'Reinforce'] },
  { name: 'Oryx', color: '#946a97', ability: 'Remah Dash', subAbilities: [], primaryWeapons: ['T-5 SMG', 'SPAS-12'], secondaryWeapons: ['USP40', 'Bailiff 410', 'Reaper MK2'], meleeWeapons: ['Knife'], primaryEquipments: ['Barbed Wire', 'Proximity Alarm'], secondaryEquipments: [], environment: ['Barricade', 'Reinforce'] },
  { name: 'Melusi', color: '#2b7f91', ability: 'Banshee Sonic Defense', subAbilities: [], primaryWeapons: ['MP5', 'Super 90'], secondaryWeapons: ['ITA12S', 'RG15'], meleeWeapons: ['Knife'], primaryEquipments: ['Bulletproof Camera', 'Impact Grenade'], secondaryEquipments: [], environment: ['Barricade', 'Reinforce'] },
  { name: 'Aruni', color: '#d14007', ability: 'Surya Gate', subAbilities: [], primaryWeapons: ['P10 RONI', 'Mk 14 EBR'], secondaryWeapons: ['PRB92'], meleeWeapons: ['Knife'], primaryEquipments: ['Barbed Wire', 'Bulletproof Camera'], secondaryEquipments: [], environment: ['Barricade', 'Reinforce'] },
  { name: 'Thunderbird', color: '#834237', ability: 'Kona Station', subAbilities: [], primaryWeapons: ['Spear .308', 'SPAS-15'], secondaryWeapons: ['Bearing 9', 'ITA12S', 'Q-929'], meleeWeapons: ['Knife'], primaryEquipments: ['Deployable Shield', 'Barbed Wire', 'Bulletproof Camera'], secondaryEquipments: [], environment: ['Barricade', 'Reinforce'] },
  { name: 'Thorn', color: '#58761c', ability: 'Razorbloom Shell', subAbilities: [], primaryWeapons: ['UZK50Gi', 'M870'], secondaryWeapons: ['C75 Auto', '1911 TACOPS'], meleeWeapons: ['Knife'], primaryEquipments: ['Deployable Shield', 'Barbed Wire'], secondaryEquipments: [], environment: ['Barricade', 'Reinforce'] },
  { name: 'Azami', color: '#3c63ad', ability: 'Kiba Barrier', subAbilities: [], primaryWeapons: ['9x19VSN', 'ACS12'], secondaryWeapons: ['D-50'], meleeWeapons: ['Knife'], primaryEquipments: ['Barbed Wire', 'Impact Grenade'], secondaryEquipments: [], environment: ['Barricade', 'Reinforce'] },
  { name: 'Solis', color: '#cf3314', ability: 'SPEC-IO Electro-Sensor', subAbilities: [], primaryWeapons: ['P90', 'ITA12L'], secondaryWeapons: ['SMG-11'], meleeWeapons: ['Knife'], primaryEquipments: ['Proximity Alarm', 'Impact Grenade'], secondaryEquipments: [], environment: ['Barricade', 'Reinforce'] },
  { name: 'Fenrir', color: '#4f40a7', ability: 'F-NATT Dread Mine', subAbilities: [], primaryWeapons: ['MP7', 'SASG-12'], secondaryWeapons: ['5.7 USG'], meleeWeapons: ['Knife'], primaryEquipments: ['Bulletproof Camera', 'Observation Blocker'], secondaryEquipments: [], environment: ['Barricade', 'Reinforce'] },
  { name: 'Tubarão', color: '#397075', ability: 'ZOTO Canister', subAbilities: [], primaryWeapons: ['MPX', 'AR-15.50'], secondaryWeapons: ['P226 Mk 25'], meleeWeapons: ['Knife'], primaryEquipments: ['Nitro Cell', 'Proximity Alarm'], secondaryEquipments: [], environment: ['Barricade', 'Reinforce'] },
  { name: 'Skopós', color: '#c128d6', ability: 'Robots', subAbilities: ['Colossus', 'Talos'], primaryWeapons: ['PCX-33'], secondaryWeapons: ['P229'], meleeWeapons: ['Knife'], primaryEquipments: ['Impact Grenade', 'Proximity Alarm'], secondaryEquipments: [], environment: ['Barricade', 'Reinforce'] },
  { name: 'Denari', color: '#c82127', ability: 'T.R.I.P. Connector', subAbilities: [], primaryWeapons: ['Scorpion EVO 3 A1', 'FMG-9'], secondaryWeapons: ['Glaive-12', 'P226 Mk 25'], meleeWeapons: ['Knife'], primaryEquipments: ['Observation Blocker', 'Deployable Shield'], secondaryEquipments: [], environment: ['Barricade', 'Reinforce'] },
];

/** All operators (attackers + defenders, excluding Unknown placeholders) */
export const allOperators: OperatorLoadout[] = [...attackers, ...defenders];

/** Lookup operator by name (case-insensitive) */
export function findOperator(name: string): OperatorLoadout | undefined {
  return allOperators.find(op => op.name.toLowerCase() === name.toLowerCase());
}

/** Get operators for a side */
export function getOperatorsBySide(side: 'attackers' | 'defenders'): OperatorLoadout[] {
  return side === 'attackers' ? attackers : defenders;
}

/** Get strat avatar image path for an operator */
export function getStratAvatarUrl(operatorName: string): string {
  return `/img/strats/avatars/${operatorName}.png`;
}

/** Get weapon image path */
export function getWeaponUrl(weaponName: string): string {
  return `/img/strats/weapons/${weaponName}.png`;
}

/** Get equipment image path */
export function getEquipmentUrl(equipmentName: string): string {
  return `/img/strats/equipments/${equipmentName}.png`;
}

/** Get ability image path */
export function getAbilityUrl(abilityName: string): string {
  return `/img/strats/abilities/${abilityName}.png`;
}
