import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
export const store = sqliteTable('store', { id: text('id').primaryKey(), revision: integer('revision').notNull().default(0), data: text('data').notNull() });
export const sessions = sqliteTable('sessions', { token: text('token').primaryKey(), userId: text('user_id').notNull(), expires: integer('expires').notNull() });
