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
    // If no token, return unauthorized
    if (!token) {
        console.log('No token found');
        res.status(401).json({
            success: false,
            message: 'Access token required'
        });
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
        // block the user with a 403 (forbidden) error 
        res.status(403).json({
            success: false,
            message: 'Invalid or expired token'
        });
        return;
    }
    // checking the jti with the revoked_tokens table 
    if (!decoded.jti) {
        return res.status(401).json({ success: false, message: 'Invalid token: missing jti' });
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
            // error 401 (authentication)
            res.status(401).json({ success: false, message: 'Token has been revoked' });
            return;
        }
    } catch (dbErr) {
        console.error('Blacklist check failed:', dbErr.message);
        res.status(500).json({ success: false, message: 'Authentication error' });
        return;
    }
    req.user = decoded;
    next();
};

export default authenticateToken;
