// Auth Controller
import { AuthService } from '../service/auth.service.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { issueCSRFToken } from '../middleware/csrf.middleware.js';
dotenv.config();

const JWT_SECRET = process.env.JWT_WEB_TOKEN_SECRET;

export class AuthController {
    /**
 * POST /api/auth/signup
 * Sign Up a new user
 */
    static async signUp(req, res, next) {
        try {
            console.log("SIGN UP CALL")
            //  Extract username, email, and password from request body
            const { username, email, password } = req.body;
            // Validate Input
            if (!username || !email || !password) {
                return res.status(400).json({ message: "All fields are required" });
            }
            // Call the AuthService to handle user registration
            const result = await AuthService.signUp(username, email, password);

            // Set CSRF token as HTTP-only on response
            res.cookie('csrfToken', issueCSRFToken() , {
                httpOnly: false,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 2 * 60 * 60 * 1000
            });
        
            res.status(201).json({
                success: true,
                message: result.message,
                data: result
            });
        }
        catch (error) {
            // Pass error to error handling middleware
            next(error);
        }
    }
    /**
 * POST /api/auth/signin
 * Sign In an existing user
 */
    static async signIn(req, res, next) {
        try {
            // Extract identifier (email or username) and password from request body
            const { identifier, email, username, password } = req.body;
            const loginIdentifier = identifier || email || username;
            // Validate Input
            if (!loginIdentifier || !password) {
                res.status(400).json({
                    success: false,
                    message: 'Username/email and password are required'
                });
                return;
            }
            // Call the AuthService to handle user authentication
            const result = await AuthService.signIn(loginIdentifier, password);
            
            // revoke the old token before making a new one 
            // prevent a malicious actor from using the old token
            const oldToken = req.cookies?.token;
            if (oldToken) {
                try {
                    // decode and verify the existing token
                    const decoded = jwt.verify(oldToken, JWT_SECRET);
                    // check if the token has a jti (unique for specific tokens)
                    if (decoded?.jti) {
                        // convert expiry time to milliseconds
                        const expiresAt = new Date(decoded.exp * 1000);
                        // add the token to the revoked_tokens table by callng AuthService
                        // decoded.jti: unique token identifier 
                        // decoded.id: user id with the token 
                        // expiresAt: when the token is due to expire 
                        await AuthService.revokeToken(decoded.jti, decoded.id, expiresAt);
                    }
                } catch {
                    // old token already expired or invalid 
                }
            }
            // Set JWT as HTTP-only cookie so the browser sends it automatically on future requests
            res.cookie('token', result.token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 2 * 60 * 60 * 1000 // 2 hours, matches JWT_EXPIRES_IN default
            });
            // Set CSRF token as HTTP-only on response
            res.cookie('csrfToken', issueCSRFToken() , {
                httpOnly: false,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 2 * 60 * 60 * 1000
            });

            res.status(200).json({
                success: true,
                message: 'Login successful',
                data: result
            });
        }
        catch (error) {
            // Pass error to error handling middleware
            next(error);
        }
    }
    /**
 * POST /api/auth/signout
 * Sign Out the user by clearing the token cookie
 */
    static async signOut(req, res, next) {
        try {
            // read the current token (JWT) from the cookie
            const token = req.cookies?.token

            if (token) { 
                // inside the token ti see the serial number (jti) and its expiry time
                const decoded = jwt.decode(token); 
                // check if the token has a serial number and expiry time 
                // then add it to revoked_token table 
                if (decoded?.jti && decoded?.exp) { 
                    // convert number to a date 
                    const expiresAt = new Date(decoded.exp * 1000); 
                    // tell the database to blacklist this specific jti
                    await AuthService.revokeToken(decoded.jti, decoded.id, expiresAt); 
                }
            }
            // tell the browser to delete the token cookie 
            res.clearCookie('token', {
                httpOnly: true, 
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict'
            });
            
            res.status(200).json({
                success: true,
                message: 'Logout successful'
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/auth/verify
     * Verify the user is authenticated
     */
    static async verify(req, res) {
        res.status(200).json({ success: true, user: req.user });
    }
}
export default AuthController;
