import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import UserModel from '../models/user.model.js';
import dotenv from 'dotenv';
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
function generateToken(payload) {
    return jwt.sign(payload, JWT_WEB_TOKEN_SECRET, { expiresIn: JWT_EXPIRES_IN });
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

        // Check if the email is valid
        if (!this.validateEmail(email)) {
            const err = new Error('Invalid email format');
            err.statusCode = 400;
            throw err;
        }

        // Check if the password is valid
        if (!this.validatePassword(password)) {
            const err = new Error('Password does not meet requirements');
            err.statusCode = 400;
            throw err;
        }

        // Hash the password with salt and pepper
        const hashedPassword = await this.hashPassword(password);
        
        // Create the user
        const newUser = await UserModel.create(username, email, hashedPassword);
        
        // Generate JWT token for the new user
        const token = generateToken({ id: newUser.id, username: newUser.username });
        
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
        const isPasswordValid = await this.verifyPassword(password, user.password);
        if (!isPasswordValid) {
            const err = new Error('Invalid credentials');
            err.statusCode = 401;
            throw err;
        }

        // Generate JWT token for the authenticated user
        const token = generateToken({ id: user.id, username: user.username });

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

    // Dylan implement regex into here
    static validateEmail(email){
        /* Validate Email Constraints
        * 
        */
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

        if (!emailRegex.test(email)) {
            return false;
        } else {
            return true;
        }
        return null;
    }

    static validatePassword(password){
        /* Validate Password Constraints
        * 
        */

        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d){8,72}$/;

        if (!passwordRegex.test(password)) {
            return false;
        } else {
            return true;
        }
        return null;
    }

    static async hashPassword(password) {
        return await bcrypt.hash(password + PEPPER, SALT_ROUNDS);
    }

    static async verifyPassword(password, hash) {
        return bcrypt.compare(password + PEPPER, hash);
    }
}
export default AuthService;
