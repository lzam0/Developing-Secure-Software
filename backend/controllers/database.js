import { Pool } from "pg";
import dotenv from "dotenv";
dotenv.config();
const dbPort = parseInt(process.env.DB_PORT || "5433", 10);
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: Number.isFinite(dbPort) ? dbPort : 5433,
});
export default pool;
