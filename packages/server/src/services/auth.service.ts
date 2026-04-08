import jwt from 'jsonwebtoken';
import { eq } from 'drizzle-orm';
import { db } from '../db/connection.js';
import { users, settings } from '../db/schema/index.js';
import type { TokenPayload, UserRole } from '@nd-battleplanner/shared';
import { ACCESS_TOKEN_EXPIRY, REFRESH_TOKEN_EXPIRY_SECONDS } from '@nd-battleplanner/shared';

export function generateAccessToken(userId: string, role: UserRole): string {
  return jwt.sign({ userId, role } satisfies TokenPayload, process.env.JWT_SECRET!, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });
}

export function generateRefreshToken(userId: string, role: UserRole): string {
  return jwt.sign({ userId, role } satisfies TokenPayload, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: `${REFRESH_TOKEN_EXPIRY_SECONDS}s`,
  });
}

export async function storeRefreshToken(userId: string, refreshToken: string) {
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_SECONDS * 1000);
  await db.update(users).set({
    refreshToken,
    refreshTokenExpiresAt: expiresAt,
    updatedAt: new Date(),
  }).where(eq(users.id, userId));
}

export async function revokeRefreshToken(userId: string) {
  await db.update(users).set({
    refreshToken: null,
    refreshTokenExpiresAt: null,
    updatedAt: new Date(),
  }).where(eq(users.id, userId));
}

export async function verifyRefreshToken(userId: string, token: string): Promise<boolean> {
  const [user] = await db.select({
    refreshToken: users.refreshToken,
    refreshTokenExpiresAt: users.refreshTokenExpiresAt,
  }).from(users).where(eq(users.id, userId));
  if (!user || !user.refreshToken) return false;
  if (user.refreshTokenExpiresAt && user.refreshTokenExpiresAt < new Date()) return false;
  return user.refreshToken === token;
}

export async function upsertDiscordUser(discordId: string, discordUsername: string, discordAvatar: string | null, discordRoles: string[]) {
  const [existing] = await db.select().from(users).where(eq(users.discordId, discordId));

  if (existing) {
    await db.update(users).set({
      discordUsername,
      discordAvatar,
      discordRoles: discordRoles,
      username: existing.username === existing.discordUsername ? discordUsername : existing.username,
      updatedAt: new Date(),
    }).where(eq(users.id, existing.id));

    // Re-fetch to get updated data
    const [updated] = await db.select().from(users).where(eq(users.id, existing.id));
    return updated;
  }

  // New user
  const [newUser] = await db.insert(users).values({
    discordId,
    discordUsername,
    discordAvatar,
    discordRoles: discordRoles,
    username: discordUsername,
    role: 'user',
  }).returning();

  return newUser;
}

export async function isUserAdmin(userId: string): Promise<boolean> {
  const [user] = await db.select({
    role: users.role,
    discordId: users.discordId,
    discordRoles: users.discordRoles,
  }).from(users).where(eq(users.id, userId));

  if (!user) return false;
  if (user.role === 'admin') return true;

  // Check Discord role IDs from settings
  const [adminRolesSetting] = await db.select().from(settings).where(eq(settings.key, 'admin_discord_role_ids'));
  if (adminRolesSetting) {
    try {
      const adminRoleIds = JSON.parse(adminRolesSetting.value) as string[];
      const userRoles = user.discordRoles as string[];
      if (userRoles.some(r => adminRoleIds.includes(r))) return true;
    } catch { /* ignore parse errors */ }
  }

  // Check Discord user IDs from settings
  const [adminUsersSetting] = await db.select().from(settings).where(eq(settings.key, 'admin_discord_user_ids'));
  if (adminUsersSetting) {
    try {
      const adminUserIds = JSON.parse(adminUsersSetting.value) as string[];
      if (adminUserIds.includes(user.discordId)) return true;
    } catch { /* ignore parse errors */ }
  }

  return false;
}
