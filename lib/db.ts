import { Pool } from 'pg';

// Create a single pool instance that will be reused across requests
// The pool automatically manages connections and releases them after queries
const pool = (global as any).pgPool || new Pool({
    connectionString: process.env.DATABASE_URL,
    // Remove max limit - let PostgreSQL handle it
    // The pool will automatically release connections after queries complete
});

// Handle pool errors
pool.on('error', (err: Error) => {
    console.error('Unexpected error on idle client', err);
    // Don't exit the process, just log the error
});

// In development, reuse the same pool to avoid creating multiple instances
if (process.env.NODE_ENV !== 'production') {
    (global as any).pgPool = pool;
}

export default pool;
