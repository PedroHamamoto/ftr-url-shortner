import type { Config } from 'drizzle-kit';
import { env } from '@/env';

export default {
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  dialect: 'postgresql',
  schema: 'src/infrastructure/db/schemas/*',
  out: 'src/infrastructure/db/migrations',
} satisfies Config;
