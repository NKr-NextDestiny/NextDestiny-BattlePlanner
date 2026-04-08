import { pgTable, uuid, varchar, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { games } from './games.js';

export const gadgetCategoryEnum = pgEnum('gadget_category', ['unique', 'secondary', 'general']);

export const gadgets = pgTable('gadgets', {
  id: uuid('id').primaryKey().defaultRandom(),
  gameId: uuid('game_id').notNull().references(() => games.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  icon: varchar('icon', { length: 500 }),
  category: gadgetCategoryEnum('category').notNull().default('general'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
