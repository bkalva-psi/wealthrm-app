import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Configure neon to use websockets for serverless environments
neonConfig.webSocketConstructor = ws;

// Add connection configuration for better reliability
neonConfig.poolQueryViaFetch = true;
neonConfig.useSecureWebSocket = true;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Create a connection pool to the PostgreSQL database with retry logic
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 30000,
  idleTimeoutMillis: 30000,
  max: 10,
  allowExitOnIdle: false
});

// Add error handling for pool connections
pool.on('error', (err) => {
  console.error('Database pool error:', err);
});

// Create a Drizzle instance with our schema
export const db = drizzle(pool, { schema });