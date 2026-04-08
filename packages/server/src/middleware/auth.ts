import type { FastifyRequest, FastifyReply } from 'fastify';
import jwt from 'jsonwebtoken';
import { eq } from 'drizzle-orm';
import { db } from '../db/connection.js';
import { users } from '../db/schema/index.js';
import { isUserAdmin } from '../services/auth.service.js';
import { isUserInTeam } from '../services/team.service.js';
import type { TokenPayload } from '@nd-battleplanner/shared';

export async function requireAuth(request: FastifyRequest, reply: FastifyReply) {
  const authHeader = request.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return reply.status(401).send({ error: 'Unauthorized', message: 'Missing or invalid authorization header', statusCode: 401 });
  }

  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
    request.user = payload;
  } catch {
    return reply.status(401).send({ error: 'Unauthorized', message: 'Invalid or expired token', statusCode: 401 });
  }
}

export async function requireAdmin(request: FastifyRequest, reply: FastifyReply) {
  await requireAuth(request, reply);
  if (reply.sent) return;

  const admin = await isUserAdmin(request.user!.userId);
  if (!admin) {
    return reply.status(403).send({ error: 'Forbidden', message: 'Admin access required', statusCode: 403 });
  }
}

export async function requireTeamAccess(request: FastifyRequest, reply: FastifyReply) {
  // Must be called after requireAuth
  if (!request.user) return;

  const teamId = request.headers['x-team-id'] as string | undefined;
  if (!teamId) {
    return reply.status(400).send({ error: 'Bad Request', message: 'X-Team-Id header is required', statusCode: 400 });
  }

  // Admins bypass team check
  const admin = await isUserAdmin(request.user.userId);
  if (admin) {
    request.teamId = teamId;
    return;
  }

  const [user] = await db.select({
    discordId: users.discordId,
    discordRoles: users.discordRoles,
  }).from(users).where(eq(users.id, request.user.userId));

  if (!user) {
    return reply.status(401).send({ error: 'User not found' });
  }

  const hasAccess = await isUserInTeam(user.discordId, user.discordRoles as string[], teamId);
  if (!hasAccess) {
    return reply.status(403).send({ error: 'Forbidden', message: 'You do not have access to this team', statusCode: 403 });
  }

  request.teamId = teamId;
}
