// Auth Controller
import { AuthService } from '../service/auth.service.js';
import UserModel from '../models/user.model.js';
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

        const { username, email, password, captchaToken } = req.body;

        // Validate Input
        if (!username || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (!captchaToken) {
            return res.status(400).json({ message: "Security check missing. Please refresh." });
        }

        const SECRET_KEY = process.env.RECAPTCHA_SECRET;
        const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${SECRET_KEY}&response=${captchaToken}`;

        // Verify with Google
        const recaptchaRes = await fetch(verifyUrl, { method: 'POST' });
        const recaptchaData = await recaptchaRes.json();

        // Check Google's score
        if (!recaptchaData.success || recaptchaData.score < 0.5) {
            return res.status(403).json({ 
                success: false, 
                message: "We were unable to verify your connection. If you are using a VPN or an ad-blocker, please try disabling them and refreshing the page." 
            });
        }
        console.log("Recaptcha Data from Google:", recaptchaData);

        // If the reCAPTCHA passed, call the AuthService to handle user registration
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
            const { identifier, username, email, password, captchaToken } = req.body;
            const loginIdentifier = identifier || email || username;
            // Validate Input
            if (!loginIdentifier || !password) {
                res.status(400).json({
                    success: false,
                    message: 'Username/email and password are required'
                });
                return;
            }

            
        if (!captchaToken) {
            return res.status(400).json({ message: "Security check missing. Please refresh." });
        }

        const SECRET_KEY = process.env.RECAPTCHA_SECRET;
        const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${SECRET_KEY}&response=${captchaToken}`;

        // Verify with Google
        const recaptchaRes = await fetch(verifyUrl, { method: 'POST' });
        const recaptchaData = await recaptchaRes.json();

        // Check Google's score
        if (!recaptchaData.success || recaptchaData.score < 0.5) {
            return res.status(403).json({ 
                success: false, 
                message: "We were unable to verify your connection. If you are using a VPN or an ad-blocker, please try disabling them and refreshing the page." 
            });
        }
        console.log("Recaptcha Data from Google:", recaptchaData);
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

            const { user } = result;
            res.status(200).json({
                success: true,
                message: 'Login successful',
                data: { user }
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
                const decoded = jwt.verify(token, JWT_SECRET);

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
            res.clearCookie('csrfToken', {
                httpOnly: false,
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

    /**
     * PATCH /auth/profile
     * Update the logged-in user's name and username
     */
    static async updateProfile(req, res, next) {
        try {
            const { username, name } = req.body;
            await UserModel.updateProfile(req.user.id, { username, name });
            res.status(200).json({ success: true, message: 'Profile updated successfully' });
        } catch (error) {
            next(error);
        }
    }

    /**
     * PATCH /auth/email
     * Update the logged-in user's email address
     */
    static async updateEmail(req, res, next) {
        try {
            const { email } = req.body;
            await UserModel.updateEmail(req.user.id, email);
            res.status(200).json({ success: true, message: 'Email updated successfully' });
        } catch (error) {
            next(error);
        }
    }

    /**
     * DELETE /auth/account
     * Delete the logged-in user's account — cascades to all related data
     */
    static async deleteAccount(req, res, next) {
        try {
            await UserModel.deleteUser(req.user.id);
            // Clear the auth and CSRF cookies so the browser session ends
            res.clearCookie('token', { httpOnly: true, sameSite: 'strict' });
            res.clearCookie('csrfToken', { sameSite: 'strict' });
            res.status(200).json({ success: true, message: 'Account deleted successfully' });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /auth/profile
     * Return the logged-in user's profile data for display on account.html
     */
    static async getProfile(req, res, next) {
        try {
            // req.user.id is set by authenticateToken middleware from the decoded JWT payload
            const profile = await UserModel.getUserWithProfile(req.user.id);

            if (!profile) {
                // Shouldn't happen for authenticated users but handled defensively
                return res.status(404).json({ success: false, message: 'User not found' });
            }

            // Only expose safe fields — never return password or internal fields
            res.status(200).json({
                success: true,
                data: {
                    username: profile.username,
                    email:    profile.email,
                    name:     profile.name ?? null, // null if no profile row exists yet
                    age:      profile.age  ?? null
                }
            });
        } catch (error) {
            next(error);
        }
    }
}
export default AuthController;
