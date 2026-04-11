import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import cookieParser from "cookie-parser";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.routes.js";
import { errorHandler } from "./middleware/error.middleware.js";
import { authenticateToken } from "./middleware/auth.middleware.js";
import rateLimit from 'express-rate-limit';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// Initialize Express app
const app = express();

// Parse cookies and JSON before any middleware that reads them
app.use(cookieParser());
app.use(express.json());

// CORS (Cross-Origin Resource Sharing) - allow requests from the frontend
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));

// Rate Limiting Middleware - apply to all requests
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
});
app.use(globalLimiter);

// Auth-gated static routes — must come before express.static
const protectedPages = [
    '/payment.html',
    '/account.html',
    '/newBlog.html',
    '/blogListingPage.html',
    '/post.html',
    '/profile.html',
    '/health-metrics-tracker.html',
    '/healthdiary.html',
    '/medication-tracker.html',
];
app.use(protectedPages, authenticateToken, (res, req, next) => next());

// Single static file handler
app.use(express.static(path.join(__dirname, "../client")));

// API Routes
app.use("/auth", authRoutes);

// Error Handler - must be last
app.use(errorHandler);

const PORT = process.env.PORT;

// Running on PORT http://localhost:5000
app.listen(PORT, () => {
    console.log(`Server running on port http://localhost:${PORT}`);
});
