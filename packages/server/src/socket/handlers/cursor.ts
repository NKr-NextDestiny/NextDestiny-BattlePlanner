import type { Server, Socket } from 'socket.io';
import { roomStates } from '../index.js';

export function setupCursorHandlers(io: Server, socket: Socket, userId: string) {
  socket.on('cursor:move', ({ x, y, floorId, isLaser }) => {
    // Find room and broadcast cursor to others
    for (const [connString, state] of roomStates) {
      const user = state.users.get(socket.id);
      if (user) {
        socket.to(connString).emit('cursor:moved', {
          userId,
          x,
          y,
          floorId,
          color: user.color,
          isLaser: isLaser || false,
        });
        break;
      }
    }
  });

  socket.on('operator-slot:update', async ({ slotId, operatorId }) => {
    const { db } = await import('../../db/connection.js');
    const { operatorSlots, operators } = await import('../../db/schema/index.js');
    const { eq } = await import('drizzle-orm');

    for (const [connString, state] of roomStates) {
      if (state.users.has(socket.id)) {
        try {
          const [slot] = await db.update(operatorSlots).set({
            operatorId,
            updatedAt: new Date(),
          }).where(eq(operatorSlots.id, slotId)).returning();

          let operator = null;
          if (operatorId) {
            const [op] = await db.select().from(operators).where(eq(operators.id, operatorId));
            operator = op || null;
          }

          io.to(connString).emit('operator-slot:updated', {
            slotId,
            operatorId,
            operator,
            side: slot.side,
          });
        } catch (err) {
          console.error('Error updating operator slot:', err);
        }
        break;
      }
    }
  });

  socket.on('attacker-lineup:create', ({ battleplanId }) => {
    for (const [connString, state] of roomStates) {
      if (state.users.has(socket.id)) {
        socket.to(connString).emit('attacker-lineup:created', { battleplanId });
        break;
      }
    }
  });
}
