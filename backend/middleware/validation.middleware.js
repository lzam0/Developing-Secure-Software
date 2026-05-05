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

const VALID_TAGS = ['Health Support', 'Lifestyle', 'Mindfulness', 'Sleep & Recovery'];

export const validatePost = (req, res, next) => {
    const { title, tags, content } = req.body;

    if (!title || !tags || !content) {
        return res.status(400).json({ success: false, message: 'Title, tags, and content are required' });
    }

    if (typeof title !== 'string' || title.trim().length === 0 || title.length > 255) {
        return res.status(400).json({ success: false, message: 'Title must be between 1 and 255 characters' });
    }

    const tagsArray = Array.isArray(tags) ? tags : [tags];
    if (tagsArray.some(tag => !VALID_TAGS.includes(tag))) {
        return res.status(400).json({ success: false, message: `Tags must be one of: ${VALID_TAGS.join(', ')}` });
    }

    if (typeof content !== 'string' || content.trim().length === 0) {
        return res.status(400).json({ success: false, message: 'Content cannot be empty' });
    }

    next();
};
