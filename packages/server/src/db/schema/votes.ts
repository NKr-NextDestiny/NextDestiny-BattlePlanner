import { pgTable, uuid, integer, timestamp, unique } from 'drizzle-orm/pg-core';
import { users } from './users.js';
import { battleplans } from './battleplans.js';

export const votes = pgTable('votes', {
  id: uuid('id').primaryKey().defaultRandom(),
  battleplanId: uuid('battleplan_id').notNull().references(() => battleplans.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  value: integer('value').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => [
  unique('votes_user_battleplan_unique').on(table.userId, table.battleplanId),
]);
