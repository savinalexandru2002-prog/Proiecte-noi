import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
const { Pool } = pkg;
import * as schema from './schema.ts';

declare global {
  var _postgresPool: pkg.Pool | undefined;
}

export const createPool = () => {
  if (!global._postgresPool) {
    global._postgresPool = new Pool({
      host: process.env.SQL_HOST,
      user: process.env.SQL_USER,
      password: process.env.SQL_PASSWORD,
      database: process.env.SQL_DB_NAME,
      max: 5, // Reduced max connections for stability
      connectionTimeoutMillis: 20000,
      idleTimeoutMillis: 30000, // Close idle connections before the server drops them
      keepAlive: true, // Keep connections active
    });

    global._postgresPool.on('error', (err: any) => {
      // Cloud SQL proxy and idle pool clients often terminate connections unexpectedly.
      // We catch this to prevent it from bubbling up as an unhandled error.
      const isIdleTermination = err.message?.includes('terminated unexpectedly') || err.code === 'ECONNRESET';
      if (isIdleTermination) {
        // Log as a subtle debug message instead of an error to keep logs clean
        console.log('[SQL POOL] Idle connection terminated (normal Cloud SQL behavior).');
      } else {
        console.error('Unexpected error on active SQL pool client:', err);
      }
    });
  }
  return global._postgresPool;
};

const pool = createPool();
export { pool };
export const db = drizzle(pool, { schema });
export * from './schema.ts';
