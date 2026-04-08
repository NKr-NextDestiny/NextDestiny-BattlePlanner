import type { FastifyInstance } from 'fastify';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../db/connection.js';
import { draws, battleplanFloors } from '../db/schema/index.js';
import { requireAuth } from '../middleware/auth.js';

export default async function drawsRoutes(fastify: FastifyInstance) {
  // POST /api/battleplan-floors/:id/draws
  fastify.post('/battleplan-floors/:id/draws', { preHandler: [requireAuth] }, async (request, reply) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);

    const [floor] = await db.select().from(battleplanFloors).where(eq(battleplanFloors.id, id));
    if (!floor) return reply.status(404).send({ error: 'Not Found', message: 'Floor not found', statusCode: 404 });

    const { items } = z.object({
      items: z.array(z.object({
        type: z.enum(['path', 'line', 'arrow', 'rectangle', 'ellipse', 'text', 'icon']),
        originX: z.number(),
        originY: z.number(),
        destinationX: z.number().optional(),
        destinationY: z.number().optional(),
        data: z.record(z.unknown()),
        phaseId: z.string().uuid().nullable().optional(),
        operatorSlotId: z.string().uuid().nullable().optional(),
      })),
    }).parse(request.body);

    const created = [];
    for (const item of items) {
      const [draw] = await db.insert(draws).values({
        battleplanFloorId: id,
        userId: request.user!.userId,
        type: item.type,
        originX: item.originX,
        originY: item.originY,
        destinationX: item.destinationX,
        destinationY: item.destinationY,
        data: item.data,
        phaseId: item.phaseId ?? null,
        operatorSlotId: item.operatorSlotId ?? null,
      }).returning();
      created.push(draw);
    }

    return reply.status(201).send({ data: created });
  });

  // POST /api/draws/:id (update)
  fastify.post('/draws/:id', { preHandler: [requireAuth] }, async (request, reply) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
    const body = z.object({
      originX: z.number().optional(),
      originY: z.number().optional(),
      destinationX: z.number().optional(),
      destinationY: z.number().optional(),
      data: z.record(z.unknown()).optional(),
    }).parse(request.body);

    // Ownership check
    const [existing] = await db.select().from(draws).where(eq(draws.id, id));
    if (!existing) return reply.status(404).send({ error: 'Not Found', message: 'Draw not found', statusCode: 404 });
    if (existing.userId && existing.userId !== request.user!.userId) {
      return reply.status(403).send({ error: 'Forbidden', message: 'Cannot modify another user\'s draw', statusCode: 403 });
    }

    const [draw] = await db.update(draws).set({ ...body, updatedAt: new Date() }).where(eq(draws.id, id)).returning();
    return { data: draw };
  });

  // POST /api/draws/:id/delete
  fastify.post('/draws/:id/delete', { preHandler: [requireAuth] }, async (request, reply) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);

    // Ownership check
    const [existing] = await db.select().from(draws).where(eq(draws.id, id));
    if (!existing) return reply.status(404).send({ error: 'Not Found', message: 'Draw not found', statusCode: 404 });
    if (existing.userId && existing.userId !== request.user!.userId) {
      return reply.status(403).send({ error: 'Forbidden', message: 'Cannot delete another user\'s draw', statusCode: 403 });
    }

    const [draw] = await db.update(draws).set({ isDeleted: true, updatedAt: new Date() }).where(eq(draws.id, id)).returning();
    return { data: draw };
  });
}
