import pool from '../controllers/database.js';

export class SecurityModel {
    //Create a hashed report token for suspicious activity review
    static async createReportToken(userid, tokenHash, purpose, expiresAt) {
        const query = `
            INSERT INTO suspicious_activity_reports 
            (userid, report_token_hash, purpose, expires_at)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;

        const result = await pool.query(query, [
            userid,
            tokenHash,
            purpose,
            expiresAt
        ]);

        return result.rows[0];
    }

    //Find an unused report token that has not expired
    static async findValidReportToken(tokenHash) {
        const query = `
            SELECT *
            FROM suspicious_activity_reports
            WHERE report_token_hash = $1
              AND used = FALSE
              AND expires_at > NOW()
            LIMIT 1
        `;

        const result = await pool.query(query, [tokenHash]);
        return result.rows[0];
    }

    //Mark a report token as used after it has been verified
    static async markReportTokenUsed(reportid) {
        await pool.query(
            `UPDATE suspicious_activity_reports
             SET used = TRUE
             WHERE reportid = $1`,
            [reportid]
        );
    }
}

export default SecurityModel;
