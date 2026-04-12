import type { FastifyInstance } from 'fastify';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../db/connection.js';
import { draws, battleplanFloors, battleplans } from '../db/schema/index.js';
import { requireAuth, requireTeamAccess } from '../middleware/auth.js';

export default async function drawsRoutes(fastify: FastifyInstance) {
  // POST /api/battleplan-floors/:id/draws
  fastify.post('/battleplan-floors/:id/draws', { preHandler: [requireAuth, requireTeamAccess] }, async (request, reply) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);

    const [floor] = await db.select().from(battleplanFloors).where(eq(battleplanFloors.id, id));
    if (!floor) return reply.status(404).send({ error: 'Not Found', message: 'Floor not found', statusCode: 404 });

    // Verify team access via battleplan
    const [plan] = await db.select({ teamId: battleplans.teamId }).from(battleplans).where(eq(battleplans.id, floor.battleplanId));
    if (!plan || plan.teamId !== request.teamId) {
      return reply.status(404).send({ error: 'Not Found', message: 'Floor not found', statusCode: 404 });
    }

    const { items } = z.object({
      items: z.array(z.object({
        type: z.enum(['path', 'line', 'arrow', 'rectangle', 'ellipse', 'text', 'icon']),
        originX: z.number(),
        originY: z.number(),
        destinationX: z.number().optional(),
        destinationY: z.number().optional(),
        data: z.record(z.string(), z.unknown()),
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
  fastify.post('/draws/:id', { preHandler: [requireAuth, requireTeamAccess] }, async (request, reply) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
    const body = z.object({
      originX: z.number().optional(),
      originY: z.number().optional(),
      destinationX: z.number().optional(),
      destinationY: z.number().optional(),
      data: z.record(z.string(), z.unknown()).optional(),
    }).parse(request.body);

    // Ownership check
    const [existing] = await db.select().from(draws).where(eq(draws.id, id));
    if (!existing) return reply.status(404).send({ error: 'Not Found', message: 'Draw not found', statusCode: 404 });

    // Verify team access via floor → battleplan
    const [floor] = await db.select().from(battleplanFloors).where(eq(battleplanFloors.id, existing.battleplanFloorId));
    if (floor) {
      const [plan] = await db.select({ teamId: battleplans.teamId }).from(battleplans).where(eq(battleplans.id, floor.battleplanId));
      if (!plan || plan.teamId !== request.teamId) {
        return reply.status(404).send({ error: 'Not Found', message: 'Draw not found', statusCode: 404 });
      }
    }
    if (existing.userId && existing.userId !== request.user!.userId) {
      return reply.status(403).send({ error: 'Forbidden', message: 'Cannot modify another user\'s draw', statusCode: 403 });
    }

    const [draw] = await db.update(draws).set({ ...body, updatedAt: new Date() }).where(eq(draws.id, id)).returning();
    return { data: draw };
  });

  // POST /api/draws/:id/delete
  fastify.post('/draws/:id/delete', { preHandler: [requireAuth, requireTeamAccess] }, async (request, reply) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);

    // Ownership check
    const [existing] = await db.select().from(draws).where(eq(draws.id, id));
    if (!existing) return reply.status(404).send({ error: 'Not Found', message: 'Draw not found', statusCode: 404 });

    // Verify team access via floor → battleplan
    const [floor] = await db.select().from(battleplanFloors).where(eq(battleplanFloors.id, existing.battleplanFloorId));
    if (floor) {
      const [plan] = await db.select({ teamId: battleplans.teamId }).from(battleplans).where(eq(battleplans.id, floor.battleplanId));
      if (!plan || plan.teamId !== request.teamId) {
        return reply.status(404).send({ error: 'Not Found', message: 'Draw not found', statusCode: 404 });
      }
    }
    if (existing.userId && existing.userId !== request.user!.userId) {
      return reply.status(403).send({ error: 'Forbidden', message: 'Cannot delete another user\'s draw', statusCode: 403 });
    }

    const [draw] = await db.update(draws).set({ isDeleted: true, updatedAt: new Date() }).where(eq(draws.id, id)).returning();
    return { data: draw };
  });

  // POST /api/battleplan-floors/:id/draws/clear — batch soft-delete draws for the current user
  fastify.post('/battleplan-floors/:id/draws/clear', { preHandler: [requireAuth, requireTeamAccess] }, async (request, reply) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);

    const [floor] = await db.select().from(battleplanFloors).where(eq(battleplanFloors.id, id));
    if (!floor) return reply.status(404).send({ error: 'Not Found', message: 'Floor not found', statusCode: 404 });

    const [plan] = await db.select({ teamId: battleplans.teamId }).from(battleplans).where(eq(battleplans.id, floor.battleplanId));
    if (!plan || plan.teamId !== request.teamId) {
      return reply.status(404).send({ error: 'Not Found', message: 'Floor not found', statusCode: 404 });
    }

    await db.update(draws).set({ isDeleted: true, updatedAt: new Date() }).where(
      and(
        eq(draws.battleplanFloorId, id),
        eq(draws.userId, request.user!.userId),
        eq(draws.isDeleted, false),
      ),
    );

    return { message: 'Floor cleared' };
  });
}
