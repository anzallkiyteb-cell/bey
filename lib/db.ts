import { Pool } from 'pg';

// Avoid creating multiple pools in development due to hot reloading
const pool = (global as any).pgPool || new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 3, // Maximum number of clients in the pool (reduced to prevent "too many clients" error)
    min: 0, // Minimum number of clients
    idleTimeoutMillis: 10000, // Close idle clients after 10 seconds
    connectionTimeoutMillis: 5000, // Return an error after 5 seconds if connection could not be established
    allowExitOnIdle: true, // Allow the pool to close all idle clients and exit
});

// Handle pool errors
pool.on('error', (err: Error) => {
    console.error('Unexpected error on idle client', err);
});

if (process.env.NODE_ENV !== 'production') {
    (global as any).pgPool = pool;
}

export default pool;
