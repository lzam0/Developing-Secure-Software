import { expect } from "chai";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import authController from "../../controllers/auth.controller.js";
import { requirePendingOtpSession } from "../../middleware/otp-session.middleware.js";
import { AuthService } from "../../service/auth.service.js";
import OtpModel from "../../models/otp.model.js";
import UserModel from "../../models/user.model.js";
import SecurityModel from "../../models/security.model.js";
import EmailController from "../../controllers/email.controller.js";

function createMockRes() {
    return {
        statusCode: 200,
        body: null,
        cookies: [],
        status(code) {
            this.statusCode = code;
            return this;
        },
        json(payload) {
            this.body = payload;
            return this;
        },
        cookie(name, value, options) {
            this.cookies.push({ name, value, options });
            return this;
        }
    };
}

describe("OTP Security", () => {
    const originalSignUp = AuthService.signUp;
    const originalSignIn = AuthService.signIn;
    const originalInvalidate = OtpModel.invalidateExistingOtps;
    const originalCreate = OtpModel.create;
    const originalFindLatest = OtpModel.findLatestActiveByUserId;
    const originalIncrement = OtpModel.incrementAttempts;
    const originalMarkUsed = OtpModel.markUsed;
    const originalMarkVerified = UserModel.markVerified;
    const originalCreateReportToken = SecurityModel.createReportToken;
    const originalSendSignUpOtpEmail = EmailController.sendSignUpOtpEmail;
    const originalSendSignInOtpEmail = EmailController.sendSignInOtpEmail;
    const originalBcryptHash = bcrypt.hash;
    const originalBcryptCompare = bcrypt.compare;
    const originalJwtSign = jwt.sign;
    const originalFetch = global.fetch;

    afterEach(() => {
        AuthService.signUp = originalSignUp;
        AuthService.signIn = originalSignIn;
        OtpModel.invalidateExistingOtps = originalInvalidate;
        OtpModel.create = originalCreate;
        OtpModel.findLatestActiveByUserId = originalFindLatest;
        OtpModel.incrementAttempts = originalIncrement;
        OtpModel.markUsed = originalMarkUsed;
        UserModel.markVerified = originalMarkVerified;
        SecurityModel.createReportToken = originalCreateReportToken;
        EmailController.sendSignUpOtpEmail = originalSendSignUpOtpEmail;
        EmailController.sendSignInOtpEmail = originalSendSignInOtpEmail;
        bcrypt.hash = originalBcryptHash;
        bcrypt.compare = originalBcryptCompare;
        jwt.sign = originalJwtSign;
        global.fetch = originalFetch;
    });

    it("signUp should return a generic success response when anti-enumeration path is triggered", async () => {
        AuthService.signUp = async () => ({
            message: "A verification email has been sent to your email address. Please check your inbox and follow the instructions to complete your registration.",
            status: "pending"
        });
        global.fetch = async () => ({
            json: async () => ({ success: true, score: 0.9 })
        });

        let otpTouched = false;
        OtpModel.invalidateExistingOtps = async () => { otpTouched = true; };
        OtpModel.create = async () => { otpTouched = true; };
        EmailController.sendSignUpOtpEmail = async () => { otpTouched = true; };

        const req = {
            body: { username: "takenuser", email: "taken@example.com", password: "password123", captchaToken: "captcha-token" },
            session: {}
        };
        const res = createMockRes();
        let nextCalled = false;

        await authController.signUp(req, res, () => {
            nextCalled = true;
        });

        expect(nextCalled).to.equal(false);
        expect(res.statusCode).to.equal(201);
        expect(res.body.success).to.equal(true);
        expect(res.body.data.status).to.equal("pending");
        expect(otpTouched).to.equal(false);
    });

    it("signUp should generate and send a signup OTP for a brand-new user", async () => {
        AuthService.signUp = async () => ({
            message: "Verification sent",
            status: "pending",
            user: {
                id: 10,
                username: "aman",
                email: "aman@example.com"
            }
        });
        global.fetch = async () => ({
            json: async () => ({ success: true, score: 0.9 })
        });

        let invalidated = false;
        let createdArgs = null;
        let emailedArgs = null;

        bcrypt.hash = async () => "hashed-otp";
        OtpModel.invalidateExistingOtps = async (userId, purpose) => {
            invalidated = userId === 10 && purpose === "signup";
        };
        OtpModel.create = async (userId, otpHash, purpose, expiresAt) => {
            createdArgs = { userId, otpHash, purpose, expiresAt };
            return { otpid: 1 };
        };
        EmailController.sendSignUpOtpEmail = async (email, otp, username) => {
            emailedArgs = { email, otp, username };
        };

        const req = {
            body: { username: "aman", email: "aman@example.com", password: "password123", captchaToken: "captcha-token" },
            session: {}
        };
        const res = createMockRes();

        await authController.signUp(req, res, () => {});

        expect(res.statusCode).to.equal(201);
        expect(invalidated).to.equal(true);
        expect(createdArgs.userId).to.equal(10);
        expect(createdArgs.otpHash).to.equal("hashed-otp");
        expect(createdArgs.purpose).to.equal("signup");
        expect(emailedArgs.email).to.equal("aman@example.com");
        expect(emailedArgs.username).to.equal("aman");
        expect(req.session.userId).to.equal(10);
        expect(req.session.otpPurpose).to.equal("signup");
    });

    // it("signIn should generate and send a signin OTP after valid credentials", async () => {
    //     AuthService.signIn = async () => ({
    //         user: {
    //             id: 20,
    //             username: "aman",
    //             email: "aman@example.com"
    //         }
    //     });
    //     global.fetch = async () => ({
    //         json: async () => ({ success: true, score: 0.9 })
    //     });

    //     let invalidated = false;
    //     let createdArgs = null;
    //     let emailedArgs = null;

    //     bcrypt.hash = async () => "hashed-otp";
    //     OtpModel.findLatestActiveByUserId = async () => null;
    //     OtpModel.invalidateExistingOtps = async (userId, purpose) => {
    //         invalidated = userId === 20 && purpose === "signin";
    //     };
    //     OtpModel.create = async (userId, otpHash, purpose, expiresAt) => {
    //         createdArgs = { userId, otpHash, purpose, expiresAt };
    //         return { otpid: 2 };
    //     };
    //     SecurityModel.createReportToken = async () => ({ id: 1 });
    //     EmailController.sendSignInOtpEmail = async (email, otp, username) => {
    //         emailedArgs = { email, otp, username };
    //     };

    //     const req = {
    //         body: { username: "aman", password: "password123", captchaToken: "captcha-token" },
    //         session: {}
    //     };
    //     const res = createMockRes();

    //     await authController.signIn(req, res, () => {});

    //     expect(res.statusCode).to.equal(200);
    //     expect(invalidated).to.equal(true);
    //     expect(createdArgs.userId).to.equal(20);
    //     expect(createdArgs.otpHash).to.equal("hashed-otp");
    //     expect(createdArgs.purpose).to.equal("signin");
    //     expect(emailedArgs.email).to.equal("aman@example.com");
    //     expect(emailedArgs.username).to.equal("aman");
    //     expect(req.session.userId).to.equal(20);
    //     expect(req.session.otpPurpose).to.equal("signin");
    // });

    it("verifyOtp should reject when there is no OTP session", () => {
        const req = { body: { otp: "123456" }, session: {}, accepts: () => false };
        const res = createMockRes();

        requirePendingOtpSession(req, res, () => {});

        expect(res.statusCode).to.equal(401);
        expect(res.body.message).to.equal("No active OTP session");
    });

    it("verifyOtp should reject expired OTP and mark it used", async () => {
        let markUsedCalled = false;

        OtpModel.findLatestActiveByUserId = async () => ({
            otpid: 7,
            otp_hash: "hash",
            purpose: "signup",
            expires_at: new Date(Date.now() - 60000),
            attempts: 0,
            used: false
        });
        OtpModel.markUsed = async (otpid) => {
            markUsedCalled = otpid === 7;
        };

        const req = {
            body: { otp: "123456" },
            session: {
                userId: 5,
                otpPurpose: "signup"
            }
        };
        const res = createMockRes();

        await authController.verifyOtp(req, res, () => {});

        expect(res.statusCode).to.equal(400);
        expect(res.body.message).to.equal("OTP expired");
        expect(markUsedCalled).to.equal(true);
    });

    it("verifyOtp should increment attempts when OTP is invalid", async () => {
        let incrementCalled = false;

        OtpModel.findLatestActiveByUserId = async () => ({
            otpid: 8,
            otp_hash: "hash",
            purpose: "signin",
            expires_at: new Date(Date.now() + 60000),
            attempts: 0,
            used: false
        });
        bcrypt.compare = async () => false;
        OtpModel.incrementAttempts = async (otpid) => {
            incrementCalled = otpid === 8;
            return { attempts: 1 };
        };

        const req = {
            body: { otp: "111111" },
            session: {
                userId: 5,
                otpPurpose: "signin"
            }
        };
        const res = createMockRes();

        await authController.verifyOtp(req, res, () => {});

        expect(res.statusCode).to.equal(401);
        expect(res.body.message).to.equal("Invalid verification code");
        expect(incrementCalled).to.equal(true);
    });

    it("verifyOtp should block after 5 failed attempts", async () => {
        let markUsedCalled = false;
        let destroyed = false;

        OtpModel.findLatestActiveByUserId = async () => ({
            otpid: 9,
            otp_hash: "hash",
            purpose: "signin",
            expires_at: new Date(Date.now() + 60000),
            attempts: 5,
            used: false
        });
        OtpModel.markUsed = async (otpid) => {
            markUsedCalled = otpid === 9;
        };

        const req = {
            body: { otp: "111111" },
            session: {
                userId: 5,
                otpPurpose: "signin",
                destroy(callback) {
                    destroyed = true;
                    callback();
                }
            }
        };
        const res = createMockRes();

        await authController.verifyOtp(req, res, () => {});

        expect(res.statusCode).to.equal(403);
        expect(res.body.message).to.equal("Too many incorrect OTP attempts. Please start again.");
        expect(markUsedCalled).to.equal(true);
        expect(destroyed).to.equal(true);
    });

    it("verifyOtp should mark user verified on correct signup OTP", async () => {
        let markVerifiedCalled = false;
        let markUsedCalled = false;
        let destroyed = false;

        OtpModel.findLatestActiveByUserId = async () => ({
            otpid: 10,
            otp_hash: "hash",
            purpose: "signup",
            expires_at: new Date(Date.now() + 60000),
            attempts: 0,
            used: false
        });
        bcrypt.compare = async () => true;
        OtpModel.markUsed = async (otpid) => {
            markUsedCalled = otpid === 10;
        };
        UserModel.markVerified = async (userId) => {
            markVerifiedCalled = userId === 5;
        };

        const req = {
            body: { otp: "123456" },
            session: {
                userId: 5,
                otpPurpose: "signup",
                destroy(callback) {
                    destroyed = true;
                    callback();
                }
            }
        };
        const res = createMockRes();

        await authController.verifyOtp(req, res, () => {});

        expect(res.statusCode).to.equal(200);
        expect(res.body.redirectTo).to.equal("login.html");
        expect(markUsedCalled).to.equal(true);
        expect(markVerifiedCalled).to.equal(true);
        expect(destroyed).to.equal(true);
    });

    it("verifyOtp should issue JWT cookie on correct signin OTP", async () => {
        let markUsedCalled = false;
        let destroyed = false;

        OtpModel.findLatestActiveByUserId = async () => ({
            otpid: 11,
            otp_hash: "hash",
            purpose: "signin",
            expires_at: new Date(Date.now() + 60000),
            attempts: 0,
            used: false
        });
        bcrypt.compare = async () => true;
        OtpModel.markUsed = async (otpid) => {
            markUsedCalled = otpid === 11;
        };
        jwt.sign = () => "signed.jwt.token";

        const req = {
            body: { otp: "654321" },
            session: {
                userId: 6,
                otpPurpose: "signin",
                destroy(callback) {
                    destroyed = true;
                    callback();
                }
            }
        };
        const res = createMockRes();

        await authController.verifyOtp(req, res, () => {});

        expect(res.statusCode).to.equal(200);
        expect(res.body.redirectTo).to.equal("blogListingPage.html");
        expect(markUsedCalled).to.equal(true);
        expect(destroyed).to.equal(true);
        expect(res.cookies).to.have.length(2);

        const tokenCookie = res.cookies.find(cookie => cookie.name === "token");
        const csrfCookie = res.cookies.find(cookie => cookie.name === "csrfToken");

        expect(tokenCookie.value).to.equal("signed.jwt.token");
        expect(tokenCookie.options.httpOnly).to.equal(true);
        expect(tokenCookie.options.sameSite).to.equal("strict");
        expect(csrfCookie.value).to.match(/^[a-f0-9]{64}$/);
        expect(csrfCookie.options.httpOnly).to.equal(false);
        expect(csrfCookie.options.sameSite).to.equal("strict");
    });
});
