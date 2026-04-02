import express from 'express';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';

/**
 * Creates a self-contained Express app for security testing.
 * Does NOT import auth.service.js or connect to the database.
 * Accepts a `secret` parameter so tests control the signing key independently of .env.
 */
export function createTestApp({ secret = 'test-secret-for-testing-only' } = {}) {
    const app = express();
    app.use(express.json());
    app.use(cookieParser());

    // Inline authenticateToken — uses the test secret, no env var dependency
    const authenticateToken = (req, res, next) => {
        const token = req.cookies?.token;
        if (!token) {
            return res.status(401).json({ success: false, message: 'Access token required' });
        }
        jwt.verify(token, secret, (err, decoded) => {
            if (err) {
                return res.status(403).json({ success: false, message: 'Invalid or expired token' });
            }
            req.user = decoded;
            next();
        });
    };

    // POST /auth/signin — stub: only testuser/Password123 succeeds
    app.post('/auth/signin', (req, res) => {
        const { identifier, password } = req.body;
        if (identifier !== 'testuser' || password !== 'Password123') {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
        const token = jwt.sign({ id: 1, username: 'testuser' }, secret, { expiresIn: '2h' });
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 2 * 60 * 60 * 1000
        });
        return res.status(200).json({ success: true, message: 'Login successful' });
    });

    // POST /auth/signout — clears cookie
    app.post('/auth/signout', (req, res) => {
        res.clearCookie('token');
        return res.status(200).json({ success: true, message: 'Logout successful' });
    });

    // GET /auth/verify — protected route
    app.get('/auth/verify', authenticateToken, (req, res) => {
        return res.status(200).json({ success: true, user: req.user });
    });

    // GET /api/protected — generic protected route used in most middleware tests
    app.get('/api/protected', authenticateToken, (req, res) => {
        return res.status(200).json({ success: true, data: 'secret data' });
    });

    return app;
}
