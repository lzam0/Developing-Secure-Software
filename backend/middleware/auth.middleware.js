import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import pool from '../controllers/database.js';
dotenv.config();

// Validate JWT_SECRET exists
if (!process.env.JWT_WEB_TOKEN_SECRET) {
    throw new Error('FATAL: JWT_WEB_TOKEN_SECRET is not defined in .env file');
}

const JWT_SECRET = process.env.JWT_WEB_TOKEN_SECRET;

/**
 * Middleware to verify JWT token and attach user to request
 * Supports both Authorization header (Bearer token) and cookies
 */
// changed to async to query the database for blacklist check
export const authenticateToken = async (req, res, next) => {

    // Information log for debugging
    console.log('Authenticating token...');
    
    // Check cookies for token
    const token = req.cookies?.token;
    
    // Helper: HTML page requests get a redirect to login; API requests get JSON
    const rejectRequest = (res, req, status, message) => {
        if (req.accepts('html')) {
            return res.redirect('/login.html');
        }
        return res.status(status).json({ success: false, message });
    };

    // If no token, return unauthorized
    if (!token) {
        console.log('No token found');
        rejectRequest(res, req, 401, 'Access token required');
        return;
    }
    // verify signature and expiry
    let decoded; // variable to hold the token data (i.e. jti and expiry)
    try {
        // verify the token to check if the signature is real and the date hasnt expired
        // signature check to ensure the token was made by OUR server, and wasnt changed
        // automatically check if token has expired aswell
        decoded = jwt.verify(token, JWT_SECRET);
        console.log('Token verified, user:', decoded);
    } catch (err) {
        // if the token is fake or expired
        console.log('Token verification failed:', err.message);
        rejectRequest(res, req, 403, 'Invalid or expired token');
        return;
    }
    // checking the jti with the revoked_tokens table
    if (!decoded.jti) {
        rejectRequest(res, req, 401, 'Invalid token: missing jti');
        return;
    }
    try {
        // query the database to see if this specific jti already exists in the revoked_tokes table
        const { rows } = await pool.query(
            'SELECT 1 FROM revoked_tokens WHERE jti = $1 LIMIT 1',
            [decoded.jti]
        );
        // if jti is found in the database (the token was revoked (user logged out))
        if (rows.length > 0) {
            console.log('Revoked token attempted use, jti:', decoded.jti);
            rejectRequest(res, req, 401, 'Token has been revoked');
            return;
        }
    } catch (dbErr) {
        console.error('Blacklist check failed:', dbErr.message);
        rejectRequest(res, req, 500, 'Authentication error');
        return;
    }

    // if we get here, the token is valid and not revoked,
    //  so we can attach the user info to the request object for use in later middleware/routes
    const userResult = await pool.query(
        `SELECT 
            userid AS id,
            username,
            email,
            is_subscribed
        FROM users
        WHERE userid = $1`,
        [decoded.id]
    );

    if (userResult.rows.length === 0) {
        rejectRequest(res, req, 401, 'User not found');
        return;
    }

    req.user = userResult.rows[0];
    next();

};

export const authenticateTokenOptional = async (req, res, next) => {
    try {
        const token = req.cookies?.token;
        if (!token) return next();
        const decoded = jwt.verify(token, JWT_SECRET);
        if (!decoded.jti) return next();
        const { rows } = await pool.query(
            'SELECT 1 FROM revoked_tokens WHERE jti = $1 LIMIT 1',
            [decoded.jti]
        );
        if (rows.length === 0){
            const userResult = await pool.query(
                `SELECT
                    userid AS id,
                    username,
                    email,
                    is_subscribed
                FROM users
                WHERE userid = $1`,
                [decoded.id]
            );
            if (userResult.rows.length > 0){
                req.user = userResult.rows[0];
            }
        }
    } catch {
        // expired, tampered, or malformed — treat as unauthenticated
    }
    next();
};

export default authenticateToken;
