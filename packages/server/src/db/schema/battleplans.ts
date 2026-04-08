import { pgTable, uuid, varchar, text, boolean, timestamp, integer, jsonb, pgEnum } from 'drizzle-orm/pg-core';
import { users } from './users.js';
import { teams } from './teams.js';
import { games } from './games.js';
import { maps, mapFloors } from './maps.js';
import { operators } from './operators.js';

export const drawTypeEnum = pgEnum('draw_type', ['path', 'line', 'arrow', 'rectangle', 'ellipse', 'text', 'icon']);
export const slotSideEnum = pgEnum('slot_side', ['defender', 'attacker']);

export const battleplans = pgTable('battleplans', {
  id: uuid('id').primaryKey().defaultRandom(),
  ownerId: uuid('owner_id').references(() => users.id, { onDelete: 'set null' }),
  teamId: uuid('team_id').references(() => teams.id, { onDelete: 'set null' }),
  gameId: uuid('game_id').notNull().references(() => games.id, { onDelete: 'cascade' }),
  mapId: uuid('map_id').notNull().references(() => maps.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  notes: text('notes'),
  tags: text('tags').array().default([]),
  isPublic: boolean('is_public').notNull().default(false),
  isSaved: boolean('is_saved').notNull().default(false),
  stratSide: varchar('strat_side', { length: 20 }).notNull().default('Unknown'),
  stratMode: varchar('strat_mode', { length: 20 }).notNull().default('Unknown'),
  stratSite: varchar('strat_site', { length: 20 }).notNull().default('Unknown'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const battleplanFloors = pgTable('battleplan_floors', {
  id: uuid('id').primaryKey().defaultRandom(),
  battleplanId: uuid('battleplan_id').notNull().references(() => battleplans.id, { onDelete: 'cascade' }),
  mapFloorId: uuid('map_floor_id').notNull().references(() => mapFloors.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const battleplanPhases = pgTable('battleplan_phases', {
  id: uuid('id').primaryKey().defaultRandom(),
  battleplanId: uuid('battleplan_id').notNull().references(() => battleplans.id, { onDelete: 'cascade' }),
  index: integer('index').notNull().default(0),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const operatorBans = pgTable('operator_bans', {
  id: uuid('id').primaryKey().defaultRandom(),
  battleplanId: uuid('battleplan_id').notNull().references(() => battleplans.id, { onDelete: 'cascade' }),
  operatorName: varchar('operator_name', { length: 100 }).notNull(),
  side: slotSideEnum('side').notNull(),
  slotIndex: integer('slot_index').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const draws = pgTable('draws', {
  id: uuid('id').primaryKey().defaultRandom(),
  battleplanFloorId: uuid('battleplan_floor_id').notNull().references(() => battleplanFloors.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  type: drawTypeEnum('type').notNull(),
  originX: integer('origin_x').notNull(),
  originY: integer('origin_y').notNull(),
  destinationX: integer('destination_x'),
  destinationY: integer('destination_y'),
  data: jsonb('data').notNull().default({}),
  phaseId: uuid('phase_id').references(() => battleplanPhases.id, { onDelete: 'set null' }),
  operatorSlotId: uuid('operator_slot_id').references(() => operatorSlots.id, { onDelete: 'set null' }),
  isDeleted: boolean('is_deleted').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const operatorSlots = pgTable('operator_slots', {
  id: uuid('id').primaryKey().defaultRandom(),
  battleplanId: uuid('battleplan_id').notNull().references(() => battleplans.id, { onDelete: 'cascade' }),
  slotNumber: integer('slot_number').notNull(),
  operatorId: uuid('operator_id').references(() => operators.id, { onDelete: 'set null' }),
  operatorName: varchar('operator_name', { length: 100 }),
  side: slotSideEnum('side').notNull().default('defender'),
  color: varchar('color', { length: 7 }).notNull().default('#FF0000'),
  visible: boolean('visible').notNull().default(true),
  primaryWeapon: varchar('primary_weapon', { length: 100 }),
  secondaryWeapon: varchar('secondary_weapon', { length: 100 }),
  primaryEquipment: varchar('primary_equipment', { length: 100 }),
  secondaryEquipment: varchar('secondary_equipment', { length: 100 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
