/**
 * Validate registration input
 */
export const validateSignUp = (req, res, next) => {
    // Extract username, email, and password from request body
    const { username, email, password } = req.body;
    next();
};
/**
 * Validate login input
 */
export const validateSignIn = (req, res, next) => {
    // Accept identifier/email/username for backwards compatibility
    const { identifier, email, username, password } = req.body;
    next();
};
