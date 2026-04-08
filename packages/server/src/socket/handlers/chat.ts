import type { Server, Socket } from 'socket.io';
import { roomStates } from '../index.js';

export function setupChatHandlers(io: Server, socket: Socket, userId: string, username: string) {
  socket.on('chat:message', ({ text }) => {
    if (!text || typeof text !== 'string' || text.trim().length === 0) return;
    if (text.length > 500) return;

    // Find the room this socket belongs to
    for (const [connString, state] of roomStates) {
      const user = state.users.get(socket.id);
      if (user) {
        io.to(connString).emit('chat:messaged', {
          userId,
          username,
          text: text.trim(),
          timestamp: Date.now(),
          color: user.color,
        });
        break;
      }
    }
  });
}
