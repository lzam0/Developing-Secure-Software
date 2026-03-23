import pool from "../controllers/database.js";
export class UserModel {
    /****************************************************/
    // Find user by email
    static async findByEmail(email) {
        const query = "SELECT * FROM users WHERE email = $1";
        const values = [email];
        const result = await pool.query(query, values);
        return result.rows[0];
    }
    // Find user by username
    static async findByUsername(username) {
        const query = "SELECT * FROM users WHERE username = $1";
        const values = [username];
        const result = await pool.query(query, values);
        return result.rows[0];
    }
    //  Find user by email or username
    static async findByEmailOrUsername(identifier) {
        const query = "SELECT * FROM users WHERE email = $1 OR username = $1";
        const values = [identifier];
        const result = await pool.query(query, values);
        return result.rows[0];
    }
    /****************************************************/
    // Create new user
    static async create(username, email, password) {
        const query = `
        INSERT INTO ussers (username, email, password)
        VALUES ($1, $2, $3)
        RETURNING *`;
        const values = [username, email, password];
        const result = await pool.query(query, values);
        return result.rows[0];
    }
}
export default UserModel;
