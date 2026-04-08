import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users.js';
import { teams } from './teams.js';
import { battleplans } from './battleplans.js';

export const rooms = pgTable('rooms', {
  id: uuid('id').primaryKey().defaultRandom(),
  ownerId: uuid('owner_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  teamId: uuid('team_id').notNull().references(() => teams.id, { onDelete: 'cascade' }),
  battleplanId: uuid('battleplan_id').references(() => battleplans.id, { onDelete: 'set null' }),
  connectionString: varchar('connection_string', { length: 255 }).notNull().unique(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
