import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
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
export const authenticateToken = (req, res, next) => {
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
    // Verify token
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            console.log('Token verification failed:', err.message);
            res.status(403).json({
                success: false,
                message: 'Invalid or expired token'
            });
            return;
        }
        // Log decoded token for debugging
        console.log('Token verified, user:', decoded);
        // Attach user to request
        req.user = decoded;
        next();
    });
};
export default authenticateToken;
