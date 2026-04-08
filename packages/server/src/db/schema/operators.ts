import { pgTable, uuid, varchar, boolean, timestamp, primaryKey } from 'drizzle-orm/pg-core';
import { games } from './games.js';

export const operators = pgTable('operators', {
  id: uuid('id').primaryKey().defaultRandom(),
  gameId: uuid('game_id').notNull().references(() => games.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  icon: varchar('icon', { length: 500 }),
  color: varchar('color', { length: 7 }).notNull().default('#FFFFFF'),
  isAttacker: boolean('is_attacker').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const operatorGadgets = pgTable('operator_gadgets', {
  operatorId: uuid('operator_id').notNull().references(() => operators.id, { onDelete: 'cascade' }),
  gadgetId: uuid('gadget_id').notNull(),
}, (table) => [
  primaryKey({ columns: [table.operatorId, table.gadgetId] }),
]);
