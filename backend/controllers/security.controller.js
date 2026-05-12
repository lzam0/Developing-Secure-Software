import crypto from 'crypto';
import SecurityModel from '../models/security.model.js';
import OtpModel from '../models/otp.model.js';

export class SecurityController {
    static async reportSuspiciousOtp(req, res, next) {
        try {
            const { token } = req.query;

            if (!token) {
                return res.status(400).send(`
                    <h1>Invalid link</h1>
                    <p>This suspicious activity link is missing a token.</p>
                `);
            }

            const tokenHash = crypto
                .createHash('sha256')
                .update(token)
                .digest('hex');

            const report = await SecurityModel.findValidReportToken(tokenHash);

            if (!report) {
                return res.status(400).send(`
                    <h1>Invalid or expired link</h1>
                    <p>This suspicious activity link is invalid, expired, or has already been used.</p>
                `);
            }

            await OtpModel.invalidateExistingOtps(report.userid, report.purpose);
            await SecurityModel.markReportTokenUsed(report.reportid);

            return res.status(200).send(`
                <h1>Verification code cancelled</h1>
                <p>The verification code has been invalidated and can no longer be used.</p>
                <p>If this was not you, please change your password or contact support.</p>
            `);
        } catch (error) {
            next(error);
        }
    }
}

export default SecurityController;