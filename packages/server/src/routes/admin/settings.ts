import type { FastifyInstance } from 'fastify';
import { eq, count, desc } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../../db/connection.js';
import { settings, users, battleplans, games, maps, teams } from '../../db/schema/index.js';
import { requireAdmin } from '../../middleware/auth.js';

export default async function adminSettingsRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', requireAdmin);

  // GET /api/admin/settings
  fastify.get('/', async () => {
    const result = await db.select().from(settings);
    const settingsMap: Record<string, string> = {};
    for (const s of result) {
      settingsMap[s.key] = s.value;
    }

    let adminDiscordRoleIds: string[] = [];
    let adminDiscordUserIds: string[] = [];
    try { adminDiscordRoleIds = JSON.parse(settingsMap['admin_discord_role_ids'] || '[]'); } catch { /* ignore */ }
    try { adminDiscordUserIds = JSON.parse(settingsMap['admin_discord_user_ids'] || '[]'); } catch { /* ignore */ }

    return {
      data: {
        adminDiscordRoleIds,
        adminDiscordUserIds,
      },
    };
  });

  // POST /api/admin/settings (update)
  fastify.post('/', async (request) => {
    const body = z.object({
      adminDiscordRoleIds: z.array(z.string()).optional(),
      adminDiscordUserIds: z.array(z.string()).optional(),
    }).parse(request.body);

    if (body.adminDiscordRoleIds !== undefined) {
      await db.insert(settings)
        .values({ key: 'admin_discord_role_ids', value: JSON.stringify(body.adminDiscordRoleIds) })
        .onConflictDoUpdate({
          target: settings.key,
          set: { value: JSON.stringify(body.adminDiscordRoleIds) },
        });
    }

    if (body.adminDiscordUserIds !== undefined) {
      await db.insert(settings)
        .values({ key: 'admin_discord_user_ids', value: JSON.stringify(body.adminDiscordUserIds) })
        .onConflictDoUpdate({
          target: settings.key,
          set: { value: JSON.stringify(body.adminDiscordUserIds) },
        });
    }

    return { message: 'Settings updated' };
  });

  // GET /api/admin/stats
  fastify.get('/stats', async () => {
    const [{ total: totalUsers }] = await db.select({ total: count() }).from(users);
    const [{ total: totalBattleplans }] = await db.select({ total: count() }).from(battleplans);
    const [{ total: totalGames }] = await db.select({ total: count() }).from(games);
    const [{ total: totalMaps }] = await db.select({ total: count() }).from(maps);
    const [{ total: totalTeams }] = await db.select({ total: count() }).from(teams);

    const recentUsers = await db.select({
      id: users.id,
      username: users.username,
      discordUsername: users.discordUsername,
      createdAt: users.createdAt,
    }).from(users).orderBy(desc(users.createdAt)).limit(10);

    return {
      data: {
        totalUsers,
        totalBattleplans,
        totalGames,
        totalMaps,
        totalTeams,
        recentUsers,
      },
    };
  });
}
