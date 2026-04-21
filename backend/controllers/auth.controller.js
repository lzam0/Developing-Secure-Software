// Auth Controller
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { AuthService } from '../service/auth.service.js';
import OtpModel from '../models/otp.model.js';
import UserModel from '../models/user.model.js';
import EmailController from './email.controller.js';

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

            // Anti-enumeration path: if no user object is returned, respond generically without revealing whether the username/email already exists
            if (!result.user) {
                return res.status(201).json({
                    success: true,
                    message: result.message,
                    data: {
                        status: result.status
                    }
                });
            }

            // Generate signup verification OTP
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const otpHash = await bcrypt.hash(otp, parseInt(process.env.SALT_ROUNDS, 10));
            const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

            await OtpModel.invalidateExistingOtps(result.user.id, 'signup');
            await OtpModel.create(result.user.id, otpHash, 'signup', expiresAt);

            req.session.userId = result.user.id;
            req.session.otpPurpose = 'signup';

            await EmailController.sendSignUpOtpEmail(result.user.email, otp, result.user.username);
                
            return res.status(201).json({
                success: true,
                message: result.message,
                data: result
            });
        }
        catch (error) {
            // Pass error to error handling middleware
            console.error(error);
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

            // Generate login 2FA OTP
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const otpHash = await bcrypt.hash(otp, parseInt(process.env.SALT_ROUNDS, 10));
            const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

            await OtpModel.invalidateExistingOtps(result.user.id, 'signin');
            await OtpModel.create(result.user.id, otpHash, 'signin', expiresAt);

            req.session.userId = result.user.id;
            req.session.otpPurpose = 'signin';

            await EmailController.sendSignInOtpEmail(result.user.email, otp, result.user.username);

            return res.status(200).json({
                success: true,
                message: 'Verification code sent to email.'
            });

        }
        catch (error) {
            // Pass error to error handling middleware
            console.error(error);
            next(error);
        }
    }

    static async verifyOtp(req, res, next) {
    try {
        const { otp } = req.body;

        if (!req.session || !req.session.userId || !req.session.otpPurpose) {
            return res.status(400).json({
                success: false,
                message: 'No OTP session found'
            });
        }

        const otpRecord = await OtpModel.findLatestActiveByUserId(
            req.session.userId,
            req.session.otpPurpose
        );

        if (!otpRecord) {
            return res.status(400).json({
                success: false,
                message: 'No active verification code found'
            });
        }

        if (new Date() > new Date(otpRecord.expires_at)) {
            await OtpModel.markUsed(otpRecord.otpid);
            return res.status(400).json({
                success: false,
                message: 'OTP expired'
            });
        }

        if (otpRecord.attempts >= 5) {
            await OtpModel.markUsed(otpRecord.otpid);
            req.session.destroy(() => {});
            return res.status(403).json({
                success: false,
                message: 'Too many incorrect OTP attempts. Please start again.'
            });
        }

        const isOtpValid = await bcrypt.compare(otp, otpRecord.otp_hash);

        if (!isOtpValid) {
            await OtpModel.incrementAttempts(otpRecord.otpid);
            return res.status(401).json({
                success: false,
                message: 'Invalid verification code'
            });
        }

        await OtpModel.markUsed(otpRecord.otpid);

        if (req.session.otpPurpose === 'signup') {
            await UserModel.markVerified(req.session.userId);

            req.session.destroy(() => {});

            return res.status(200).json({
                success: true,
                message: 'Email verified successfully',
                redirectTo: 'login.html'
            });
        }

        if (req.session.otpPurpose === 'signin') {
            const token = jwt.sign(
                { id: req.session.userId },
                process.env.JWT_WEB_TOKEN_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN || '2h' }
            );

            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 2 * 60 * 60 * 1000
            });

            req.session.destroy(() => {});

            return res.status(200).json({
                success: true,
                message: 'Login successful',
                redirectTo: 'blogListingPage.html'
            });
        }

        return res.status(400).json({
            success: false,
            message: 'Invalid OTP purpose'
        });

    } catch (error) {
        console.error(error);
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
