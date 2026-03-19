import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import UserModel from '../models/user.model';
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
const JWT_WEB_TOKEN_SECRET : string = process.env.JWT_WEB_TOKEN_SECRET;
const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || '2h';
const SALT_ROUNDS: number = parseInt(process.env.SALT_ROUNDS, 10);
const PEPPER: string = process.env.PEPPER;

// Helper function to generate token
function generateToken(payload: { id: number; username: string }): string {
    
    return jwt.sign(
        payload,
        JWT_WEB_TOKEN_SECRET,
        { expiresIn: JWT_EXPIRES_IN as string | number }
    );
}

export class AuthService {
    // Register a new user
    static async register(username: string, email: string, password: string) {
        // Check if user already exists
        const existingUser = await UserModel.findByEmailOrUsername(email) || await UserModel.findByEmailOrUsername(username);
        
        // If user exists, throw an error
        if (existingUser) {
            throw new Error('User already exists');
        }

        // Hash the password with salt and pepper
        const hashedPassword = await bcrypt.hash(password + PEPPER, SALT_ROUNDS);
        
        // Create the user
        const newUser = await UserModel.create(username, email, hashedPassword);

        // Generate JWT token for the new user
        const token = generateToken({ id: newUser.id, username: newUser.username });

        // Return user details and token
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
    static async signIn(identifier: string, password: string) {
        // Find user by email or username
        const user = await UserModel.findByEmailOrUsername(identifier);
        
        // If user not found, throw an error
        if (!user) {
            throw new Error('Invalid credentials');
        }

        // Compare the provided password with the stored hashed password
        const isPasswordValid = await bcrypt.compare(password + PEPPER, user.password);
        if (!isPasswordValid) {
            throw new Error('Invalid credentials');
        }

        // Generate JWT token for the authenticated user
        const token = generateToken({ id: user.id, username: user.username });

        // Return user details and token
        return {
            user: {
                id: user.id,
                username: user.username,
                email: user.email
                },
                token
            }   
    }

    // Sign Out user
}

export default AuthService;