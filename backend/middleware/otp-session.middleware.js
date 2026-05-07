export function requirePendingOtpSession(req, res, next) {

    // Check if the session has a userId and an otpPurpose of either 'signin' or 'signup'
    const purpose = req.session?.otpPurpose;

    // Check if the current session is sign in or sign up
    if (req.session?.userId && (purpose === 'signin' || purpose === 'signup')) {
        return next();
    }

    // If not, redirect to the login page
    return res.redirect('/login.html');
}
