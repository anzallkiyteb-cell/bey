import { Pool } from 'pg';

// Suppress DEP0169 (url.parse) warning for Vercel/Production logs
if (typeof process !== 'undefined' && process.emitWarning) {
    const originalEmitWarning = process.emitWarning;
    (process as any).emitWarning = function (warning: any, ...args: any[]) {
        const message = warning instanceof Error ? warning.message : String(warning);
        if (message.includes('DEP0169')) return;
        return (originalEmitWarning as any).apply(process, [warning, ...args]);
    };
}

// Avoid creating multiple pools in development due to hot reloading
const pool = (global as any).pgPool || new Pool({
    connectionString: process.env.DATABASE_URL,
});

if (process.env.NODE_ENV !== 'production') {
    (global as any).pgPool = pool;
}

export default pool;
