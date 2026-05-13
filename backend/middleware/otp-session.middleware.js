export function requirePendingOtpSession(req, res, next) {
    const purpose = req.session?.otpPurpose;

    if (req.session?.userId && (purpose === 'signin' || purpose === 'signup')) {
        return next();
    }

    if (req.accepts('html')) {
        return res.redirect('/login.html');
    }

    return res.status(401).json({ success: false, message: 'No active OTP session' });
}
