import type { FastifyInstance } from 'fastify';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../db/connection.js';
import { games, maps, mapFloors, operators, gadgets, operatorGadgets } from '../db/schema/index.js';

export default async function gamesRoutes(fastify: FastifyInstance) {
  // GET /api/games
  fastify.get('/', async () => {
    const result = await db.select().from(games).where(eq(games.isActive, true)).orderBy(games.name);
    return { data: result };
  });

  // GET /api/games/:slug
  fastify.get('/:slug', async (request, reply) => {
    const { slug } = z.object({ slug: z.string() }).parse(request.params);
    const [game] = await db.select().from(games).where(and(eq(games.slug, slug), eq(games.isActive, true)));
    if (!game) return reply.status(404).send({ error: 'Not Found', message: 'Game not found', statusCode: 404 });

    const gameMaps = await db.select().from(maps)
      .where(and(eq(maps.gameId, game.id), eq(maps.isActive, true)))
      .orderBy(maps.name);

    return { data: { ...game, maps: gameMaps } };
  });

  // GET /api/games/:slug/maps/:mapSlug
  fastify.get('/:slug/maps/:mapSlug', async (request, reply) => {
    const { slug, mapSlug } = z.object({ slug: z.string(), mapSlug: z.string() }).parse(request.params);

    const [game] = await db.select().from(games).where(eq(games.slug, slug));
    if (!game) return reply.status(404).send({ error: 'Not Found', message: 'Game not found', statusCode: 404 });

    const [map] = await db.select().from(maps)
      .where(and(eq(maps.gameId, game.id), eq(maps.slug, mapSlug)));
    if (!map) return reply.status(404).send({ error: 'Not Found', message: 'Map not found', statusCode: 404 });

    const floors = await db.select().from(mapFloors)
      .where(eq(mapFloors.mapId, map.id))
      .orderBy(mapFloors.floorNumber);

    return { data: { ...map, floors } };
  });

  // GET /api/games/:slug/operators
  fastify.get('/:slug/operators', async (request, reply) => {
    const { slug } = z.object({ slug: z.string() }).parse(request.params);
    const [game] = await db.select().from(games).where(eq(games.slug, slug));
    if (!game) return reply.status(404).send({ error: 'Not Found', message: 'Game not found', statusCode: 404 });

    const ops = await db.select().from(operators).where(eq(operators.gameId, game.id)).orderBy(operators.name);

    // Get gadgets for each operator
    const opsWithGadgets = await Promise.all(ops.map(async (op) => {
      const opGadgets = await db
        .select({ gadget: gadgets })
        .from(operatorGadgets)
        .innerJoin(gadgets, eq(operatorGadgets.gadgetId, gadgets.id))
        .where(eq(operatorGadgets.operatorId, op.id));
      return { ...op, gadgets: opGadgets.map(g => g.gadget) };
    }));

    return { data: opsWithGadgets };
  });

  // GET /api/games/:slug/gadgets
  fastify.get('/:slug/gadgets', async (request, reply) => {
    const { slug } = z.object({ slug: z.string() }).parse(request.params);
    const [game] = await db.select().from(games).where(eq(games.slug, slug));
    if (!game) return reply.status(404).send({ error: 'Not Found', message: 'Game not found', statusCode: 404 });

    const result = await db.select().from(gadgets).where(eq(gadgets.gameId, game.id)).orderBy(gadgets.category, gadgets.name);
    return { data: result };
  });
}
