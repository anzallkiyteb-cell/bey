import { Pool } from 'pg';

// Avoid creating multiple pools in development due to hot reloading
const pool = (global as any).pgPool || new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 5, // Reduced from 20 to avoid "too many clients" error
    min: 1, // Keep at least 1 connection alive
    idleTimeoutMillis: 10000, // Release idle connections faster
    connectionTimeoutMillis: 5000, // Fast timeout
    statement_timeout: 10000, // 10 second query timeout
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
        console.log(`[DB Pool] Total: ${pool.totalCount}, Idle: ${pool.idleCount}, Waiting: ${pool.waitingCount}`);
    }, 30000); // Every 30 seconds
}

export default pool;
