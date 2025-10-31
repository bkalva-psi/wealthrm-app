import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Configure neon to use websockets for serverless environments
neonConfig.webSocketConstructor = ws;
neonConfig.poolQueryViaFetch = true;
neonConfig.useSecureWebSocket = true;

// Exported symbols (assigned below based on env)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export let pool: any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export let db: any;

if (!process.env.DATABASE_URL) {
  // Supabase-only mode
  // eslint-disable-next-line no-console
  console.warn("[db] DATABASE_URL not set. Running in Supabase-only mode.");
  pool = {
    query: () => { throw new Error("Postgres pool disabled. Use Supabase SDK endpoints."); }
  };
  db = {};
} else {
  // Postgres/Neon mode (kept for compatibility if needed)
  pool = new Pool({ 
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 30000,
    idleTimeoutMillis: 30000,
    max: 10,
    allowExitOnIdle: false
  });
  pool.on('error', (err: unknown) => {
    // eslint-disable-next-line no-console
    console.error('Database pool error:', err);
  });
  db = drizzle(pool, { schema });
}