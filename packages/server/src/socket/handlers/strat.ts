import type { Server, Socket } from 'socket.io';
import { roomStates } from '../index.js';

export function setupStratHandlers(io: Server, socket: Socket, userId: string) {
  // Phase events — broadcast only (persistence via REST)
  socket.on('strat:phase-create', (data) => {
    const connString = getSocketRoom(socket);
    if (!connString || (socket as any).isGuest) return;
    socket.to(connString).emit('strat:phase-created', { userId, ...data });
  });

  socket.on('strat:phase-update', (data) => {
    const connString = getSocketRoom(socket);
    if (!connString || (socket as any).isGuest) return;
    socket.to(connString).emit('strat:phase-updated', { userId, ...data });
  });

  socket.on('strat:phase-delete', (data) => {
    const connString = getSocketRoom(socket);
    if (!connString || (socket as any).isGuest) return;
    socket.to(connString).emit('strat:phase-deleted', { userId, ...data });
  });

  socket.on('strat:phase-switch', (data) => {
    const connString = getSocketRoom(socket);
    if (!connString || (socket as any).isGuest) return;
    socket.to(connString).emit('strat:phase-switched', { userId, ...data });
  });

  // Ban events
  socket.on('strat:ban-update', (data) => {
    const connString = getSocketRoom(socket);
    if (!connString || (socket as any).isGuest) return;
    socket.to(connString).emit('strat:ban-updated', { userId, ...data });
  });

  socket.on('strat:ban-remove', (data) => {
    const connString = getSocketRoom(socket);
    if (!connString || (socket as any).isGuest) return;
    socket.to(connString).emit('strat:ban-removed', { userId, ...data });
  });

  // Config events
  socket.on('strat:config-update', (data) => {
    const connString = getSocketRoom(socket);
    if (!connString || (socket as any).isGuest) return;
    socket.to(connString).emit('strat:config-updated', { userId, ...data });
  });

  // Loadout events
  socket.on('strat:loadout-update', (data) => {
    const connString = getSocketRoom(socket);
    if (!connString || (socket as any).isGuest) return;
    socket.to(connString).emit('strat:loadout-updated', { userId, ...data });
  });

  // Visibility events
  socket.on('strat:visibility-toggle', (data) => {
    const connString = getSocketRoom(socket);
    if (!connString || (socket as any).isGuest) return;
    socket.to(connString).emit('strat:visibility-toggled', { userId, ...data });
  });

  // Color events
  socket.on('strat:color-update', (data) => {
    const connString = getSocketRoom(socket);
    if (!connString || (socket as any).isGuest) return;
    socket.to(connString).emit('strat:color-updated', { userId, ...data });
  });

  // Operator slot assignment
  socket.on('strat:slot-update', (data) => {
    const connString = getSocketRoom(socket);
    if (!connString || (socket as any).isGuest) return;
    socket.to(connString).emit('strat:slot-updated', { userId, ...data });
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
