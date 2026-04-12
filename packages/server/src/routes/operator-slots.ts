import type { FastifyInstance } from 'fastify';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../db/connection.js';
import { operatorSlots, operators, battleplans } from '../db/schema/index.js';
import { requireAuth, requireTeamAccess } from '../middleware/auth.js';

async function getAuthorizedSlot(slotId: string, teamId: string) {
  const [slot] = await db.select().from(operatorSlots).where(eq(operatorSlots.id, slotId));
  if (!slot) return null;

  const [plan] = await db.select({
    id: battleplans.id,
    teamId: battleplans.teamId,
  }).from(battleplans).where(eq(battleplans.id, slot.battleplanId));

  if (!plan || plan.teamId !== teamId) return null;

  return slot;
}

export default async function operatorSlotsRoutes(fastify: FastifyInstance) {
  // POST /api/operator-slots/:id (update operator assignment)
  fastify.post('/operator-slots/:id', { preHandler: [requireAuth, requireTeamAccess] }, async (request, reply) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
    const { operatorId, operatorName } = z.object({
      operatorId: z.string().uuid().nullable().optional(),
      operatorName: z.string().nullable().optional(),
    }).parse(request.body);

    const existingSlot = await getAuthorizedSlot(id, request.teamId!);
    if (!existingSlot) {
      return reply.status(404).send({ error: 'Not Found', message: 'Slot not found', statusCode: 404 });
    }

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
  fastify.post('/operator-slots/:id/loadout', { preHandler: [requireAuth, requireTeamAccess] }, async (request, reply) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
    const body = z.object({
      primaryWeapon: z.string().nullable().optional(),
      secondaryWeapon: z.string().nullable().optional(),
      primaryEquipment: z.string().nullable().optional(),
      secondaryEquipment: z.string().nullable().optional(),
    }).parse(request.body);

    const existingSlot = await getAuthorizedSlot(id, request.teamId!);
    if (!existingSlot) {
      return reply.status(404).send({ error: 'Not Found', message: 'Slot not found', statusCode: 404 });
    }

    const [slot] = await db.update(operatorSlots).set({
      ...body,
      updatedAt: new Date(),
    }).where(eq(operatorSlots.id, id)).returning();

    if (!slot) return reply.status(404).send({ error: 'Not Found', message: 'Slot not found', statusCode: 404 });
    return { data: slot };
  });

  // POST /api/operator-slots/:id/color
  fastify.post('/operator-slots/:id/color', { preHandler: [requireAuth, requireTeamAccess] }, async (request, reply) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
    const { color } = z.object({
      color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    }).parse(request.body);

    const existingSlot = await getAuthorizedSlot(id, request.teamId!);
    if (!existingSlot) {
      return reply.status(404).send({ error: 'Not Found', message: 'Slot not found', statusCode: 404 });
    }

    const [slot] = await db.update(operatorSlots).set({
      color,
      updatedAt: new Date(),
    }).where(eq(operatorSlots.id, id)).returning();

    if (!slot) return reply.status(404).send({ error: 'Not Found', message: 'Slot not found', statusCode: 404 });
    return { data: slot };
  });

  // POST /api/operator-slots/:id/visibility
  fastify.post('/operator-slots/:id/visibility', { preHandler: [requireAuth, requireTeamAccess] }, async (request, reply) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
    const { visible } = z.object({
      visible: z.boolean(),
    }).parse(request.body);

    const existingSlot = await getAuthorizedSlot(id, request.teamId!);
    if (!existingSlot) {
      return reply.status(404).send({ error: 'Not Found', message: 'Slot not found', statusCode: 404 });
    }

    const [slot] = await db.update(operatorSlots).set({
      visible,
      updatedAt: new Date(),
    }).where(eq(operatorSlots.id, id)).returning();

    if (!slot) return reply.status(404).send({ error: 'Not Found', message: 'Slot not found', statusCode: 404 });
    return { data: slot };
  });
}
