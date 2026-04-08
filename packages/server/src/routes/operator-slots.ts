import type { FastifyInstance } from 'fastify';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../db/connection.js';
import { operatorSlots, operators } from '../db/schema/index.js';
import { requireAuth } from '../middleware/auth.js';

export default async function operatorSlotsRoutes(fastify: FastifyInstance) {
  // POST /api/operator-slots/:id (update operator assignment)
  fastify.post('/operator-slots/:id', { preHandler: [requireAuth] }, async (request, reply) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
    const { operatorId, operatorName } = z.object({
      operatorId: z.string().uuid().nullable().optional(),
      operatorName: z.string().nullable().optional(),
    }).parse(request.body);

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (operatorId !== undefined) updateData.operatorId = operatorId;
    if (operatorName !== undefined) updateData.operatorName = operatorName;

    const [slot] = await db.update(operatorSlots).set(updateData).where(eq(operatorSlots.id, id)).returning();

    if (!slot) return reply.status(404).send({ error: 'Not Found', message: 'Slot not found', statusCode: 404 });

    let operator = null;
    if (slot.operatorId) {
      const [op] = await db.select().from(operators).where(eq(operators.id, slot.operatorId));
      operator = op || null;
    }

    return { data: { ...slot, operator } };
  });

  // POST /api/operator-slots/:id/loadout
  fastify.post('/operator-slots/:id/loadout', { preHandler: [requireAuth] }, async (request, reply) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
    const body = z.object({
      primaryWeapon: z.string().nullable().optional(),
      secondaryWeapon: z.string().nullable().optional(),
      primaryEquipment: z.string().nullable().optional(),
      secondaryEquipment: z.string().nullable().optional(),
    }).parse(request.body);

    const [slot] = await db.update(operatorSlots).set({
      ...body,
      updatedAt: new Date(),
    }).where(eq(operatorSlots.id, id)).returning();

    if (!slot) return reply.status(404).send({ error: 'Not Found', message: 'Slot not found', statusCode: 404 });
    return { data: slot };
  });

  // POST /api/operator-slots/:id/color
  fastify.post('/operator-slots/:id/color', { preHandler: [requireAuth] }, async (request, reply) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
    const { color } = z.object({
      color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    }).parse(request.body);

    const [slot] = await db.update(operatorSlots).set({
      color,
      updatedAt: new Date(),
    }).where(eq(operatorSlots.id, id)).returning();

    if (!slot) return reply.status(404).send({ error: 'Not Found', message: 'Slot not found', statusCode: 404 });
    return { data: slot };
  });

  // POST /api/operator-slots/:id/visibility
  fastify.post('/operator-slots/:id/visibility', { preHandler: [requireAuth] }, async (request, reply) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
    const { visible } = z.object({
      visible: z.boolean(),
    }).parse(request.body);

    const [slot] = await db.update(operatorSlots).set({
      visible,
      updatedAt: new Date(),
    }).where(eq(operatorSlots.id, id)).returning();

    if (!slot) return reply.status(404).send({ error: 'Not Found', message: 'Slot not found', statusCode: 404 });
    return { data: slot };
  });
}
