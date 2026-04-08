import type { FastifyInstance } from 'fastify';
import jwt from 'jsonwebtoken';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../db/connection.js';
import { users } from '../db/schema/index.js';
import { requireAuth } from '../middleware/auth.js';
import {
  generateAccessToken,
  generateRefreshToken,
  storeRefreshToken,
  revokeRefreshToken,
  verifyRefreshToken,
  upsertDiscordUser,
  isUserAdmin,
} from '../services/auth.service.js';
import { getOAuthUrl, exchangeCode, fetchDiscordUser, fetchGuildMember } from '../services/discord.service.js';
import { getUserTeams } from '../services/team.service.js';
import type { TokenPayload } from '@nd-battleplanner/shared';
import { REFRESH_TOKEN_EXPIRY_SECONDS } from '@nd-battleplanner/shared';

function formatUser(user: typeof users.$inferSelect, effectiveRole?: string) {
  return {
    id: user.id,
    username: user.username,
    discordId: user.discordId,
    discordUsername: user.discordUsername,
    discordAvatar: user.discordAvatar,
    discordRoles: user.discordRoles,
    role: effectiveRole ?? user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export default async function authRoutes(fastify: FastifyInstance) {

  // --- Discord OAuth URL ---
  fastify.get('/discord/url', async (_request, reply) => {
    return reply.send({ data: { url: getOAuthUrl() } });
  });

  // --- Discord OAuth Callback ---
  const callbackSchema = z.object({ code: z.string().min(1) });

  fastify.post('/discord/callback', async (request, reply) => {
    const body = callbackSchema.parse(request.body);

    const tokenData = await exchangeCode(body.code);
    const discordUser = await fetchDiscordUser(tokenData.access_token);

    let guildMember;
    try {
      guildMember = await fetchGuildMember(tokenData.access_token);
    } catch (err: unknown) {
      if (err instanceof Error && err.message === 'NOT_IN_GUILD') {
        return reply.status(403).send({ error: 'You are not a member of the required Discord server.' });
      }
      throw err;
    }

    const discordRoles = guildMember.roles;

    const user = await upsertDiscordUser(
      discordUser.id,
      guildMember.nick || discordUser.global_name || discordUser.username,
      discordUser.avatar ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png` : null,
      discordRoles,
    );

    const userTeams = await getUserTeams(user.discordId, discordRoles);
    const admin = await isUserAdmin(user.id);

    if (userTeams.length === 0 && !admin) {
      return reply.status(403).send({ error: 'You do not have access to any team. Contact an admin.' });
    }

    const effectiveRole = admin ? 'admin' as const : 'user' as const;
    if (user.role !== effectiveRole) {
      await db.update(users).set({ role: effectiveRole, updatedAt: new Date() }).where(eq(users.id, user.id));
    }

    const accessToken = generateAccessToken(user.id, effectiveRole);
    const refreshToken = generateRefreshToken(user.id, effectiveRole);
    await storeRefreshToken(user.id, refreshToken);

    reply.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api/auth/refresh',
      maxAge: REFRESH_TOKEN_EXPIRY_SECONDS,
    });

    return reply.send({
      data: {
        user: formatUser(user, effectiveRole),
        accessToken,
        teams: userTeams,
      },
    });
  });

  // --- Token Refresh ---
  fastify.post('/refresh', async (request, reply) => {
    const token = request.cookies.refreshToken;
    if (!token) return reply.status(401).send({ error: 'No refresh token' });

    let payload: TokenPayload;
    try {
      payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as TokenPayload;
    } catch {
      return reply.status(401).send({ error: 'Invalid refresh token' });
    }

    const valid = await verifyRefreshToken(payload.userId, token);
    if (!valid) return reply.status(401).send({ error: 'Refresh token revoked or expired' });

    const [user] = await db.select().from(users).where(eq(users.id, payload.userId));
    if (!user) return reply.status(401).send({ error: 'User not found' });

    const admin = await isUserAdmin(user.id);
    const effectiveRole = admin ? 'admin' as const : 'user' as const;
    const userTeams = await getUserTeams(user.discordId, user.discordRoles as string[]);

    const accessToken = generateAccessToken(user.id, effectiveRole);
    const newRefreshToken = generateRefreshToken(user.id, effectiveRole);
    await storeRefreshToken(user.id, newRefreshToken);

    reply.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api/auth/refresh',
      maxAge: REFRESH_TOKEN_EXPIRY_SECONDS,
    });

    return reply.send({
      data: {
        user: formatUser(user, effectiveRole),
        accessToken,
        teams: userTeams,
      },
    });
  });

  // --- Logout ---
  fastify.post('/logout', { preHandler: [requireAuth] }, async (request, reply) => {
    await revokeRefreshToken(request.user!.userId);
    reply.clearCookie('refreshToken', { path: '/api/auth/refresh' });
    return reply.send({ data: { message: 'Logged out' } });
  });

  // --- Current User ---
  fastify.get('/me', { preHandler: [requireAuth] }, async (request, reply) => {
    const [user] = await db.select().from(users).where(eq(users.id, request.user!.userId));
    if (!user) return reply.status(404).send({ error: 'User not found' });

    const userTeams = await getUserTeams(user.discordId, user.discordRoles as string[]);

    return reply.send({
      data: {
        user: formatUser(user),
        teams: userTeams,
      },
    });
  });
}
