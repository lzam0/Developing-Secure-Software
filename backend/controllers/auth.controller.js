// Auth Controller
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { AuthService } from '../service/auth.service.js';
import OtpModel from '../models/otp.model.js';
import UserModel from '../models/user.model.js';
import SecurityModel from '../models/security.model.js';
import EmailController from './email.controller.js';
import dotenv from 'dotenv';
import { issueCSRFToken } from '../middleware/csrf.middleware.js';

dotenv.config();

const JWT_SECRET = process.env.JWT_WEB_TOKEN_SECRET;

function generateOtp() {
    return crypto.randomInt(100000, 1000000).toString();
}

// Create a new session after sign up or sign in
// store the user ID and OTP purpose in the session for later verification
async function regenerateSession(req) {
    if (!req.session?.regenerate) {
        return;
    }

    // regenerate the session to prevent session fixation attacks, and promisify it to use async/await
    await new Promise((resolve, reject) => {
        req.session.regenerate((error) => {
            if (error) reject(error);
            else resolve();
        });
    });
}

export class AuthController {
    /**
    * POST /api/auth/signup
    * Sign Up a new user
    **/
    static async signUp(req, res, next) {
        try {
            console.log("SIGN UP CALL")

            // Extract username, email, password, and captchaToken from the request body
            const { username, email, password, captchaToken } = req.body;

            // Validate Input
            if (!username || !email || !password) {
                return res.status(400).json({ message: "All fields are required" });
            }

            // Check if captchaToken is present
            if (!captchaToken) {
                return res.status(400).json({ message: "Security check missing. Please refresh." });
            }

            // Verify the captchaToken with Google's reCAPTCHA API to ensure the request is from a human and not a bot
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

            // Anti-enumeration path: if no user object is returned, respond generically without revealing whether the email/username already exists
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
            const otp = generateOtp();
            const otpHash = await bcrypt.hash(otp, parseInt(process.env.SALT_ROUNDS, 10));
            const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
            
            // Invalidate any existing OTPs for this user and purpose
            // then create a new OTP record in the database with the hashed OTP, purpose, and expiry time
            await OtpModel.invalidateExistingOtps(result.user.id, 'signup');
            await OtpModel.create(result.user.id, otpHash, 'signup', expiresAt);

            // Regenerate the session to prevent session fixation
            await regenerateSession(req);
            req.session.userId = result.user.id;
            req.session.otpPurpose = 'signup';

            // Send the OTP to the user's email for verification using the EmailController
            await EmailController.sendSignUpOtpEmail(
                result.user.email,
                otp,
                result.user.username
            );
            
            // Respond with a generic success message indicating that the registration was successful and an OTP has been sent
            // It does not reveal whether the email/username already exists or not, to prevent user enumeration attacks
            return res.status(201).json({
                success: true,
                message: result.message,
                data: result
            });
            
        }
        catch (error) {
            console.error("sign up call error:", error);
            next(error);
        }
    }

    /** POST /api/auth/signin
     * Sign In an existing user
     */
    static async signIn(req, res, next) {
        try {    
            // Extract email and password from request body
            const { identifier, email, password, captchaToken } = req.body;
            const loginEmail = email || identifier;
            // Validate Input
            if (!loginEmail || !password) {
                res.status(400).json({
                    success: false,
                    message: 'Email and password are required'
                });
                return;
            }

            // Check if captchaToken is present
            if (!captchaToken) {
                return res.status(400).json({ message: "Security check missing. Please refresh." });
            }

            // Verify the captchaToken with Google's reCAPTCHA API to ensure the request is from a human and not a bot
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
        const result = await AuthService.signIn(loginEmail, password);

        // Check if there's already an active OTP for the user
        const existingOtp = await OtpModel.findLatestActiveByUserId(
            result.user.id,
            'signin'
        );

        if (existingOtp){
            return res.status(429).json({
                success: false,
                message: 'A verification code has already been sent. Please check your email or wait 5 minutes for the code to expire.'
            });
        }

            // Generate login 2FA OTP
            const otp = generateOtp();
            const otpHash = await bcrypt.hash(otp, parseInt(process.env.SALT_ROUNDS, 10));
            const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

            // Invalidate any existing OTPs for this user and purpose
            await OtpModel.invalidateExistingOtps(result.user.id, 'signin');
            await OtpModel.create(result.user.id, otpHash, 'signin', expiresAt);

            await regenerateSession(req);
            req.session.userId = result.user.id;
            req.session.otpPurpose = 'signin';

        //Create a separate secure token for reporting a suspicious sign-in OTP email
        const reportToken = crypto.randomBytes(32).toString('hex');

        //Store only the hashed token so the plain report token is never persisted
        const reportTokenHash = crypto
            .createHash('sha256')
            .update(reportToken)
            .digest('hex');

        //Keep the report link short-lived to limit the window for misuse
        const reportTokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

        //Save the hashed report token for later validation when the report link is used
        await SecurityModel.createReportToken(
            result.user.id,
            reportTokenHash,
            'signin',
            reportTokenExpiresAt
        );

        //Send the plain token only inside the email link; validation will compare its hash
        const reportUrl = `${process.env.CLIENT_URL}/security/report-otp?token=${reportToken}`;

            await EmailController.sendSignInOtpEmail(
                result.user.email,
                otp,
                result.user.username,
                reportUrl
            );

            // Generic success message
            return res.status(200).json({ success: true, message: 'Verification code sent to email.'});
        }catch (error) {
            // Pass error to error handling middleware
            console.error(error);
            next(error);
        }
    }

    // POST /api/auth/verify-otp
    static async verifyOtp(req, res, next) {
        try {
            // Extract the OTP from the request body
            const { otp } = req.body;

        //load the newest unused OTP for the user and purpose stored in the temp session
        const otpRecord = await OtpModel.findLatestActiveByUserId(
            req.session.userId,
            req.session.otpPurpose
        );

            // No active OTP found for this user and purpose
            // OTP was already used, expired, or never generated
            // Respond with a generic message to avoid revealing which case it is
            if (!otpRecord) {
                return res.status(400).json({
                    success: false,
                    message: 'No active verification code found'
                });
            }

        //expired OTPs are marked used so they can't be retried later
        if (new Date() > new Date(otpRecord.expires_at)) {
            await OtpModel.markUsed(otpRecord.otpid);
            return res.status(400).json({
                success: false,
                message: 'OTP expired'
            });
        }

        //lock the flow after repeated failures and clear the temp session
        if (otpRecord.attempts >= 5) {
            await OtpModel.markUsed(otpRecord.otpid);
            req.session.destroy(() => {});
            return res.status(403).json({
                success: false,
                message: 'Too many incorrect OTP attempts. Please start again.'
            });
        }

        //compare submitted code against the stored bcrypt hash
        const isOtpValid = await bcrypt.compare(otp, otpRecord.otp_hash);

            if (!isOtpValid) {
                await OtpModel.incrementAttempts(otpRecord.otpid);
                return res.status(401).json({
                    success: false,
                    message: 'Invalid verification code'
                });
            }

        //a valid OTP is single-use, even after successful verification
        await OtpModel.markUsed(otpRecord.otpid);

        //signup OTPs complete email verification, then require user to sign in
        if (req.session.otpPurpose === 'signup') {
            await UserModel.markVerified(req.session.userId);

            req.session.destroy(() => {});

                return res.status(200).json({
                    success: true,
                    message: 'Email verified successfully',
                    redirectTo: 'login.html'
                });
            }

        //sign in OTPs complete authentication by issuing JWT and CSRF cookies
        if (req.session.otpPurpose === 'signin') {
            const jti = crypto.randomUUID();

            //include a unique token id so JWT can be revoked on sign out
            const token = jwt.sign(
                {
                    id: req.session.userId,
                    jti
                },
                process.env.JWT_WEB_TOKEN_SECRET,
                {
                    expiresIn: process.env.JWT_EXPIRES_IN || '2h'
                }
            );

            //store the JWT in a HTTP-only cookie to reduce client-side script access
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 2 * 60 * 60 * 1000
            });

            //expose the CSRF token to the frontend so it can be sent with unsafe requests
            res.cookie('csrfToken', issueCSRFToken(), {
                httpOnly: false,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 2 * 60 * 60 * 1000
            });

            //clear the temp OTP session once persistent auth cookies are issued
            req.session.destroy(() => {});

                // Respond with a success message
                return res.status(200).json({
                    success: true,
                    message: 'Login successful',
                    redirectTo: 'blogListingPage.html'
                });
            }

            // If OTP is valid but purpose is unknown, respond with an error
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
            // Only allow updating username and name, not email or password here
            const { username, name } = req.body;

            // check if current username and name is not the same as the new username and name
            if (username === req.user.username && name === req.user.name) {
                return res.status(400).json({ success: false, message: 'No changes detected in profile information' });
            }

            // Call the UserModel to update the user's profile information in the database
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
            // Only allow updating email, not username or name here
            const { email } = req.body;

            // check if current email is the same as the new email
            if (email === req.user.email) {
                return res.status(400).json({ success: false, message: 'New email address must be different from current email' });
            }

            // Call the UserModel to update the user's email in the database
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
            // Call the UserModel to delete the user's account from the database, which should also cascade and delete all related data (e.g., profile, posts, comments)
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
     * PATCH /auth/profile
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

    /**
     * PATCH /auth/password
     * Change the logged-in user's password, requires current password for confirmation
     *
     * 1. Check if password fields are present
     * 2. Check if currentPassword is correct by comparing with the hashed password in the database
     * 3. Check if the new password is different from the current password and meets complexity requirements
     * 4. Hash the new password and update it in the database, then revoke the current session
     */
    static async changePassword(req, res, next) {
        try {
            const { currentPassword, newPassword } = req.body;

            // 1. Check if password fields are present
            if (!currentPassword || !newPassword) {
                return res.status(400).json({ success: false, message: 'Current and new password are required' });
            }

            // 2. Fetch stored hash and verify currentPassword against it
            const user = await UserModel.findById(req.user.id);

            // Check if password is correct using the AuthService's verifyPassword method, which handles hashing and pepper
            const isCurrentPasswordValid = await AuthService.verifyPassword(currentPassword, user.password);

            if (!isCurrentPasswordValid) {
                return res.status(401).json({ success: false, message: 'Current password is incorrect' });
            }

            // 3. Reject if new password is the same, then validate complexity
            if (currentPassword === newPassword) {
                return res.status(400).json({ success: false, message: 'New password must be different from current password' });
            }

            // Check if the new password meets complexity requirements (e.g., length, character types)
            if (!AuthService.validatePassword(newPassword)) {
                return res.status(400).json({ success: false, message: 'New password does not meet complexity requirements' });
            }

            // 4. Hash and update, then revoke current JWT so all sessions are invalidated
            const hashedNewPassword = await AuthService.hashPassword(newPassword);
            await AuthService.changePassword(req.user.id, hashedNewPassword);

            // Revoke the current token by adding its jti to the revoked_tokens table, so it can no longer be used
            const token = req.cookies?.token;
            if (token) {
                const decoded = jwt.verify(token, JWT_SECRET);

                // Check if the token has a jti and exp, then revoke it so it can't be used again after the password change
                if (decoded?.jti && decoded?.exp) {
                    await AuthService.revokeToken(decoded.jti, req.user.id, new Date(decoded.exp * 1000));
                }
            }

            // Clear the auth and CSRF cookies to log the user out of all sessions, including the current one with the old password
            res.clearCookie('token', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' });
            res.clearCookie('csrfToken', { httpOnly: false, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' });
            res.status(200).json({ success: true, message: 'Password changed successfully. Please sign in again.' });
        } catch (error) {
            next(error);
        }
    }
}
export default AuthController;
