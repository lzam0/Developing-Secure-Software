import express from 'express';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import pool from '../../controllers/database.js';
import helmet from 'helmet';
import { AuthService } from '../../service/auth.service.js';
import { sanitiseBody } from '../../middleware/sanitise.middleware.js';

/**
 * Creates a self-contained Express app for security testing.
 * Accepts a `secret` parameter so tests control the signing key independently of .env.
 */

export function createTestApp({ secret = 'test-secret-for-testing-only' } = {}) {
    const app = express();

    app.use(helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'"],
                styleSrc:  ["'self'"],
                imgSrc: ["'self'", "data:"],
                connectSrc: ["'self'"],
                fontSrc: ["'self'"],
                objectSrc: ["'none'"],
                frameAncestors: ["'none'"]
            }
        }
    }));

    app.use(express.json());
    app.use(sanitiseBody);
    app.use(cookieParser());

    // Inline authenticateToken — uses the test secret, no env var dependency
    const authenticateToken = async (req, res, next) => {
        const token = req.cookies?.token;
        if (!token) {
            return res.status(401).json({ success: false, message: 'Access token required' });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, secret);
        } catch (err) {
            return res.status(403).json({ success: false, message: 'Invalid or expired token' });
        }

        if (!decoded.jti) {
            return res.status(401).json({ success:false, message: 'Invalid token: missing jti' });
        }
        try {
            const { rows } = await pool.query(
                'SELECT 1 FROM revoked_tokens WHERE jti = $1 LIMIT 1',
                [decoded.jti]
            );
            if (rows.length > 0) {
                return res.status(401).json({ success: false, message: 'Token has been revoked' });
            }
        } catch (dbErr) {
            return res.status(500).json({ success: false, message: 'Authentication error' });
        }
        req.user = decoded;
        next();
    };

    // POST /auth/signin — stub: only testuser/Password123 succeeds
    app.post('/auth/signin', (req, res) => {
        const { identifier, password } = req.body;
        if (identifier !== 'testuser' || password !== 'Password123') {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
        const jti = `test-session-${Date.now()}`;
        const token = jwt.sign({ id: 1, username: 'testuser', jti }, secret, { expiresIn: '2h' });
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 2 * 60 * 60 * 1000
        });
        return res.status(200).json({ success: true, message: 'Login successful' });
    });

    // POST /auth/signout — clears cookie
    app.post('/auth/signout', async (req, res) => {
        try {
            const token = req.cookies.token;
            if (token) {
                const decoded = jwt.decode(token);
                if (decoded.jti && decoded.exp) {
                    const expiresAt = new Date(decoded.exp * 1000);
                    await AuthService.revokeToken(decoded.jti, decoded.id, expiresAt);
                }
            }
            res.clearCookie('token', {
                httpOnly: true, 
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict'
            });
            return res.status(200).json({ success: true, message: 'Logout successful' });
        } catch (err) {
            return res.status(500).json({ success: false, message: 'Signout error' });
        }
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
