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
    // Extract email (email or username) and password from request body
    const { email, password } = req.body;
    next();
};
