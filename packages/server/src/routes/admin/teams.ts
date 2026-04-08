import type { FastifyInstance } from 'fastify';
import { eq, count } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../../db/connection.js';
import { teams, teamMembers } from '../../db/schema/index.js';
import { requireAdmin } from '../../middleware/auth.js';

export default async function adminTeamsRoutes(fastify: FastifyInstance) {
  // GET /api/admin/teams
  fastify.get('/', { preHandler: [requireAdmin] }, async () => {
    const allTeams = await db.select().from(teams).orderBy(teams.name);

    const teamsWithCount = await Promise.all(allTeams.map(async (team) => {
      const [{ memberCount }] = await db.select({ memberCount: count() })
        .from(teamMembers)
        .where(eq(teamMembers.teamId, team.id));
      return { ...team, individualMemberCount: memberCount };
    }));

    return { data: teamsWithCount };
  });

  // POST /api/admin/teams
  fastify.post('/', { preHandler: [requireAdmin] }, async (request, reply) => {
    const body = z.object({
      name: z.string().min(1).max(255),
      discordRoleId: z.string().min(1).max(255),
    }).parse(request.body);

    const [team] = await db.insert(teams).values({
      name: body.name,
      discordRoleId: body.discordRoleId,
    }).returning();

    return reply.status(201).send({ data: team });
  });

  // POST /api/admin/teams/:id (update)
  fastify.post('/:id', { preHandler: [requireAdmin] }, async (request, reply) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
    const body = z.object({
      name: z.string().min(1).max(255).optional(),
      discordRoleId: z.string().min(1).max(255).optional(),
    }).parse(request.body);

    const [team] = await db.update(teams).set({ ...body, updatedAt: new Date() })
      .where(eq(teams.id, id)).returning();

    if (!team) return reply.status(404).send({ error: 'Team not found' });
    return { data: team };
  });

  // POST /api/admin/teams/:id/delete
  fastify.post('/:id/delete', { preHandler: [requireAdmin] }, async (request, reply) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
    await db.delete(teams).where(eq(teams.id, id));
    return { message: 'Team deleted' };
  });

  // GET /api/admin/teams/:id/members
  fastify.get('/:id/members', { preHandler: [requireAdmin] }, async (request) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
    const members = await db.select().from(teamMembers)
      .where(eq(teamMembers.teamId, id))
      .orderBy(teamMembers.createdAt);
    return { data: members };
  });

  // POST /api/admin/teams/:id/members
  fastify.post('/:id/members', { preHandler: [requireAdmin] }, async (request, reply) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
    const body = z.object({
      discordUserId: z.string().min(1).max(255),
    }).parse(request.body);

    const [member] = await db.insert(teamMembers).values({
      teamId: id,
      discordUserId: body.discordUserId,
    }).returning();

    return reply.status(201).send({ data: member });
  });

  // POST /api/admin/teams/:id/members/:memberId/delete
  fastify.post('/:id/members/:memberId/delete', { preHandler: [requireAdmin] }, async (request) => {
    const { memberId } = z.object({ id: z.string().uuid(), memberId: z.string().uuid() }).parse(request.params);
    await db.delete(teamMembers).where(eq(teamMembers.id, memberId));
    return { message: 'Member removed' };
  });
}
