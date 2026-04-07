/**
 * Validate registration input
 */
export const validateSignUp = (req, res, next) => {
    const { username, email, password, confirmPassword } = req.body;

    // Check if all fields are present
    if (!username || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    
    // Implement password validation
    // Implment email validation with regex 
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d){8,72}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    if (!passwordRegex.test(password)) {
        return res.status(400).json({ message: "Password must be 8-72 characters long and include at least one letter and one number" });
    }

    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Invalid email format" });
    }

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
