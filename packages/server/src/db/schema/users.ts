import { pgTable, uuid, varchar, timestamp, jsonb, pgEnum } from 'drizzle-orm/pg-core';

export const userRoleEnum = pgEnum('user_role', ['admin', 'user']);

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  username: varchar('username', { length: 255 }).notNull().unique(),
  discordId: varchar('discord_id', { length: 255 }).notNull().unique(),
  discordUsername: varchar('discord_username', { length: 255 }).notNull(),
  discordAvatar: varchar('discord_avatar', { length: 512 }),
  discordRoles: jsonb('discord_roles').notNull().default([]),
  role: userRoleEnum('role').notNull().default('user'),
  refreshToken: varchar('refresh_token', { length: 512 }),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
