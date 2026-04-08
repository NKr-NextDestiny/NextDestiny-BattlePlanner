import { pgTable, uuid, varchar, boolean, timestamp, integer } from 'drizzle-orm/pg-core';
import { games } from './games.js';

export const maps = pgTable('maps', {
  id: uuid('id').primaryKey().defaultRandom(),
  gameId: uuid('game_id').notNull().references(() => games.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull(),
  thumbnail: varchar('thumbnail', { length: 500 }),
  isCompetitive: boolean('is_competitive').notNull().default(true),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const mapFloors = pgTable('map_floors', {
  id: uuid('id').primaryKey().defaultRandom(),
  mapId: uuid('map_id').notNull().references(() => maps.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  floorNumber: integer('floor_number').notNull(),
  imagePath: varchar('image_path', { length: 500 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
