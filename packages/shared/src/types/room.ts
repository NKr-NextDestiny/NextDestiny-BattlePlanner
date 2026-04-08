export interface Room {
  id: string;
  ownerId: string;
  teamId: string;
  battleplanId: string | null;
  connectionString: string;
  createdAt: string;
  updatedAt: string;
}

export interface RoomUser {
  userId: string;
  username: string;
  color: string;
}

export interface CursorPosition {
  userId: string;
  x: number;
  y: number;
  floorId: string;
  color: string;
  isLaser?: boolean;
}

export interface ChatMessage {
  userId: string;
  username: string;
  text: string;
  timestamp: number;
  color: string;
}

export interface SocketEvents {
  // Client -> Server
  'room:join': { connectionString: string };
  'room:leave': { connectionString: string };
  'cursor:move': { x: number; y: number; floorId: string; isLaser?: boolean };
  'draw:create': { battleplanFloorId: string; draws: CreateDrawPayload[] };
  'draw:delete': { drawIds: string[] };
  'draw:update': { drawId: string; data: Record<string, unknown> };
  'operator-slot:update': { slotId: string; operatorId: string | null };
  'battleplan:change': { battleplanId: string };
  'chat:message': { text: string };
  'attacker-lineup:create': { battleplanId: string };

  // Server -> Client
  'room:joined': { userId: string; color: string; users: RoomUser[] };
  'room:user-joined': { userId: string; username: string; color: string };
  'room:user-left': { userId: string };
  'cursor:moved': CursorPosition;
  'draw:created': { userId: string; draws: unknown[] };
  'draw:deleted': { userId: string; drawIds: string[] };
  'draw:updated': { userId: string; drawId: string; data: Record<string, unknown> };
  'operator-slot:updated': { slotId: string; operatorId: string | null; operator: unknown; side: string };
  'attacker-lineup:created': { battleplanId: string };
  'battleplan:changed': { battleplan: unknown };
  'chat:messaged': ChatMessage;
}

export interface CreateDrawPayload {
  type: string;
  originX: number;
  originY: number;
  destinationX?: number;
  destinationY?: number;
  data: Record<string, unknown>;
}
