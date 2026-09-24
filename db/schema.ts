import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core';

export const workspaces = sqliteTable('workspaces', {
  owner: text('owner').primaryKey(),
  revision: integer('revision').notNull().default(0),
  data: text('data').notNull(),
});
export const events = sqliteTable('events', {
  owner: text('owner').notNull(),
  revision: integer('revision').notNull(),
  action: text('action').notNull(),
  at: text('at').notNull(),
  digest: text('digest').notNull(),
}, table => [primaryKey({columns:[table.owner,table.revision]})]);
export const limits = sqliteTable('request_limits', {
  owner: text('owner').primaryKey(),
  window: integer('window').notNull(),
  count: integer('count').notNull(),
});
