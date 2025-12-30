import { Pool } from 'pg';

// Avoid creating multiple pools in development due to hot reloading
const pool = (global as any).pgPool || new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 30, // Increased for high concurrency
    min: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    statement_timeout: 60000,
});

if (process.env.NODE_ENV !== 'production') {
    (global as any).pgPool = pool;
}

// Increase max listeners to prevent warning
pool.setMaxListeners(10);

// Handle errors
pool.on('error', (err: Error) => {
    console.error('Database pool error:', err);
});

// Log connection stats periodically in development
if (process.env.NODE_ENV !== 'production') {
    setInterval(() => {
    }, 30000); // Every 30 seconds
}

export default pool;
