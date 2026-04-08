import { pgTable, varchar, text } from 'drizzle-orm/pg-core';

export const settings = pgTable('settings', {
  key: varchar('key', { length: 255 }).primaryKey(),
  value: text('value').notNull(),
});
