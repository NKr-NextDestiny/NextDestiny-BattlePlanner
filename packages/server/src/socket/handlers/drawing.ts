import type { Server, Socket } from 'socket.io';
import { roomStates } from '../index.js';

export function setupDrawingHandlers(io: Server, socket: Socket, userId: string) {
  // Broadcast only — persistence is handled by REST API to avoid duplicate inserts
  socket.on('draw:create', ({ battleplanFloorId, draws: drawItems }) => {
    const connString = getSocketRoom(socket);
    if (!connString) return;
    if ((socket as any).isGuest) return;

    socket.to(connString).emit('draw:created', { userId, battleplanFloorId, draws: drawItems });
  });

  socket.on('draw:delete', ({ drawIds }) => {
    const connString = getSocketRoom(socket);
    if (!connString) return;
    if ((socket as any).isGuest) return;

    socket.to(connString).emit('draw:deleted', { userId, drawIds });
  });

  socket.on('draw:update', ({ drawId, data }) => {
    const connString = getSocketRoom(socket);
    if (!connString) return;
    if ((socket as any).isGuest) return;

    socket.to(connString).emit('draw:updated', { userId, drawId, data });
  });

  // Laser pointer — broadcast only, not persisted
  socket.on('laser:line', ({ points, color }) => {
    const connString = getSocketRoom(socket);
    if (!connString) return;

    socket.to(connString).emit('laser:line', { userId, points, color });
  });
}

function getSocketRoom(socket: Socket): string | null {
  for (const [connString, state] of roomStates) {
    if (state.users.has(socket.id)) {
      return connString;
    }
  }
  return null;
}
