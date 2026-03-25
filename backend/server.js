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
const app = express();
/*
* Security considerations: include SameSite Cookies and secure cookies in production
*/
// Middleware
app.use(cors({
    origin: 'http://localhost:3000', // Your frontend URL
    credentials: true // Allow cookies
}));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "../client")));
// Routes
app.use("/auth", authRoutes);
// Error Handler - should be after all routes
app.use(errorHandler);
const PORT = process.env.PORT;
// Running on PORT 3000
app.listen(PORT, () => {
    console.log(`Server running on port http://localhost:${PORT}`);
});
