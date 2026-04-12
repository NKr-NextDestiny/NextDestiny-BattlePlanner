import type { Server, Socket } from 'socket.io';
import type { RoomUserRole } from '@nd-battleplanner/shared';
import { getRoomState, getUserRole, assignColor, roomStates } from '../index.js';
import { db } from '../../db/connection.js';
import { rooms, battleplans, battleplanFloors, draws, operatorSlots, mapFloors, operators } from '../../db/schema/index.js';
import { eq, and } from 'drizzle-orm';

export function setupRoomHandlers(io: Server, socket: Socket, userId: string, username: string) {
  socket.on('room:join', async ({ connectionString }) => {
    try {
      // Verify room exists
      const [room] = await db.select().from(rooms).where(eq(rooms.connectionString, connectionString));
      if (!room) {
        socket.emit('error', { message: 'Room not found' });
        return;
      }

      socket.join(connectionString);
      const state = getRoomState(connectionString);
      const color = assignColor(state);

      // Set owner on first join or if this user owns the room
      if (state.ownerId === null) {
        state.ownerId = room.ownerId;
      }

      // Assign role: owner gets 'owner', others get existing permission or 'editor'
      const isOwner = userId === room.ownerId;
      if (isOwner) {
        state.permissions.set(userId, 'owner');
      } else if (!state.permissions.has(userId)) {
        state.permissions.set(userId, 'editor');
      }

      state.users.set(socket.id, { userId, username, socketId: socket.id, color });

      const usersList = Array.from(state.users.values()).map(u => ({
        userId: u.userId,
        username: u.username,
        color: u.color,
        role: getUserRole(state, u.userId),
      }));

      const myRole = getUserRole(state, userId);

      // Send room state to joining user
      socket.emit('room:joined', { userId, color, users: usersList, role: myRole });

      // Notify others
      socket.to(connectionString).emit('room:user-joined', { userId, username, color, role: myRole });
    } catch (err) {
      console.error('Error joining room:', err);
      socket.emit('error', { message: 'Failed to join room' });
    }
  });

  socket.on('room:leave', ({ connectionString }) => {
    socket.leave(connectionString);
    const state = roomStates.get(connectionString);
    if (state) {
      state.users.delete(socket.id);
      io.to(connectionString).emit('room:user-left', { userId });

      if (state.users.size === 0) {
        roomStates.delete(connectionString);
      }
    }
  });

  // Permission update — only owner can change roles
  socket.on('room:permission-update', ({ targetUserId, role }: { targetUserId: string; role: RoomUserRole }) => {
    for (const [connString, state] of roomStates) {
      if (state.users.has(socket.id)) {
        const senderRole = getUserRole(state, userId);
        if (senderRole !== 'owner') {
          socket.emit('error', { message: 'Only the room owner can change permissions' });
          return;
        }
        // Cannot change owner's own role
        if (targetUserId === userId) return;
        // Only allow setting editor or viewer
        if (role !== 'editor' && role !== 'viewer') return;

        state.permissions.set(targetUserId, role);
        io.to(connString).emit('room:permission-updated', { userId: targetUserId, role });
        break;
      }
    }
  });

  socket.on('battleplan:change', async ({ battleplanId }) => {
    // Find which room this socket is in
    for (const [connString, state] of roomStates) {
      if (state.users.has(socket.id)) {
        try {
          // Update room's battleplan
          await db.update(rooms).set({ battleplanId, updatedAt: new Date() })
            .where(eq(rooms.connectionString, connString));

          // Fetch full battleplan data
          const [plan] = await db.select().from(battleplans).where(eq(battleplans.id, battleplanId));
          if (plan) {
            const floors = await db.select().from(battleplanFloors).where(eq(battleplanFloors.battleplanId, battleplanId));
            const floorsWithData = await Promise.all(floors.map(async (floor) => {
              const [mapFloor] = await db.select().from(mapFloors).where(eq(mapFloors.id, floor.mapFloorId));
              const floorDraws = await db.select().from(draws)
                .where(and(eq(draws.battleplanFloorId, floor.id), eq(draws.isDeleted, false)));
              return { ...floor, mapFloor, draws: floorDraws };
            }));

            const slots = await db.select().from(operatorSlots)
              .where(eq(operatorSlots.battleplanId, battleplanId))
              .orderBy(operatorSlots.slotNumber);

            const slotsWithOperators = await Promise.all(slots.map(async (slot) => {
              let operator = null;
              if (slot.operatorId) {
                const [op] = await db.select().from(operators).where(eq(operators.id, slot.operatorId));
                operator = op || null;
              }
              return { ...slot, operator };
            }));

            io.to(connString).emit('battleplan:changed', {
              battleplan: { ...plan, floors: floorsWithData, operatorSlots: slotsWithOperators },
            });
          }
        } catch (err) {
          console.error('Error changing battleplan:', err);
        }
        break;
      }
    }
  });
}
