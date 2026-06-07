import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { env } from "../infrastructure/env";

const connectionString = env.DATABASE_URL;

const pool = new Pool({ connectionString });

export const db = drizzle(pool);
