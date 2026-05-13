import pool from "../controllers/database.js";

export class OtpModel {
    //Mark previous unused OTPs for the same purpose as used
    static async invalidateExistingOtps(userid, purpose) {
        const query = `
            UPDATE email_otps
            SET used = TRUE
            WHERE userid = $1 AND purpose = $2 AND used = FALSE
        `;
        await pool.query(query, [userid, purpose]);
    }

    //Create a new OTP record
    static async create(userid, otpHash, purpose, expiresAt) {
        const query = `
            INSERT INTO email_otps (userid, otp_hash, purpose, expires_at)
            VALUES ($1, $2, $3, $4)
            RETURNING otpid, userid, otp_hash, purpose, expires_at, attempts, used, created_at
        `;
        const values = [userid, otpHash, purpose, expiresAt];
        const result = await pool.query(query, values);
        return result.rows[0];
    }

    //Find latest active OTP for a user and purpose
    static async findLatestActiveByUserId(userid, purpose) {
        const query = `
            SELECT otpid, userid, otp_hash, purpose, expires_at, attempts, used, created_at
            FROM email_otps
            WHERE userid = $1 AND purpose = $2 AND used = FALSE AND expires_at > NOW()
            ORDER BY created_at DESC
            LIMIT 1
        `;
        const result = await pool.query(query, [userid, purpose]);
        return result.rows[0];
    }

    //Increment failed attempts
    static async incrementAttempts(otpid) {
        const query = `
            UPDATE email_otps
            SET attempts = attempts + 1
            WHERE otpid = $1
            RETURNING attempts
        `;
        const result = await pool.query(query, [otpid]);
        return result.rows[0];
    }

    //Mark OTP as used
    static async markUsed(otpid) {
        const query = `
            UPDATE email_otps
            SET used = TRUE
            WHERE otpid = $1
        `;
        await pool.query(query, [otpid]);
    }
}

export default OtpModel;