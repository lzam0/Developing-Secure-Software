// Auth Controller
import { AuthService } from '../service/auth.service.js';
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
                message: "Security check failed. Automated requests are not allowed." 
            });
        }
        console.log("Recaptcha Data from Google:", recaptchaData);

        // If the reCAPTCHA passed, call the AuthService to handle user registration
        const result = await AuthService.signUp(username, email, password);
        
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

            // Set JWT as HTTP-only cookie so the browser sends it automatically on future requests
            res.cookie('token', result.token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 2 * 60 * 60 * 1000 // 2 hours, matches JWT_EXPIRES_IN default
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
    static async signOut(req, res) {
        // Clear the token cookie off browser
        res.clearCookie('token');
        res.status(200).json({
            success: true,
            message: 'Logout successful'
        });
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
