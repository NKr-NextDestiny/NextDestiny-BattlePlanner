import type { FastifyInstance } from 'fastify';
import { eq, desc, count } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../../db/connection.js';
import { users } from '../../db/schema/index.js';
import { requireAdmin } from '../../middleware/auth.js';

export default async function adminUsersRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', requireAdmin);

  // GET /api/admin/users
  fastify.get('/', async (request) => {
    const { page = '1', pageSize = '20' } = request.query as Record<string, string>;
    const p = Math.max(1, parseInt(page));
    const ps = Math.min(100, Math.max(1, parseInt(pageSize)));

    const [{ total }] = await db.select({ total: count() }).from(users);
    const result = await db.select({
      id: users.id,
      username: users.username,
      discordId: users.discordId,
      discordUsername: users.discordUsername,
      discordAvatar: users.discordAvatar,
      role: users.role,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    }).from(users)
      .orderBy(desc(users.createdAt))
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

  // POST /api/admin/users/:id/role
  fastify.post('/:id/role', async (request, reply) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
    const { role } = z.object({ role: z.enum(['admin', 'user']) }).parse(request.body);

    if (id === request.user!.userId && role !== 'admin') {
      return reply.status(400).send({ error: 'Bad Request', message: 'Cannot change your own role', statusCode: 400 });
    }

    const [user] = await db.update(users).set({ role, updatedAt: new Date() }).where(eq(users.id, id)).returning();
    if (!user) return reply.status(404).send({ error: 'Not Found', message: 'User not found', statusCode: 404 });

    return { data: { id: user.id, username: user.username, discordUsername: user.discordUsername, role: user.role } };
  });

  // POST /api/admin/users/:id/delete
  fastify.post('/:id/delete', async (request, reply) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);

    if (id === request.user!.userId) {
      return reply.status(400).send({ error: 'Bad Request', message: 'Cannot delete yourself', statusCode: 400 });
    }

    await db.delete(users).where(eq(users.id, id));
    return { message: 'User deleted' };
  });
}
