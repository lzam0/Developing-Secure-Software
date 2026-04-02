import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import UserModel from '../models/user.model.js';
import dotenv from 'dotenv';
import { randomUUID } from 'crypto';
import pool from '../database/pool.js';

dotenv.config();
// Validate required environment variables
if (!process.env.JWT_WEB_TOKEN_SECRET) {
    throw new Error('FATAL: JWT_WEB_TOKEN_SECRET is not defined in .env file');
}
if (!process.env.JWT_EXPIRES_IN) {
    throw new Error('FATAL: JWT_EXPIRES_IN is not defined in .env file');
}
if (!process.env.SALT_ROUNDS) {
    throw new Error('FATAL: SALT_ROUNDS is not defined in .env file');
}
if (!process.env.PEPPER) {
    throw new Error('FATAL: PEPPER is not defined in .env file');
}


// Load environment variables 
const JWT_WEB_TOKEN_SECRET = process.env.JWT_WEB_TOKEN_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '2h';
const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS, 10);
const PEPPER = process.env.PEPPER;

// Helper function to generate token
// function generateToken(payload) {
//     return jwt.sign(payload, JWT_WEB_TOKEN_SECRET, { expiresIn: JWT_EXPIRES_IN });
// }

// convert a duration string into milliseconds
function parseDurationMs(duration) { // calculate the expires_at timestamp stored in the datavase + revoked jti
    const units = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 }; // milliseconds per unit (minute, hour, day)
    const match = String(duration).match(/^(\d+)([smhd])$/); // regex - ^(\d+) (number (2)), ([smhd])$ (unit (h)) 
    if (!match) return 2 * 3_600_000;
    return parseInt(match[1], 10) * units[match[2]]; // multiply number by unit value 
}

// helper function to generate token  
function generateToken(payload) {
    const jti = randomUUID(); // create unique jti for every jwt token
    // create the token
    // takes the user's info and hides the jti inside it, locked using JWT_WEB_TOKEN_SECRET
    const token = jwt.sign({ ...payload, jti }, JWT_WEB_TOKEN_SECRET, { expiresIn: JWT_EXPIRES_IN }); 
    // calculate when token will expire
    const expiresAt = new Date(Date.now() + parseDurationMs(JWT_EXPIRES_IN));
    return { token, jti, expiresAt }; // return for sign-in process
}

// AuthService class to handle authentication logic
export class AuthService {
    // Register a new user
    static async signUp(username, email, password) {

        // Check if user already exists
        const existingUser = await UserModel.findByEmailOrUsername(email) || await UserModel.findByEmailOrUsername(username);

        // If user exists, throw an error
        if (existingUser) {
            const err = new Error('User already exists');
            err.statusCode = 409;
            throw err;
        }

        // Hash the password with salt and pepper
        const hashedPassword = await bcrypt.hash(password + PEPPER, SALT_ROUNDS);
        
        // Create the user
        const newUser = await UserModel.create(username, email, hashedPassword);
        
        // Generate JWT token for the new user
        const { token } = generateToken({ id: newUser.id, username: newUser.username });
        
        // Return user details and token - userID, username, email, token
        return {
            user: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email
            },
            token
        };
    }

    // Sign In User
    static async signIn(identifier, password) {

        // Find user by email or username
        const user = await UserModel.findByEmailOrUsername(identifier);

        // If user not found, throw an error
        if (!user) {
            const err = new Error('Invalid credentials');
            err.statusCode = 401;
            throw err;
        }

        // Compare the provided password with the stored hashed password
        const isPasswordValid = await bcrypt.compare(password + PEPPER, user.password);
        if (!isPasswordValid) {
            const err = new Error('Invalid credentials');
            err.statusCode = 401;
            throw err;
        }

        // Generate JWT token for the authenticated user
        const { token } = generateToken({ id: user.id, username: user.username });

        // Return user details and token - userID, username, email, token
        return {
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            },
            token
        };
    }

    static async revokeToken(jti, userID, expiresAt) {
        await pool.query(
            `INSERT INTO revoked_tokens (jti, userid, expires_at)
             VALUES ($1, $2, $3)
             ON CONFLICT (jti) DO NOTHING`,
             [jti, userID, expiresAt]
        );
    }
}
export default AuthService;

// TEST NEED TO REMOVE
// const testPayload = { id: 1, username: 'testuser'};
// const result = generateToken(testPayload);

// console.log("1. Token string created:", result.token.substring(0, 20));
// console.log("2. Unique jti generated:", result.jti);
// console.log("3. Expiry date calculated", result.expiresAt.toLocaleString());
