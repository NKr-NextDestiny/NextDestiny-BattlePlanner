import type { FastifyInstance } from 'fastify';
import { eq, and, desc, sql, count } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../db/connection.js';
import { battleplans, battleplanFloors, battleplanPhases, operatorBans, draws, operatorSlots, maps, mapFloors, votes, users, operators, games } from '../db/schema/index.js';
import { requireAuth, requireTeamAccess } from '../middleware/auth.js';
import { MAX_OPERATOR_SLOTS } from '@nd-battleplanner/shared';

async function getBattleplanWithDetails(id: string, userId?: string) {
  const [plan] = await db.select().from(battleplans).where(eq(battleplans.id, id));
  if (!plan) return null;

  const owner = plan.ownerId
    ? (await db.select({ id: users.id, username: users.username }).from(users).where(eq(users.id, plan.ownerId)))[0] ?? null
    : null;

  const [game] = await db.select({ id: games.id, slug: games.slug, name: games.name })
    .from(games).where(eq(games.id, plan.gameId));

  const [map] = plan.mapId
    ? await db.select({ id: maps.id, name: maps.name, slug: maps.slug })
        .from(maps).where(eq(maps.id, plan.mapId))
    : [null];

  const floors = await db.select().from(battleplanFloors).where(eq(battleplanFloors.battleplanId, id));

  const floorsWithDraws = await Promise.all(floors.map(async (floor) => {
    const [mapFloor] = await db.select().from(mapFloors).where(eq(mapFloors.id, floor.mapFloorId));
    const floorDraws = await db.select().from(draws)
      .where(and(eq(draws.battleplanFloorId, floor.id), eq(draws.isDeleted, false)));
    return { ...floor, mapFloor, draws: floorDraws };
  }));

  const slots = await db.select().from(operatorSlots)
    .where(eq(operatorSlots.battleplanId, id))
    .orderBy(operatorSlots.side, operatorSlots.slotNumber);

  const slotsWithOperators = await Promise.all(slots.map(async (slot) => {
    let operator = null;
    if (slot.operatorId) {
      const [op] = await db.select().from(operators).where(eq(operators.id, slot.operatorId));
      operator = op || null;
    }
    return { ...slot, operator };
  }));

  // Phases
  const phases = await db.select().from(battleplanPhases)
    .where(eq(battleplanPhases.battleplanId, id))
    .orderBy(battleplanPhases.index);

  // Bans
  const bans = await db.select().from(operatorBans)
    .where(eq(operatorBans.battleplanId, id));

  // Vote count
  const voteResult = await db.select({ total: sql<number>`COALESCE(SUM(${votes.value}), 0)` })
    .from(votes).where(eq(votes.battleplanId, id));
  const voteCount = Number(voteResult[0]?.total || 0);

  // User's vote
  let userVote: number | null = null;
  if (userId) {
    const [v] = await db.select().from(votes).where(
      and(eq(votes.battleplanId, id), eq(votes.userId, userId))
    );
    userVote = v?.value ?? null;
  }

  return {
    ...plan,
    owner,
    game,
    map: map || null,
    floors: floorsWithDraws,
    operatorSlots: slotsWithOperators,
    phases,
    bans,
    voteCount,
    userVote,
  };
}

export default async function battleplansRoutes(fastify: FastifyInstance) {
  // GET /api/battleplans - Team battleplans (public within team)
  fastify.get('/', { preHandler: [requireAuth, requireTeamAccess] }, async (request) => {
    const { page = '1', pageSize = '20', gameId, tags: tagsParam } = request.query as Record<string, string>;
    const p = Math.max(1, parseInt(page));
    const ps = Math.min(100, Math.max(1, parseInt(pageSize)));

    const conditions = [eq(battleplans.isPublic, true), eq(battleplans.isSaved, true), eq(battleplans.teamId, request.teamId!)];
    if (gameId) conditions.push(eq(battleplans.gameId, gameId));
    if (tagsParam) {
      const tagList = tagsParam.split(',').map(t => t.trim()).filter(Boolean);
      if (tagList.length > 0) {
        conditions.push(sql`${battleplans.tags} @> ARRAY[${sql.join(tagList.map(t => sql`${t}`), sql`, `)}]::text[]`);
      }
    }

    const whereClause = and(...conditions);

    const [{ total }] = await db.select({ total: count() }).from(battleplans).where(whereClause);

    const result = await db.select().from(battleplans)
      .where(whereClause)
      .orderBy(desc(battleplans.createdAt))
      .limit(ps)
      .offset((p - 1) * ps);

    return {
      data: result,
      total,
      page: p,
      pageSize: ps,
      totalPages: Math.ceil(total / ps),
    };
  });

  // GET /api/battleplans/mine
  fastify.get('/mine', { preHandler: [requireAuth, requireTeamAccess] }, async (request) => {
    const result = await db.select().from(battleplans)
      .where(and(
        eq(battleplans.ownerId, request.user!.userId),
        eq(battleplans.teamId, request.teamId!),
        eq(battleplans.isSaved, true),
      ))
      .orderBy(desc(battleplans.updatedAt));
    return { data: result };
  });

  // POST /api/battleplans
  fastify.post('/', { preHandler: [requireAuth, requireTeamAccess] }, async (request, reply) => {
    const body = z.object({
      gameId: z.string().uuid(),
      mapId: z.string().uuid(),
      name: z.string().min(1).max(255),
      description: z.string().optional(),
      tags: z.array(z.string().max(30)).max(10).optional(),
    }).parse(request.body);

    const [plan] = await db.insert(battleplans).values({
      ownerId: request.user!.userId,
      teamId: request.teamId!,
      gameId: body.gameId,
      mapId: body.mapId,
      name: body.name,
      description: body.description,
      tags: body.tags || [],
    }).returning();

    // Auto-create floors from map
    const floors = await db.select().from(mapFloors).where(eq(mapFloors.mapId, body.mapId)).orderBy(mapFloors.floorNumber);
    for (const floor of floors) {
      await db.insert(battleplanFloors).values({
        battleplanId: plan.id,
        mapFloorId: floor.id,
      });
    }

    // Auto-create defender + attacker operator slots (5 each)
    const defaultColors = ['#FF4444', '#44AAFF', '#44FF44', '#FFAA44', '#AA44FF'];
    for (let i = 1; i <= MAX_OPERATOR_SLOTS; i++) {
      await db.insert(operatorSlots).values({
        battleplanId: plan.id,
        slotNumber: i,
        side: 'defender',
        color: defaultColors[(i - 1) % defaultColors.length],
      });
      await db.insert(operatorSlots).values({
        battleplanId: plan.id,
        slotNumber: i,
        side: 'attacker',
        color: defaultColors[(i - 1) % defaultColors.length],
      });
    }

    // Auto-create default phase
    await db.insert(battleplanPhases).values({
      battleplanId: plan.id,
      index: 0,
      name: 'Action Phase',
    });

    const fullPlan = await getBattleplanWithDetails(plan.id, request.user!.userId);
    return reply.status(201).send({ data: fullPlan });
  });

  // GET /api/battleplans/:id
  fastify.get('/:id', { preHandler: [requireAuth, requireTeamAccess] }, async (request, reply) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
    const plan = await getBattleplanWithDetails(id, request.user?.userId);
    if (!plan) return reply.status(404).send({ error: 'Not Found', message: 'Battleplan not found', statusCode: 404 });

    // Check team access
    if (plan.teamId !== request.teamId) {
      return reply.status(404).send({ error: 'Not Found', message: 'Battleplan not found', statusCode: 404 });
    }

    // Check access within team
    if (plan.isSaved && !plan.isPublic && plan.ownerId !== request.user?.userId && request.user?.role !== 'admin') {
      return reply.status(404).send({ error: 'Not Found', message: 'Battleplan not found', statusCode: 404 });
    }

    return { data: plan };
  });

  // POST /api/battleplans/:id (update)
  fastify.post('/:id', { preHandler: [requireAuth, requireTeamAccess] }, async (request, reply) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
    const body = z.object({
      name: z.string().min(1).max(255).optional(),
      description: z.string().optional(),
      notes: z.string().optional(),
      tags: z.array(z.string().max(30)).max(10).optional(),
      isPublic: z.boolean().optional(),
      isSaved: z.boolean().optional(),
    }).parse(request.body);

    const [existing] = await db.select().from(battleplans).where(eq(battleplans.id, id));
    if (!existing) return reply.status(404).send({ error: 'Not Found', message: 'Battleplan not found', statusCode: 404 });
    if (existing.ownerId !== request.user!.userId && request.user!.role !== 'admin') {
      return reply.status(403).send({ error: 'Forbidden', message: 'Not authorized', statusCode: 403 });
    }

    const [plan] = await db.update(battleplans).set({ ...body, updatedAt: new Date() }).where(eq(battleplans.id, id)).returning();
    return { data: plan };
  });

  // POST /api/battleplans/:id/delete
  fastify.post('/:id/delete', { preHandler: [requireAuth, requireTeamAccess] }, async (request, reply) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
    const [existing] = await db.select().from(battleplans).where(eq(battleplans.id, id));
    if (!existing) return reply.status(404).send({ error: 'Not Found', message: 'Battleplan not found', statusCode: 404 });
    if (existing.ownerId !== request.user!.userId && request.user!.role !== 'admin') {
      return reply.status(403).send({ error: 'Forbidden', message: 'Not authorized', statusCode: 403 });
    }

    await db.delete(battleplans).where(eq(battleplans.id, id));
    return { message: 'Battleplan deleted' };
  });

  // POST /api/battleplans/:id/copy
  fastify.post('/:id/copy', { preHandler: [requireAuth, requireTeamAccess] }, async (request, reply) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
    const source = await getBattleplanWithDetails(id, request.user!.userId);
    if (!source) return reply.status(404).send({ error: 'Not Found', message: 'Battleplan not found', statusCode: 404 });

    // Create copy
    const [newPlan] = await db.insert(battleplans).values({
      ownerId: request.user!.userId,
      teamId: request.teamId!,
      gameId: source.gameId,
      mapId: source.mapId,
      name: `${source.name} (Copy)`,
      description: source.description,
      notes: source.notes,
      tags: source.tags || [],
    }).returning();

    // Copy floors and draws
    if (source.floors) {
      for (const floor of source.floors) {
        const [newFloor] = await db.insert(battleplanFloors).values({
          battleplanId: newPlan.id,
          mapFloorId: floor.mapFloorId,
        }).returning();

        if (floor.draws) {
          for (const draw of floor.draws) {
            await db.insert(draws).values({
              battleplanFloorId: newFloor.id,
              userId: request.user!.userId,
              type: draw.type,
              originX: draw.originX,
              originY: draw.originY,
              destinationX: draw.destinationX,
              destinationY: draw.destinationY,
              data: draw.data,
            });
          }
        }
      }
    }

    // Copy operator slots (including side)
    if (source.operatorSlots) {
      for (const slot of source.operatorSlots) {
        await db.insert(operatorSlots).values({
          battleplanId: newPlan.id,
          slotNumber: slot.slotNumber,
          operatorId: slot.operatorId,
          side: slot.side,
        });
      }
    }

    const fullPlan = await getBattleplanWithDetails(newPlan.id, request.user!.userId);
    return reply.status(201).send({ data: fullPlan });
  });

  // POST /api/battleplans/:id/attacker-lineup
  fastify.post('/:id/attacker-lineup', { preHandler: [requireAuth, requireTeamAccess] }, async (request, reply) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
    const [existing] = await db.select().from(battleplans).where(eq(battleplans.id, id));
    if (!existing) return reply.status(404).send({ error: 'Not Found', message: 'Battleplan not found', statusCode: 404 });
    if (existing.ownerId !== request.user!.userId && request.user!.role !== 'admin') {
      return reply.status(403).send({ error: 'Forbidden', message: 'Not authorized', statusCode: 403 });
    }

    // Check if attacker slots already exist
    const existingAttackerSlots = await db.select().from(operatorSlots)
      .where(and(eq(operatorSlots.battleplanId, id), eq(operatorSlots.side, 'attacker')));
    if (existingAttackerSlots.length > 0) {
      return reply.status(409).send({ error: 'Conflict', message: 'Attacker lineup already exists', statusCode: 409 });
    }

    for (let i = 1; i <= MAX_OPERATOR_SLOTS; i++) {
      await db.insert(operatorSlots).values({
        battleplanId: id,
        slotNumber: i,
        side: 'attacker',
      });
    }

    const fullPlan = await getBattleplanWithDetails(id, request.user!.userId);
    return reply.status(201).send({ data: fullPlan });
  });

  // POST /api/battleplans/:id/attacker-lineup/delete
  fastify.post('/:id/attacker-lineup/delete', { preHandler: [requireAuth, requireTeamAccess] }, async (request, reply) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
    const [existing] = await db.select().from(battleplans).where(eq(battleplans.id, id));
    if (!existing) return reply.status(404).send({ error: 'Not Found', message: 'Battleplan not found', statusCode: 404 });
    if (existing.ownerId !== request.user!.userId && request.user!.role !== 'admin') {
      return reply.status(403).send({ error: 'Forbidden', message: 'Not authorized', statusCode: 403 });
    }

    await db.delete(operatorSlots).where(
      and(eq(operatorSlots.battleplanId, id), eq(operatorSlots.side, 'attacker'))
    );

    return { message: 'Attacker lineup removed' };
  });

  // --- Strat Config ---

  // POST /api/battleplans/:id/strat-config
  fastify.post('/:id/strat-config', { preHandler: [requireAuth, requireTeamAccess] }, async (request, reply) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
    const body = z.object({
      side: z.enum(['Attackers', 'Defenders', 'Unknown']).optional(),
      mode: z.enum(['Bomb', 'Secure', 'Hostage', 'Unknown']).optional(),
      site: z.enum(['1', '2', '3', '4', '5', 'Unknown']).optional(),
    }).parse(request.body);

    const [existing] = await db.select().from(battleplans).where(eq(battleplans.id, id));
    if (!existing) return reply.status(404).send({ error: 'Not Found', message: 'Battleplan not found', statusCode: 404 });
    if (existing.ownerId !== request.user!.userId && request.user!.role !== 'admin') {
      return reply.status(403).send({ error: 'Forbidden', message: 'Not authorized', statusCode: 403 });
    }

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (body.side !== undefined) updateData.stratSide = body.side;
    if (body.mode !== undefined) updateData.stratMode = body.mode;
    if (body.site !== undefined) updateData.stratSite = body.site;

    const [plan] = await db.update(battleplans).set(updateData).where(eq(battleplans.id, id)).returning();
    return { data: plan };
  });

  // --- Phases ---

  // GET /api/battleplans/:id/phases
  fastify.get('/:id/phases', { preHandler: [requireAuth, requireTeamAccess] }, async (request, reply) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
    const phases = await db.select().from(battleplanPhases)
      .where(eq(battleplanPhases.battleplanId, id))
      .orderBy(battleplanPhases.index);
    return { data: phases };
  });

  // POST /api/battleplans/:id/phases
  fastify.post('/:id/phases', { preHandler: [requireAuth, requireTeamAccess] }, async (request, reply) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
    const body = z.object({
      name: z.string().min(1).max(100),
      description: z.string().optional(),
    }).parse(request.body);

    // Get max index
    const existing = await db.select().from(battleplanPhases)
      .where(eq(battleplanPhases.battleplanId, id))
      .orderBy(desc(battleplanPhases.index));
    const nextIndex = existing.length > 0 ? existing[0].index + 1 : 0;

    const [phase] = await db.insert(battleplanPhases).values({
      battleplanId: id,
      index: nextIndex,
      name: body.name,
      description: body.description,
    }).returning();

    return reply.status(201).send({ data: phase });
  });

  // POST /api/battleplans/:id/phases/:phaseId/update
  fastify.post('/:id/phases/:phaseId/update', { preHandler: [requireAuth, requireTeamAccess] }, async (request, reply) => {
    const { phaseId } = z.object({ id: z.string().uuid(), phaseId: z.string().uuid() }).parse(request.params);
    const body = z.object({
      name: z.string().min(1).max(100).optional(),
      description: z.string().optional(),
    }).parse(request.body);

    const [phase] = await db.update(battleplanPhases).set({
      ...body,
      updatedAt: new Date(),
    }).where(eq(battleplanPhases.id, phaseId)).returning();

    if (!phase) return reply.status(404).send({ error: 'Not Found', message: 'Phase not found', statusCode: 404 });
    return { data: phase };
  });

  // POST /api/battleplans/:id/phases/:phaseId/delete
  fastify.post('/:id/phases/:phaseId/delete', { preHandler: [requireAuth, requireTeamAccess] }, async (request, reply) => {
    const { phaseId } = z.object({ id: z.string().uuid(), phaseId: z.string().uuid() }).parse(request.params);

    // Set phaseId to null on associated draws instead of deleting them
    await db.update(draws).set({ phaseId: null, updatedAt: new Date() })
      .where(eq(draws.phaseId, phaseId));

    await db.delete(battleplanPhases).where(eq(battleplanPhases.id, phaseId));
    return { message: 'Phase deleted' };
  });

  // POST /api/battleplans/:id/phases/:phaseId/copy
  fastify.post('/:id/phases/:phaseId/copy', { preHandler: [requireAuth, requireTeamAccess] }, async (request, reply) => {
    const { id, phaseId } = z.object({ id: z.string().uuid(), phaseId: z.string().uuid() }).parse(request.params);

    const [original] = await db.select().from(battleplanPhases)
      .where(and(eq(battleplanPhases.id, phaseId), eq(battleplanPhases.battleplanId, id)));
    if (!original) return reply.status(404).send({ error: 'Not Found', message: 'Phase not found', statusCode: 404 });

    // Get next index
    const allPhases = await db.select().from(battleplanPhases)
      .where(eq(battleplanPhases.battleplanId, id));
    const nextIndex = allPhases.length;

    const [newPhase] = await db.insert(battleplanPhases).values({
      battleplanId: id,
      index: nextIndex,
      name: `Copy of ${original.name}`,
      description: original.description,
    }).returning();

    // Copy all draws from original phase
    const phaseDraws = await db.select().from(draws)
      .where(and(eq(draws.phaseId, phaseId), eq(draws.isDeleted, false)));

    for (const draw of phaseDraws) {
      await db.insert(draws).values({
        battleplanFloorId: draw.battleplanFloorId,
        userId: draw.userId,
        type: draw.type,
        originX: draw.originX,
        originY: draw.originY,
        destinationX: draw.destinationX,
        destinationY: draw.destinationY,
        data: draw.data,
        phaseId: newPhase.id,
        operatorSlotId: draw.operatorSlotId,
      });
    }

    return reply.status(201).send({ data: newPhase });
  });

  // --- Bans ---

  // GET /api/battleplans/:id/bans
  fastify.get('/:id/bans', { preHandler: [requireAuth, requireTeamAccess] }, async (request, reply) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
    const bans = await db.select().from(operatorBans)
      .where(eq(operatorBans.battleplanId, id));
    return { data: bans };
  });

  // POST /api/battleplans/:id/bans
  fastify.post('/:id/bans', { preHandler: [requireAuth, requireTeamAccess] }, async (request, reply) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
    const body = z.object({
      operatorName: z.string().min(1).max(100),
      side: z.enum(['attacker', 'defender']),
      slotIndex: z.number().int().min(0).max(1),
    }).parse(request.body);

    // Upsert: delete existing ban at this slot, then insert
    await db.delete(operatorBans).where(
      and(
        eq(operatorBans.battleplanId, id),
        eq(operatorBans.side, body.side),
        eq(operatorBans.slotIndex, body.slotIndex),
      )
    );

    const [ban] = await db.insert(operatorBans).values({
      battleplanId: id,
      operatorName: body.operatorName,
      side: body.side,
      slotIndex: body.slotIndex,
    }).returning();

    return reply.status(201).send({ data: ban });
  });

  // POST /api/battleplans/:id/bans/:banId/delete
  fastify.post('/:id/bans/:banId/delete', { preHandler: [requireAuth, requireTeamAccess] }, async (request, reply) => {
    const { banId } = z.object({ id: z.string().uuid(), banId: z.string().uuid() }).parse(request.params);
    await db.delete(operatorBans).where(eq(operatorBans.id, banId));
    return { message: 'Ban removed' };
  });

  // POST /api/battleplans/:id/vote
  fastify.post('/:id/vote', { preHandler: [requireAuth, requireTeamAccess] }, async (request, reply) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
    const { value } = z.object({ value: z.number().int().min(-1).max(1) }).parse(request.body);

    const [existing] = await db.select().from(battleplans).where(eq(battleplans.id, id));
    if (!existing) return reply.status(404).send({ error: 'Not Found', message: 'Battleplan not found', statusCode: 404 });

    if (value === 0) {
      // Remove vote
      await db.delete(votes).where(
        and(eq(votes.battleplanId, id), eq(votes.userId, request.user!.userId))
      );
    } else {
      // Upsert vote
      await db.insert(votes).values({
        battleplanId: id,
        userId: request.user!.userId,
        value,
      }).onConflictDoUpdate({
        target: [votes.userId, votes.battleplanId],
        set: { value, updatedAt: new Date() },
      });
    }

    // Return updated vote count
    const voteResult = await db.select({ total: sql<number>`COALESCE(SUM(${votes.value}), 0)` })
      .from(votes).where(eq(votes.battleplanId, id));

    return { data: { voteCount: Number(voteResult[0]?.total || 0), userVote: value || null } };
  });

  // --- NDS Import ---

  // POST /api/battleplans/import - Import from .nds JSON payload
  fastify.post('/import', { preHandler: [requireAuth, requireTeamAccess] }, async (request, reply) => {
    const body = z.object({
      version: z.literal('1.0'),
      app: z.string(),
      appVersion: z.string(),
      exportedAt: z.string(),
      exportedBy: z.string(),
      game: z.object({ slug: z.string(), name: z.string() }),
      map: z.object({ slug: z.string(), name: z.string() }),
      strat: z.object({
        name: z.string().min(1).max(255),
        description: z.string().nullable().optional(),
        notes: z.string().nullable().optional(),
        tags: z.array(z.string().max(30)).max(10).optional(),
        config: z.object({
          side: z.enum(['Attackers', 'Defenders', 'Unknown']),
          mode: z.enum(['Bomb', 'Secure', 'Hostage', 'Unknown']),
          site: z.enum(['1', '2', '3', '4', '5', 'Unknown']),
        }),
        bans: z.array(z.object({
          operatorName: z.string(),
          side: z.enum(['attacker', 'defender']),
          slotIndex: z.number().int().min(0).max(1),
        })).optional(),
        operators: z.array(z.object({
          slotNumber: z.number().int().min(1).max(MAX_OPERATOR_SLOTS),
          side: z.enum(['attacker', 'defender']),
          operatorName: z.string().nullable(),
          color: z.string(),
          visible: z.boolean(),
          loadout: z.object({
            primaryWeapon: z.string().nullable(),
            secondaryWeapon: z.string().nullable(),
            primaryEquipment: z.string().nullable(),
            secondaryEquipment: z.string().nullable(),
          }),
        })).optional(),
        phases: z.array(z.object({
          index: z.number().int(),
          name: z.string(),
          description: z.string().nullable().optional(),
          draws: z.array(z.object({
            type: z.enum(['path', 'line', 'arrow', 'rectangle', 'ellipse', 'text', 'icon']),
            floorIndex: z.number().int().min(0),
            originX: z.number(),
            originY: z.number(),
            destinationX: z.number().nullable(),
            destinationY: z.number().nullable(),
            data: z.any(),
            operatorSlotNumber: z.number().int().nullable(),
            operatorSide: z.enum(['attacker', 'defender']).nullable(),
          })),
        })).optional(),
      }),
    }).parse(request.body);

    // Resolve game by slug
    const [game] = await db.select().from(games).where(eq(games.slug, body.game.slug));
    if (!game) return reply.status(400).send({ error: 'Bad Request', message: `Unknown game: ${body.game.slug}`, statusCode: 400 });

    // Resolve map by slug within the game
    const [map] = await db.select().from(maps).where(and(eq(maps.gameId, game.id), eq(maps.slug, body.map.slug)));
    if (!map) return reply.status(400).send({ error: 'Bad Request', message: `Unknown map: ${body.map.slug}`, statusCode: 400 });

    const strat = body.strat;

    // Create battleplan
    const [plan] = await db.insert(battleplans).values({
      ownerId: request.user!.userId,
      teamId: request.teamId!,
      gameId: game.id,
      mapId: map.id,
      name: strat.name,
      description: strat.description ?? null,
      notes: strat.notes ?? null,
      tags: strat.tags || [],
      stratSide: strat.config.side,
      stratMode: strat.config.mode,
      stratSite: strat.config.site,
    }).returning();

    // Create floors from map
    const mFloors = await db.select().from(mapFloors).where(eq(mapFloors.mapId, map.id)).orderBy(mapFloors.floorNumber);
    const floorMap = new Map<number, string>(); // floorIndex → battleplanFloorId
    for (let i = 0; i < mFloors.length; i++) {
      const [bpFloor] = await db.insert(battleplanFloors).values({
        battleplanId: plan.id,
        mapFloorId: mFloors[i]!.id,
      }).returning();
      floorMap.set(i, bpFloor.id);
    }

    // Create operator slots + resolve operatorId by name
    const slotIdMap = new Map<string, string>(); // "side:slotNumber" → operatorSlotId
    const defaultColors = ['#FF4444', '#44AAFF', '#44FF44', '#FFAA44', '#AA44FF'];

    if (strat.operators && strat.operators.length > 0) {
      for (const op of strat.operators) {
        let operatorId: string | null = null;
        if (op.operatorName) {
          const [found] = await db.select().from(operators)
            .where(and(eq(operators.gameId, game.id), eq(operators.name, op.operatorName)));
          if (found) operatorId = found.id;
        }

        const [slot] = await db.insert(operatorSlots).values({
          battleplanId: plan.id,
          slotNumber: op.slotNumber,
          side: op.side,
          operatorId,
          color: op.color,
          visible: op.visible,
          primaryWeapon: op.loadout.primaryWeapon,
          secondaryWeapon: op.loadout.secondaryWeapon,
          primaryEquipment: op.loadout.primaryEquipment,
          secondaryEquipment: op.loadout.secondaryEquipment,
        }).returning();
        slotIdMap.set(`${op.side}:${op.slotNumber}`, slot.id);
      }
    } else {
      // Default slots like in the create endpoint
      for (let i = 1; i <= MAX_OPERATOR_SLOTS; i++) {
        for (const side of ['defender', 'attacker'] as const) {
          const [slot] = await db.insert(operatorSlots).values({
            battleplanId: plan.id,
            slotNumber: i,
            side,
            color: defaultColors[(i - 1) % defaultColors.length],
          }).returning();
          slotIdMap.set(`${side}:${i}`, slot.id);
        }
      }
    }

    // Create bans
    if (strat.bans) {
      for (const ban of strat.bans) {
        await db.insert(operatorBans).values({
          battleplanId: plan.id,
          operatorName: ban.operatorName,
          side: ban.side,
          slotIndex: ban.slotIndex,
        });
      }
    }

    // Create phases + draws
    if (strat.phases && strat.phases.length > 0) {
      for (const phase of strat.phases) {
        const [newPhase] = await db.insert(battleplanPhases).values({
          battleplanId: plan.id,
          index: phase.index,
          name: phase.name,
          description: phase.description ?? null,
        }).returning();

        for (const draw of phase.draws) {
          const bpFloorId = floorMap.get(draw.floorIndex);
          if (!bpFloorId) continue; // skip draws for floors that don't exist

          let operatorSlotId: string | null = null;
          if (draw.operatorSlotNumber != null && draw.operatorSide) {
            operatorSlotId = slotIdMap.get(`${draw.operatorSide}:${draw.operatorSlotNumber}`) ?? null;
          }

          await db.insert(draws).values({
            battleplanFloorId: bpFloorId,
            userId: request.user!.userId,
            type: draw.type,
            originX: draw.originX,
            originY: draw.originY,
            destinationX: draw.destinationX,
            destinationY: draw.destinationY,
            data: draw.data,
            phaseId: newPhase.id,
            operatorSlotId,
          });
        }
      }
    } else {
      // Default phase
      await db.insert(battleplanPhases).values({
        battleplanId: plan.id,
        index: 0,
        name: 'Action Phase',
      });
    }

    const fullPlan = await getBattleplanWithDetails(plan.id, request.user!.userId);
    return reply.status(201).send({ data: fullPlan });
  });
}
