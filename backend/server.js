import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import cookieParser from "cookie-parser";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.routes.js";
import { errorHandler } from "./middleware/error.middleware.js";

// const pool = require("pool");
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// Initialize Express app
const app = express();


// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL, // Your frontend URL
    credentials: true // Allow cookies
}));

// Parse JSON bodies and cookies
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "../client")));

// Routes
app.use("/auth", authRoutes);

// Error Handler - should be after all routes
app.use(errorHandler);

const PORT = process.env.PORT;
const resolvedPort = PORT || 5000;

// Running on PORT http://localhost:5000
app.listen(resolvedPort, () => {
    console.log(`Server running on port http://localhost:${resolvedPort}`);
});
