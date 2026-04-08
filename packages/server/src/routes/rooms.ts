import type { FastifyInstance } from 'fastify';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { nanoid } from 'nanoid';
import { db } from '../db/connection.js';
import { rooms, battleplans, battleplanFloors, mapFloors, operatorSlots } from '../db/schema/index.js';
import { requireAuth, requireTeamAccess } from '../middleware/auth.js';
import { MAX_OPERATOR_SLOTS } from '@nd-battleplanner/shared';

export default async function roomsRoutes(fastify: FastifyInstance) {
  // POST /api/rooms
  fastify.post('/', { preHandler: [requireAuth, requireTeamAccess] }, async (request, reply) => {
    const body = z.object({
      battleplanId: z.string().uuid().optional(),
      gameId: z.string().uuid().optional(),
      mapId: z.string().uuid().optional(),
    }).parse(request.body);

    let battleplanId = body.battleplanId;

    // Auto-create battleplan if gameId + mapId provided
    if (!battleplanId && body.gameId && body.mapId) {
      const [plan] = await db.insert(battleplans).values({
        ownerId: request.user!.userId,
        teamId: request.teamId!,
        gameId: body.gameId,
        mapId: body.mapId,
        name: 'Room Plan',
      }).returning();

      const floors = await db.select().from(mapFloors).where(eq(mapFloors.mapId, body.mapId)).orderBy(mapFloors.floorNumber);
      for (const floor of floors) {
        await db.insert(battleplanFloors).values({
          battleplanId: plan.id,
          mapFloorId: floor.id,
        });
      }

      for (let i = 1; i <= MAX_OPERATOR_SLOTS; i++) {
        await db.insert(operatorSlots).values({
          battleplanId: plan.id,
          slotNumber: i,
          side: 'defender',
        });
      }

      battleplanId = plan.id;
    }

    const [room] = await db.insert(rooms).values({
      ownerId: request.user!.userId,
      teamId: request.teamId!,
      battleplanId,
      connectionString: nanoid(12),
    }).returning();

    return reply.status(201).send({ data: room });
  });

  // GET /api/rooms/:connString
  fastify.get('/:connString', { preHandler: [requireAuth, requireTeamAccess] }, async (request, reply) => {
    const { connString } = z.object({ connString: z.string() }).parse(request.params);
    const [room] = await db.select().from(rooms).where(eq(rooms.connectionString, connString));
    if (!room) return reply.status(404).send({ error: 'Not Found', message: 'Room not found', statusCode: 404 });

    // Verify team access
    if (room.teamId !== request.teamId) {
      return reply.status(404).send({ error: 'Not Found', message: 'Room not found', statusCode: 404 });
    }

    return { data: room };
  });

  // POST /api/rooms/:connString/battleplan (update)
  fastify.post('/:connString/battleplan', { preHandler: [requireAuth, requireTeamAccess] }, async (request, reply) => {
    const { connString } = z.object({ connString: z.string() }).parse(request.params);
    const { battleplanId } = z.object({ battleplanId: z.string().uuid().nullable() }).parse(request.body);

    const [room] = await db.select().from(rooms).where(eq(rooms.connectionString, connString));
    if (!room) return reply.status(404).send({ error: 'Not Found', message: 'Room not found', statusCode: 404 });

    if (room.ownerId !== request.user!.userId) {
      return reply.status(403).send({ error: 'Forbidden', message: 'Only room owner can change battleplan', statusCode: 403 });
    }

    const [updated] = await db.update(rooms).set({ battleplanId, updatedAt: new Date() })
      .where(eq(rooms.connectionString, connString)).returning();

    return { data: updated };
  });

  // POST /api/rooms/:connString/delete
  fastify.post('/:connString/delete', { preHandler: [requireAuth, requireTeamAccess] }, async (request, reply) => {
    const { connString } = z.object({ connString: z.string() }).parse(request.params);
    const [room] = await db.select().from(rooms).where(eq(rooms.connectionString, connString));
    if (!room) return reply.status(404).send({ error: 'Not Found', message: 'Room not found', statusCode: 404 });

    if (room.teamId !== request.teamId) {
      return reply.status(404).send({ error: 'Not Found', message: 'Room not found', statusCode: 404 });
    }

    if (room.ownerId !== request.user!.userId && request.user!.role !== 'admin') {
      return reply.status(403).send({ error: 'Forbidden', message: 'Not authorized', statusCode: 403 });
    }

    await db.delete(rooms).where(eq(rooms.connectionString, connString));
    return { message: 'Room deleted' };
  });
}
