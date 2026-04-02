// manage the connection pool for the postgresql database
import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    // use variable from .env or default if missing
    port: parseInt(process.env.DB_PORT, 10) || 5433, 
});

export default pool;