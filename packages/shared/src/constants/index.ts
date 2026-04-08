export const APP_NAME = 'NextDestiny BattlePlanner';
export const APP_VERSION = '3.0.0';

export const COLORS_ARRAY = [
  '#FF0000', // Red
  '#00FF00', // Green
  '#0000FF', // Blue
  '#FFFF00', // Yellow
  '#FF00FF', // Magenta
  '#00FFFF', // Cyan
  '#FF8000', // Orange
  '#8000FF', // Purple
  '#FF0080', // Pink
  '#00FF80', // Teal
] as const;

export const DEFAULT_LINE_WIDTH = 1;
export const DEFAULT_FONT_SIZE = 16;
export const DEFAULT_ICON_SIZE = 20;
export const DEFAULT_COLOR = '#FF0000';

export const MAX_OPERATOR_SLOTS = 5;
export const SLOT_SIDES = ['defender', 'attacker'] as const;

export const CURSOR_THROTTLE_MS = 60;
export const CURSOR_TIMEOUT_MS = 30000;

export const ACCESS_TOKEN_EXPIRY = '15m';
export const REFRESH_TOKEN_EXPIRY_SECONDS = 7 * 24 * 60 * 60; // 7 days

export const DRAW_TYPES = ['path', 'line', 'rectangle', 'text', 'icon'] as const;

export const GADGET_CATEGORIES = ['unique', 'secondary', 'general'] as const;

export const USER_ROLES = ['admin', 'user'] as const;

export const ZOOM_MIN = 0.25;
export const ZOOM_MAX = 4;
export const ZOOM_STEP = 0.1;

export const DISCORD_SCOPES = 'identify guilds.members.read';
