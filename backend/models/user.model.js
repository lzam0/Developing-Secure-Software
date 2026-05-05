import pool from "../controllers/database.js";
export class UserModel {
    
    // Find user by email
    static async findByEmail(email) {
        const query = `
        SELECT
            userid AS id,
            username,
            email,
            password,
            created_at
        FROM users
        WHERE email = $1`;
        const values = [email];
        const result = await pool.query(query, values);
        return result.rows[0];
    }
    // Find user by username
    static async findByUsername(username) {
        const query = `
        SELECT
            userid AS id,
            username,
            email,
            password,
            created_at
        FROM users
        WHERE username = $1`;
        const values = [username];
        const result = await pool.query(query, values);
        return result.rows[0];
    }
    //  Find user by email or username
    static async findByEmailOrUsername(identifier) {
        const query = `
        SELECT
            userid AS id,
            username,
            email,
            password,
            created_at
        FROM users
        WHERE email = $1 OR username = $1`;
        const values = [identifier];
        const result = await pool.query(query, values);
        return result.rows[0];
    }

    // Fetch user with profile data joined — used for the account page
    static async getUserWithProfile(userid) {
        // LEFT JOIN so users with no profile row still return a result (name/age will be null)
        const query = `
        SELECT u.username, u.email, p.name, p.age
        FROM users u
        LEFT JOIN profiles p ON p.userid = u.userid
        WHERE u.userid = $1`;
        const result = await pool.query(query, [userid]);
        // Returns null if userid doesn't exist (defensive — shouldn't happen for authenticated users)
        return result.rows[0] ?? null;
    }

    // Update username and name — username goes to users table, name upserts into profiles
    static async updateProfile(userid, { username, name }) {
        // Update username in the users table
        await pool.query(
            'UPDATE users SET username = $2 WHERE userid = $1',
            [userid, username]
        );

        // Upsert name into profiles — insert if no row exists, update if it does
        const existing = await pool.query(
            'SELECT profileid FROM profiles WHERE userid = $1',
            [userid]
        );
        if (existing.rows.length > 0) {
            await pool.query(
                'UPDATE profiles SET name = $2 WHERE userid = $1',
                [userid, name]
            );
        } else {
            await pool.query(
                'INSERT INTO profiles (userid, name) VALUES ($1, $2)',
                [userid, name]
            );
        }
    }

    // Update email in the users table
    static async updateEmail(userid, email) {
        await pool.query(
            'UPDATE users SET email = $2 WHERE userid = $1',
            [userid, email]
        );
    }

    // Delete a user — cascades to profiles, posts, diary, revoked_tokens
    static async deleteUser(userid) {
        await pool.query(
            'DELETE FROM users WHERE userid = $1',
            [userid]
        );
    }

    // Create new user
    static async create(username, email, password) {
        const query = `
        INSERT INTO users (username, email, password)
        VALUES ($1, $2, $3)
        RETURNING
            userid AS id,
            username,
            email,
            password,
            created_at`;
        const values = [username, email, password];
        const result = await pool.query(query, values);
        return result.rows[0];
    }
}
export default UserModel;
