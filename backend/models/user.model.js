// Used to interact with database for user related CRUD operations
import pool from "../controllers/database.js";

// Used for encrypting/decrypting sensitive data
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

export class UserModel {

    // Helper to get encryption key buffer from environment variable, with validation
    static getEncryptionKey() {
        const key = Buffer.from(process.env.ENCRYPTION_KEY || '', 'hex');
        if (key.length !== 32) {
            throw new Error('FATAL: ENCRYPTION_KEY must be a 64-character hex string');
        }
        return key;
    }

    // Normalize email by trimming whitespace and converting to lowercase for consistent storage and lookup
    static normaliseEmail(email) {
        return String(email).trim().toLowerCase();
    }

    // Create a consistent HMAC hash of the normalized email for lookup purposes
    // without storing the actual email in plaintext
    static emailLookup(email) {
        return crypto
            .createHmac('sha256', this.getEncryptionKey())
            .update(this.normaliseEmail(email))
            .digest('hex');
    }

    // Encrypt a string using AES-256-GCM. Stored as version:iv:authTag:ciphertext.
    static encrypt(text) {
        // Generate a random 12-byte IV for GCM mode. This is not a secret and can be stored with the ciphertext.
        const iv = crypto.randomBytes(12);
        const cipher = crypto.createCipheriv('aes-256-gcm', this.getEncryptionKey(), iv);

        // Encrypt the text and get the authentication tag for integrity verification
        const encrypted = Buffer.concat([
            cipher.update(String(text), 'utf8'),
            cipher.final()
        ]);

        // The auth tag is essential for verifying the integrity of the ciphertext during decryption. 
        // It should be stored alongside the IV and ciphertext.
        const authTag = cipher.getAuthTag();

        // Store the version, IV, auth tag, and encrypted text together. 
        // The version allows for future changes to the encryption scheme.
        return [
            'v1',
            iv.toString('hex'),
            authTag.toString('hex'),
            encrypted.toString('hex')
        ].join(':');
    }

    // Decrypt a string encrypted by the above method. 
    // If the string isn't in the expected format, it's returned as is.
    static decrypt(encrypted) {
        if (!encrypted || !String(encrypted).startsWith('v1:')) {
            return encrypted;
        }

        // Split the encrypted value into its components and validate the format
        const [version, ivHex, authTagHex, encryptedText] = String(encrypted).split(':');

        // If any component is missing or the version is unsupported, throw an error
        if (version !== 'v1' || !ivHex || !authTagHex || !encryptedText) {
            throw new Error('Invalid encrypted value format');
        }

        // Convert the hex strings back to buffers and perform decryption
        const iv = Buffer.from(ivHex, 'hex');
        const authTag = Buffer.from(authTagHex, 'hex');
        const decipher = crypto.createDecipheriv('aes-256-gcm', this.getEncryptionKey(), iv);
        decipher.setAuthTag(authTag);

        // If decryption fails (e.g., due to tampering), an error will be thrown by the crypto library
        let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    }

    // Helper to decrypt email when fetching user rows
    static decryptUserRow(row) {
        if (!row) return row;
        return {
            ...row,
            email: this.decrypt(row.email)
        };
    }
    
    // Find user by userid
    static async findById(userid) {
        const result = await pool.query(
            `SELECT userid AS id, username, email, password, created_at FROM users WHERE userid = $1`,
            [userid]
        );
        return this.decryptUserRow(result.rows[0]);
    }

    // Find user by email
    static async findByEmail(email) {
        const query = `
        SELECT
            userid AS id,
            username,
            email,
            password,
            is_verified,
            created_at
        FROM users
        WHERE email_lookup = $1`;
        const values = [this.emailLookup(email)];
        const result = await pool.query(query, values);
        return this.decryptUserRow(result.rows[0]);
    }
    // Find user by username
    static async findByUsername(username) {
        const query = `
        SELECT
            userid AS id,
            username,
            email,
            password,
            is_verified,
            created_at
        FROM users
        WHERE username = $1`;
        const values = [username];
        const result = await pool.query(query, values);
        return this.decryptUserRow(result.rows[0]);
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
        return this.decryptUserRow(result.rows[0]) ?? null;
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
        const normalisedEmail = this.normaliseEmail(email);
        await pool.query(
            'UPDATE users SET email = $2, email_lookup = $3 WHERE userid = $1',
            [userid, this.encrypt(normalisedEmail), this.emailLookup(normalisedEmail)]
        );
    }

    // Update password in the users table
    static async updatePassword(userid, hashedPassword) {
        await pool.query(
            'UPDATE users SET password = $2 WHERE userid = $1',
            [userid, hashedPassword]
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
        const normalisedEmail = this.normaliseEmail(email);
        const query = `
        INSERT INTO users (username, email, email_lookup, password, is_verified)
        VALUES ($1, $2, $3, $4, FALSE)
        RETURNING
            userid AS id,
            username,
            email,
            password,
            is_verified,
            created_at`;
        const values = [
            username,
            this.encrypt(normalisedEmail),
            this.emailLookup(normalisedEmail),
            password
        ];
        const result = await pool.query(query, values);
        return this.decryptUserRow(result.rows[0]);
    }

    // Mark user as verified
    static async markVerified(userid) {
        const query = `
        UPDATE users
        SET is_verified = true
        WHERE userid = $1
        RETURNING
            userid AS id,
            username,
            email`;
        const values = [userid];
        const result = await pool.query(query, values);
        return this.decryptUserRow(result.rows[0]);
    }
}
export default UserModel;
