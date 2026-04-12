/**
 * Static operator loadout data for Rainbow Six Siege.
 * Maps operator name → available primary/secondary weapons.
 * Source: r6data (github.com/danielwerg/r6data) + Ubisoft official data.
 * Last verified: Y10S4 (2026-04).
 */

export interface OperatorWeapons {
  primaryWeapons: string[];
  secondaryWeapons: string[];
}

export const OPERATOR_LOADOUTS: Record<string, OperatorWeapons> = {
  // ── Defenders ──
  Smoke:       { primaryWeapons: ['FMG-9', 'M590A1'], secondaryWeapons: ['P226 MK 25', 'SMG-11'] },
  Mute:        { primaryWeapons: ['MP5K', 'M590A1'], secondaryWeapons: ['P226 MK 25', 'SMG-11'] },
  Castle:      { primaryWeapons: ['UMP45', 'M1014'], secondaryWeapons: ['5.7 USG', 'Super Shorty'] },
  Pulse:       { primaryWeapons: ['UMP45', 'M1014'], secondaryWeapons: ['5.7 USG', 'M45 MEUSOC'] },
  Doc:         { primaryWeapons: ['MP5', 'P90', 'SG-CQB'], secondaryWeapons: ['P9', 'LFP586', 'Bailiff 410'] },
  Rook:        { primaryWeapons: ['MP5', 'P90', 'SG-CQB'], secondaryWeapons: ['P9', 'LFP586'] },
  Jager:       { primaryWeapons: ['416-C Carbine', 'M870'], secondaryWeapons: ['P12'] },
  Bandit:      { primaryWeapons: ['MP7', 'M870'], secondaryWeapons: ['P12'] },
  Tachanka:    { primaryWeapons: ['DP27', '9x19VSN'], secondaryWeapons: ['GSH-18', 'PMM', 'Bearing 9'] },
  Kapkan:      { primaryWeapons: ['9x19VSN', 'SASG-12'], secondaryWeapons: ['PMM', 'GSH-18'] },
  Frost:       { primaryWeapons: ['9mm C1', 'Super 90'], secondaryWeapons: ['MK1 9mm', 'ITA12S'] },
  Valkyrie:    { primaryWeapons: ['MPX', 'SPAS-12'], secondaryWeapons: ['D-50'] },
  Caveira:     { primaryWeapons: ['M12', 'SPAS-15'], secondaryWeapons: ['Luison'] },
  Echo:        { primaryWeapons: ['MP5SD', 'Supernova'], secondaryWeapons: ['P229', 'Bearing 9'] },
  Mira:        { primaryWeapons: ['Vector .45 ACP', 'ITA12L'], secondaryWeapons: ['USP40', 'ITA12S'] },
  Lesion:      { primaryWeapons: ['T-5 SMG', 'SIX12 SD'], secondaryWeapons: ['Q-929'] },
  Ela:         { primaryWeapons: ['Scorpion EVO 3 A1', 'FO-12'], secondaryWeapons: ['RG15'] },
  Vigil:       { primaryWeapons: ['K1A', 'BOSG.12.2'], secondaryWeapons: ['C75 Auto', 'SMG-12'] },
  Maestro:     { primaryWeapons: ['ALDA 5.56', 'ACS12'], secondaryWeapons: ['Bailiff 410', 'Keratos .357'] },
  Alibi:       { primaryWeapons: ['Mx4 Storm', 'ACS12'], secondaryWeapons: ['Bailiff 410', 'Keratos .357'] },
  Clash:       { primaryWeapons: ['CCE Shield'], secondaryWeapons: ['P-10C', 'SPSMG9'] },
  Kaid:        { primaryWeapons: ['AUG A3', 'TCSG12'], secondaryWeapons: ['.44 Mag Semi-Auto', 'LFP586'] },
  Mozzie:      { primaryWeapons: ['Commando 9', 'P10 Roni'], secondaryWeapons: ['SDP 9mm'] },
  Warden:      { primaryWeapons: ['MPX', 'M590A1'], secondaryWeapons: ['P-10C', 'SMG-12'] },
  Goyo:        { primaryWeapons: ['Vector .45 ACP', 'TCSG12'], secondaryWeapons: ['P229'] },
  Wamai:       { primaryWeapons: ['AUG A2', 'MP5K'], secondaryWeapons: ['Keratos .357', 'P12'] },
  Oryx:        { primaryWeapons: ['T-5 SMG', 'SPAS-12'], secondaryWeapons: ['Bailiff 410', 'USP40'] },
  Melusi:      { primaryWeapons: ['MP5', 'Super 90'], secondaryWeapons: ['RG15'] },
  Aruni:       { primaryWeapons: ['P10 Roni', 'MK 14 EBR'], secondaryWeapons: ['PRB92'] },
  Thunderbird: { primaryWeapons: ['Spear .308', 'SPAS-15'], secondaryWeapons: ['Bearing 9', 'Q-929'] },
  Thorn:       { primaryWeapons: ['UZK50GI', 'M870'], secondaryWeapons: ['1911 TACOPS', 'C75 Auto'] },
  Azami:       { primaryWeapons: ['9x19VSN', 'ACS12'], secondaryWeapons: ['D-50'] },
  Solis:       { primaryWeapons: ['P90', 'ITA12L'], secondaryWeapons: ['SMG-11'] },
  Fenrir:      { primaryWeapons: ['MP7', 'SASG-12'], secondaryWeapons: ['Bailiff 410', '5.7 USG'] },
  Tubarao:     { primaryWeapons: ['MPX', 'AR-15.50'], secondaryWeapons: ['P226 MK 25'] },
  Sentry:      { primaryWeapons: ['Commando 9', 'M870'], secondaryWeapons: ['C75 Auto', 'Super Shorty'] },
  Skopos:      { primaryWeapons: ['PCX-33'], secondaryWeapons: ['P229'] },
  Denari:      { primaryWeapons: ['Scorpion EVO 3 A1', 'Glaive-12'], secondaryWeapons: ['P229', 'Tactical Crossbow'] },

  // ── Attackers ──
  Sledge:      { primaryWeapons: ['L85A2', 'M590A1'], secondaryWeapons: ['P226 MK 25', 'SMG-11'] },
  Thatcher:    { primaryWeapons: ['AR33', 'L85A2'], secondaryWeapons: ['P226 MK 25'] },
  Ash:         { primaryWeapons: ['R4-C', 'G36C'], secondaryWeapons: ['5.7 USG', 'M45 MEUSOC'] },
  Thermite:    { primaryWeapons: ['556xi', 'M1014'], secondaryWeapons: ['5.7 USG', 'M45 MEUSOC'] },
  Montagne:    { primaryWeapons: ['Extendable Shield'], secondaryWeapons: ['P9', 'LFP586'] },
  Twitch:      { primaryWeapons: ['F2', '417', 'SG-CQB'], secondaryWeapons: ['P9', 'LFP586'] },
  Blitz:       { primaryWeapons: ['Flash Shield'], secondaryWeapons: ['P12'] },
  IQ:          { primaryWeapons: ['AUG A2', '552 Commando', 'G8A1'], secondaryWeapons: ['P12'] },
  Fuze:        { primaryWeapons: ['AK-12', '6P41', 'Ballistic Shield'], secondaryWeapons: ['PMM', 'GSH-18'] },
  Glaz:        { primaryWeapons: ['OTs-03'], secondaryWeapons: ['PMM', 'GSH-18', 'Bearing 9'] },
  Buck:        { primaryWeapons: ['C8-SFW', 'CAMRS'], secondaryWeapons: ['MK1 9mm', 'Gonne-6'] },
  Blackbeard:  { primaryWeapons: ['MK17 CQB', 'SR-25'], secondaryWeapons: ['D-50'] },
  Capitao:     { primaryWeapons: ['Para-308', 'M249'], secondaryWeapons: ['PRB92', 'Gonne-6'] },
  Hibana:      { primaryWeapons: ['TYPE-89', 'Supernova'], secondaryWeapons: ['P229', 'Bearing 9'] },
  Jackal:      { primaryWeapons: ['C7E', 'PDW9', 'ITA12L'], secondaryWeapons: ['USP40', 'ITA12S'] },
  Ying:        { primaryWeapons: ['T-95 LSW', 'SIX12'], secondaryWeapons: ['Q-929'] },
  Zofia:       { primaryWeapons: ['M762', 'LMG-E'], secondaryWeapons: ['RG15'] },
  Dokkaebi:    { primaryWeapons: ['MK 14 EBR', 'BOSG.12.2'], secondaryWeapons: ['C75 Auto', 'SMG-12', 'Gonne-6'] },
  Lion:        { primaryWeapons: ['V308', '417', 'SG-CQB'], secondaryWeapons: ['LFP586', 'P9'] },
  Finka:       { primaryWeapons: ['Spear .308', '6P41', 'SASG-12'], secondaryWeapons: ['PMM', 'GSH-18'] },
  Maverick:    { primaryWeapons: ['AR-15.50', 'M4'], secondaryWeapons: ['1911 TACOPS'] },
  Nomad:       { primaryWeapons: ['AK-74M', 'ARX200'], secondaryWeapons: ['.44 Mag Semi-Auto', 'PRB92'] },
  Gridlock:    { primaryWeapons: ['F90', 'M249 SAW'], secondaryWeapons: ['Super Shorty', 'SDP 9mm'] },
  Nokk:        { primaryWeapons: ['FMG-9', 'SIX12 SD'], secondaryWeapons: ['5.7 USG', 'D-50'] },
  Amaru:       { primaryWeapons: ['G8A1', 'Supernova'], secondaryWeapons: ['SMG-11', 'ITA12S', 'Gonne-6'] },
  Kali:        { primaryWeapons: ['CSRX 300'], secondaryWeapons: ['SPSMG9', 'C75 Auto', 'P226 MK 25'] },
  Iana:        { primaryWeapons: ['ARX200', 'G36C'], secondaryWeapons: ['MK1 9mm', 'Gonne-6'] },
  Ace:         { primaryWeapons: ['AK-12', 'M1014'], secondaryWeapons: ['P9'] },
  Zero:        { primaryWeapons: ['SC3000K', 'MP7'], secondaryWeapons: ['5.7 USG', 'Gonne-6'] },
  Flores:      { primaryWeapons: ['AR33', 'SR-25'], secondaryWeapons: ['GSH-18'] },
  Osa:         { primaryWeapons: ['556xi', 'PDW9'], secondaryWeapons: ['PMM'] },
  Sens:        { primaryWeapons: ['POF-9', '417'], secondaryWeapons: ['SDP 9mm'] },
  Grim:        { primaryWeapons: ['552 Commando', 'SG-CQB'], secondaryWeapons: ['P229', 'Bailiff 410'] },
  Brava:       { primaryWeapons: ['Para-308', 'CAMRS'], secondaryWeapons: ['Super Shorty', 'USP40'] },
  Ram:         { primaryWeapons: ['R4-C', 'LMG-E'], secondaryWeapons: ['MK1 9mm', 'ITA12S'] },
  Deimos:      { primaryWeapons: ['AK-74M', 'M590A1'], secondaryWeapons: ['.44 Vendetta'] },
  Striker:     { primaryWeapons: ['M4', 'M249'], secondaryWeapons: ['5.7 USG', 'ITA12S'] },
  Rauora:      { primaryWeapons: ['417', 'M2K9'], secondaryWeapons: ['Reaper MK2', 'GSH-18'] },
};

/** Get loadout options for an operator by name. Returns undefined if not found. */
export function getOperatorLoadout(operatorName: string): OperatorWeapons | undefined {
  return OPERATOR_LOADOUTS[operatorName];
}
