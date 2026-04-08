import type { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import type { TokenPayload } from '@nd-battleplanner/shared';
import { COLORS_ARRAY } from '@nd-battleplanner/shared';
import { setupRoomHandlers } from './handlers/room.js';
import { setupDrawingHandlers } from './handlers/drawing.js';
import { setupCursorHandlers } from './handlers/cursor.js';
import { setupChatHandlers } from './handlers/chat.js';
import { setupStratHandlers } from './handlers/strat.js';
import { db } from '../db/connection.js';
import { users } from '../db/schema/index.js';
import { eq } from 'drizzle-orm';

interface RoomState {
  users: Map<string, { userId: string; username: string; socketId: string; color: string }>;
  colorIndex: number;
}

export const roomStates = new Map<string, RoomState>();

export function getRoomState(connectionString: string): RoomState {
  let state = roomStates.get(connectionString);
  if (!state) {
    state = { users: new Map(), colorIndex: 0 };
    roomStates.set(connectionString, state);
  }
  return state;
}

export function assignColor(state: RoomState): string {
  const color = COLORS_ARRAY[state.colorIndex % COLORS_ARRAY.length];
  state.colorIndex++;
  return color;
}

export function setupSocket(io: Server) {
  // Auth middleware — require valid JWT token (no guests)
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
      const [user] = await db.select({ id: users.id, username: users.username })
        .from(users).where(eq(users.id, payload.userId));

      if (!user) return next(new Error('User not found'));

      (socket as any).userId = user.id;
      (socket as any).username = user.username;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = (socket as any).userId as string;
    const username = (socket as any).username as string;

    console.log(`Socket connected: ${username} (${socket.id})`);

    setupRoomHandlers(io, socket, userId, username);
    setupDrawingHandlers(io, socket, userId);
    setupCursorHandlers(io, socket, userId);
    setupChatHandlers(io, socket, userId, username);
    setupStratHandlers(io, socket, userId);

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${username} (${socket.id})`);

      // Remove from all rooms
      for (const [connString, state] of roomStates) {
        if (state.users.has(socket.id)) {
          state.users.delete(socket.id);
          io.to(connString).emit('room:user-left', { userId });

          if (state.users.size === 0) {
            roomStates.delete(connString);
          }
        }
      }
    });
  });
}
