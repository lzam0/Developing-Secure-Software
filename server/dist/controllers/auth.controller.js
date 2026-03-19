// Auth Controller
import { AuthService } from '../service/auth.service.js';
export class AuthController {
    /**
 * POST /api/auth/signup
 * Sign Up a new user
 */
    static async signUp(req, res, next) {
        try {
            //  Extract username, email, and password from request body
            const { username, email, password } = req.body;
            // Validate Input
            if (!username || !email || !password) {
                return res.status(400).json({ message: "All fields are required" });
            }
            // Call the AuthService to handle user registration
            const result = await AuthService.signUp(username, email, password);
            res.status(201).json({
                success: true,
                message: 'User registered successfully',
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
            // Extract email (email or username) and password from request body
            const { email, password } = req.body;
            // Validate Input
            if (!email || !password) {
                res.status(400).json({
                    success: false,
                    message: 'Email and password are required'
                });
                return;
            }
            // Call the AuthService to handle user authentication
            const result = await AuthService.signIn(email, password);
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
        // Clear the token cookie
        res.status(200).json({
            success: true,
            message: 'Logout successful'
        });
    }
}
export default AuthController;
