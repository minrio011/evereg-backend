import dotenv from 'dotenv';
import { Pool, types } from 'pg';

dotenv.config();

// Return timestamps as strings
types.setTypeParser(types.builtins.TIMESTAMP, (value: string) => value);
types.setTypeParser(types.builtins.TIMESTAMPTZ, (value: string) => value);

const isLocalhost = process.env.DATABASE_URL?.includes("localhost");

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: isLocalhost ? false : {
        rejectUnauthorized: false,
    },
});

export const query = (text: string, params?: any[]) => pool.query(text, params);