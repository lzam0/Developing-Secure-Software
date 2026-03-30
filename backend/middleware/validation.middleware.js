/**
 * Validate registration input
 */
export const validateSignUp = (req, res, next) => {
    const { username, email, password, confirmPassword } = req.body;

    // Check if all fields are present
    if (!username || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    // DYLAN - DO THIS
    // Implement password validation
    // Implment email validation with regex 

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
