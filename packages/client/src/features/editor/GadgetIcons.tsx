/**
 * Inline SVG fallback icons for gadgets that don't have uploaded images.
 * Maps gadget names to small SVG components for use in SidePanelToolGrid.
 */

interface IconProps {
  className?: string;
}

function ReinforcementIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <rect x="2" y="1" width="12" height="14" rx="1" />
      <line x1="8" y1="1" x2="8" y2="15" />
      <line x1="2" y1="5.5" x2="14" y2="5.5" />
      <line x1="2" y1="10.5" x2="14" y2="10.5" />
    </svg>
  );
}

function RappelIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <line x1="8" y1="1" x2="8" y2="12" />
      <polyline points="5,9 8,12 11,9" />
      <line x1="5" y1="1" x2="11" y2="1" />
      <circle cx="8" cy="14.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function ObjectiveIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <rect x="3" y="2" width="10" height="12" rx="1" />
      <line x1="3" y1="5" x2="13" y2="5" />
      <circle cx="8" cy="10" r="2" />
      <line x1="6" y1="3.5" x2="10" y2="3.5" strokeWidth="1" />
    </svg>
  );
}

function BreachingChargeIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <rect x="3" y="4" width="10" height="8" rx="1" />
      <line x1="8" y1="4" x2="8" y2="2" />
      <circle cx="8" cy="1.5" r="0.8" fill="currentColor" stroke="none" />
      <line x1="5.5" y1="7" x2="10.5" y2="7" strokeWidth="1" />
      <line x1="5.5" y1="9" x2="10.5" y2="9" strokeWidth="1" />
    </svg>
  );
}

function FragGrenadeIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <circle cx="8" cy="9" r="5" />
      <rect x="6.5" y="2" width="3" height="3" rx="0.5" />
      <line x1="9.5" y1="3" x2="11" y2="1.5" />
    </svg>
  );
}

function StunGrenadeIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <circle cx="8" cy="9" r="4.5" />
      <rect x="6.5" y="2.5" width="3" height="2.5" rx="0.5" />
      <line x1="9.5" y1="3.5" x2="11" y2="2" />
      <line x1="3" y1="6" x2="1.5" y2="4.5" strokeWidth="1" />
      <line x1="13" y1="6" x2="14.5" y2="4.5" strokeWidth="1" />
      <line x1="8" y1="4.5" x2="8" y2="3" strokeWidth="1" />
    </svg>
  );
}

function EMPGrenadeIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <circle cx="8" cy="9" r="5" />
      <path d="M6 8 L8 6 L10 8 L8 10 Z" />
      <rect x="6.5" y="2" width="3" height="3" rx="0.5" />
    </svg>
  );
}

function HeartbeatIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <rect x="2" y="3" width="12" height="10" rx="2" />
      <polyline points="4,8 6,8 7,5 8,11 9,8 12,8" strokeWidth="1.2" />
    </svg>
  );
}

function ShieldIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <path d="M8 1 L14 4 L14 8 C14 12 8 15 8 15 C8 15 2 12 2 8 L2 4 Z" />
    </svg>
  );
}

function ChargeIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <polygon points="9,1 4,9 7.5,9 7,15 12,7 8.5,7" fill="currentColor" />
    </svg>
  );
}

function DroneAltIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <rect x="4" y="6" width="8" height="5" rx="2" />
      <circle cx="5" cy="4" r="2" />
      <circle cx="11" cy="4" r="2" />
      <line x1="6" y1="6" x2="5" y2="4.5" strokeWidth="1" />
      <line x1="10" y1="6" x2="11" y2="4.5" strokeWidth="1" />
    </svg>
  );
}

function CameraIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <rect x="2" y="4" width="12" height="9" rx="1" />
      <circle cx="8" cy="8.5" r="2.5" />
      <rect x="5" y="2" width="6" height="2" rx="0.5" />
    </svg>
  );
}

function GunIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <path d="M1 6 L12 6 L14 4 L14 8 L12 8 L10 8 L10 12 L7 12 L7 8 L1 8 Z" />
    </svg>
  );
}

function TrapIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <path d="M2 12 L4 6 L8 4 L12 6 L14 12" />
      <path d="M4 12 L6 9 L8 8 L10 9 L12 12" strokeWidth="1" />
      <line x1="2" y1="12" x2="14" y2="12" />
    </svg>
  );
}

function MineIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <circle cx="8" cy="8" r="4" />
      <line x1="8" y1="2" x2="8" y2="4" strokeWidth="1" />
      <line x1="8" y1="12" x2="8" y2="14" strokeWidth="1" />
      <line x1="2" y1="8" x2="4" y2="8" strokeWidth="1" />
      <line x1="12" y1="8" x2="14" y2="8" strokeWidth="1" />
      <circle cx="8" cy="8" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function LauncherIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <rect x="2" y="5" width="10" height="6" rx="1" />
      <line x1="12" y1="7" x2="15" y2="7" />
      <line x1="12" y1="9" x2="15" y2="9" />
      <rect x="3" y="7" width="3" height="2" rx="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function DefaultGadgetIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <circle cx="8" cy="8" r="6" />
      <line x1="8" y1="5" x2="8" y2="9" />
      <circle cx="8" cy="11" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

/**
 * Maps gadget names (lowercased) to SVG icon components.
 * For gadgets not in this map AND without an uploaded icon, a generic icon is shown.
 */
const GADGET_ICON_MAP: Record<string, React.FC<IconProps>> = {
  'reinforcement': ReinforcementIcon,
  'rappel': RappelIcon,
  'objective': ObjectiveIcon,
  'breaching charge': BreachingChargeIcon,
  'frag grenade': FragGrenadeIcon,
  'stun grenade': StunGrenadeIcon,
  'emp grenade': EMPGrenadeIcon,
  'heartbeat sensor': HeartbeatIcon,
  'flash shield': ShieldIcon,
  'extendable shield': ShieldIcon,
  'exothermic charge': ChargeIcon,
  'shock drone': DroneAltIcon,
  'glance smart glasses': CameraIcon,
  'mounted lmg': GunIcon,
  'welcome mat': TrapIcon,
  'gu mine': MineIcon,
  'grzmot mine': MineIcon,
  'edd': TrapIcon,
  'airjab launcher': LauncherIcon,
  'pest launcher': LauncherIcon,
  'argus launcher': LauncherIcon,
  'kawan hive launcher': LauncherIcon,
  'd.o.m. panel launcher': LauncherIcon,
  'stim pistol': ChargeIcon,
  'candela': StunGrenadeIcon,
  'cluster charge': ChargeIcon,
  'x-kairos': ChargeIcon,
  'skeleton key': GunIcon,
  'breaching round': ChargeIcon,
  'lv explosive lance': ChargeIcon,
  'smelting torch': ChargeIcon,
  'bu-gi auto-breacher': ChargeIcon,
  'rce-ratero charge': ChargeIcon,
  'logic bomb': EMPGrenadeIcon,
  'erc-7': DroneAltIcon,
  'kludge drone': DroneAltIcon,
  'eyenox': CameraIcon,
  'electronics detector': CameraIcon,
  'spec-io electro-sensor': CameraIcon,
  'flip sight': CameraIcon,
  'cce shield': ShieldIcon,
  'talon-8 clear shield': ShieldIcon,
  'volcan shield': ShieldIcon,
  'armor pack': ShieldIcon,
  'kiba barrier': ShieldIcon,
  'rtila electroclaw': ChargeIcon,
  'black mirror': ReinforcementIcon,
  'kona station': HeartbeatIcon,
  'surya laser gate': TrapIcon,
  'trax stingers': TrapIcon,
  'f-natt dread mine': MineIcon,
  'razorbloom shell': MineIcon,
  'banshee sonic defence': MineIcon,
  'hel presence reduction': CameraIcon,
  'silent step': RappelIcon,
  'garra hook': RappelIcon,
  'adrenal surge': ChargeIcon,
  'remah dash': ChargeIcon,
  'mag-net system': TrapIcon,
  'gemini replicator': DroneAltIcon,
  'r.o.u. projector system': DroneAltIcon,
  'deathmark': CameraIcon,
  'v10 pantheon shell': ShieldIcon,
  's.e.l.m.a. aqua breacher': ChargeIcon,
  'taps mk iii': HeartbeatIcon,
  'the caber': ChargeIcon,
  'micro crossbow': LauncherIcon,
  't.r.i.p. connector': TrapIcon,
  'zoto canister': MineIcon,
  'ee-one-d': DroneAltIcon,
  'ks79 lifeline': LauncherIcon,
};

export function getGadgetFallbackIcon(gadgetName: string): React.FC<IconProps> {
  return GADGET_ICON_MAP[gadgetName.toLowerCase()] ?? DefaultGadgetIcon;
}
