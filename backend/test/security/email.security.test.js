import { expect } from "chai";
import EmailController from "../../controllers/email.controller.js";

describe("Email Security", () => {
    const originalCreateTransporter = EmailController.createTransporter;
    const originalSendEmail = EmailController.sendEmail;

    before(() => {
        process.env.EMAIL_USER = process.env.EMAIL_USER || "noreply@example.com";
        process.env.EMAIL_PASS = process.env.EMAIL_PASS || "app-password";
    });

    afterEach(() => {
        EmailController.createTransporter = originalCreateTransporter;
        EmailController.sendEmail = originalSendEmail;
    });

    it("sendEmail should send from the configured environment email address", async () => {
        let capturedMailOptions = null;

        EmailController.createTransporter = () => ({
            sendMail: async (mailOptions) => {
                capturedMailOptions = mailOptions;
            }
        });

        await EmailController.sendEmail(
            "user@example.com",
            "Test Subject",
            "Test body"
        );

        expect(capturedMailOptions).to.not.equal(null);
        expect(capturedMailOptions.to).to.equal("user@example.com");
        expect(capturedMailOptions.subject).to.equal("Test Subject");
        expect(capturedMailOptions.text).to.equal("Test body");
        expect(capturedMailOptions.from).to.equal(
            `Health and Lifestyle Blog Team <${process.env.EMAIL_USER}>`
        );
    });

    it("sendSignUpOtpEmail should build a signup verification email with OTP and expiry", async () => {
        let capturedArgs = null;

        EmailController.sendEmail = async (to, subject, text) => {
            capturedArgs = { to, subject, text };
        };

        await EmailController.sendSignUpOtpEmail(
            "newuser@example.com",
            "123456",
            "Aman"
        );

        expect(capturedArgs.to).to.equal("newuser@example.com");
        expect(capturedArgs.subject).to.equal("Verify your Health and Lifestyle Blog account");
        expect(capturedArgs.text).to.include("Hi Aman");
        expect(capturedArgs.text).to.include("123456");
        expect(capturedArgs.text).to.include("10 minutes");
        expect(capturedArgs.text.toLowerCase()).to.not.include((process.env.EMAIL_PASS || "").toLowerCase());
    });

    it("sendSignInOtpEmail should build a signin 2FA email with OTP and expiry", async () => {
        let capturedArgs = null;

        EmailController.sendEmail = async (to, subject, text) => {
            capturedArgs = { to, subject, text };
        };

        await EmailController.sendSignInOtpEmail(
            "existinguser@example.com",
            "654321",
            "Aman"
        );

        expect(capturedArgs.to).to.equal("existinguser@example.com");
        expect(capturedArgs.subject).to.equal("Your Health and Lifestyle Blog Sign-In Verification Code");
        expect(capturedArgs.text).to.include("Hi Aman");
        expect(capturedArgs.text).to.include("654321");
        expect(capturedArgs.text).to.include("5 minutes");
        expect(capturedArgs.text.toLowerCase()).to.not.include((process.env.EMAIL_PASS || "").toLowerCase());
    });

    it("sendEmail should rethrow transporter errors without leaking credentials in the thrown message", async () => {
        EmailController.createTransporter = () => ({
            sendMail: async () => {
                throw new Error("SMTP failed");
            }
        });

        let caught = null;

        try {
            await EmailController.sendEmail("user@example.com", "Subject", "Body");
        } catch (error) {
            caught = error;
        }

        expect(caught).to.not.equal(null);
        expect(caught.message).to.equal("SMTP failed");
        expect(caught.message.toLowerCase()).to.not.include((process.env.EMAIL_PASS || "").toLowerCase());
    });
});