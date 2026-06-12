import { pgTable, text, timestamp, varchar, index, integer } from 'drizzle-orm/pg-core'
import { uuidv7 } from 'uuidv7'

export const links = pgTable('links', {
    id: text('id')
        .primaryKey()
        .$defaultFn(() => uuidv7()),
    originalUrl: varchar('original_url', { length: 255 }).notNull(),
    shortUrl: varchar('short_url', { length: 20 }).notNull().unique(),
    clicks: integer('clicks').notNull().default(0),
    createdAt: timestamp('created_at').notNull().defaultNow(),
},
    (table) => [index('idx_short_url').on(table.shortUrl)])