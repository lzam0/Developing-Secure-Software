import nodemailer from 'nodemailer';

export class EmailController {

    //Create reusable transporter for sending emails
    static createTransporter() {
        return nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }

    //General reusable email sender
    static async sendEmail(to, subject, text) {
        const transporter = this.createTransporter();

        const mailOptions = {
            from: `Health and Lifestyle Blog Team <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text
        };

        try {
            await transporter.sendMail(mailOptions);
            console.log(`Email sent successfully to ${to}`);
        } catch (error) {
            console.error('Error sending email:', error);
            throw error;
        }
    }


    //Sign Up Verification OTP Email
    static async sendSignUpOtpEmail(to, otp, username = 'User') {

        const subject = 'Verify your Health and Lifestyle Blog account';

        const text = `
        Hi ${username},

        Thank you for signing up to Health and Lifestyle Blog.

        To complete your registration and verify your email address, please use the following 6-digit verification code:

        ${otp}

        This code will expire in 10 minutes.

        If you did not create this account, please ignore this email.

        Kind regards,
        Health and Lifestyle Blog Team`;


        await this.sendEmail(to, subject, text);
    }

    //Sign In 2FA Email
    static async sendSignInOtpEmail(to, otp, username = 'User') {

        const subject = 'Your Health and Lifestyle Blog Sign-In Verification Code';

        const text = `
        Hi ${username},

        We received a request to sign in to your Health and Lifestyle Blog account.

        To complete your login securely, please use the following 6-digit verification code:

        ${otp}

        This code will expire in 5 minutes.

        If this was not you, please ignore this email and consider changing your password.

        Kind regards,
        Health and Lifestyle Blog Team`;


        await this.sendEmail(to, subject, text);
    }
}

export default EmailController;