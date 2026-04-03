// Auth Controller
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { AuthService } from '../service/auth.service.js';

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

            // Generate 6-digit OTP
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            console.log("OTP:", otp)

            // Store temporary 2FA state in session
            req.session.otp = otp;
            req.session.userId = result.user.id;
            req.session.otpAttempts = 0;
            req.session.otpExpires = Date.now() + 5 * 60 * 1000;

            // Configure Nodemailer
            /* const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            });

            // Send OTP email
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: result.user.email,
                subject: 'Your login verification code',
                text: `Your verification code is: ${otp}. It expires in 5 minutes.`
            }); */

            if (process.env.EMAIL_USER && 
                process.env.EMAIL_PASS && 
                process.env.EMAIL_USER !== 'test@test.com') 
                {
                    const transporter = nodemailer.createTransport({
                        service: 'gmail',
                        auth: {
                            user: process.env.EMAIL_USER,
                            pass: process.env.EMAIL_PASS
                        }
                    });

                    await transporter.sendMail({
                        from: process.env.EMAIL_USER,
                        to: result.user.email,
                        subject: 'Your login verification code',
                        text: `Your verification code is: ${otp}. It expires in 5 minutes.`
                    });
                } 
            else {
                console.log('Email sending skipped in local test mode');
            }

            // Do not issue the real JWT yet
            res.status(200).json({
                success: true,
                message: 'OTP sent to email'
            });

            // Set JWT as HTTP-only cookie so the browser sends it automatically on future requests
            /* res.cookie('token', result.token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 2 * 60 * 60 * 1000 // 2 hours, matches JWT_EXPIRES_IN default
            });
            res.status(200).json({
                success: true,
                message: 'Login successful',
                data: result
            }); */
        }
        catch (error) {
            // Pass error to error handling middleware
            console.error(error);
            next(error);
        }
    }

    static async verifyOtp(req, res, next){ 
        try{
            const {otp} = req.body
            
            if (!req.session || !req.session.otp) {
                return res.status(400).json({
                    success: false,
                    message: 'No OTP session found'
                });
            }

            if (Date.now() > req.session.otpExpires) {
                return res.status(400).json({
                    success: false,
                    message: 'OTP expired'
                });
            }

            if (req.session.otpAttempts >= 3) {
                return res.status(429).json({
                    success: false,
                    message: 'Too many incorrect attempts'
                });
            }

            if (otp !== req.session.otp) {
                req.session.otpAttempts += 1;
                return res.status(401).json({
                    success: false,
                    message: 'Invalid verification code'
                });
            }

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
                message: 'Login successful'
            });

        } catch (error) {
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
