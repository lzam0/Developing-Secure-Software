import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import UserModel from '../models/user.model.js';
import dotenv from 'dotenv';
import {randomInt} from 'crypto';
import rateLimit from 'express-rate-limit';
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

//add jitter to response time
    async function addJitter() {
        const jitter = randomInt(100, 500); // Random delay between 100ms and 500ms
        return new Promise(resolve => setTimeout(resolve, jitter));
    }

// AuthService class to handle authentication logic
export class AuthService {
    
    // Register a new user
    static async signUp(username, email, password) {

        // Check if user already exists
        // Check if the email is taken OR if the username is taken
    const [existingEmail, existingUsername] = await Promise.all([
    UserModel.findByEmail(email),
    UserModel.findByUsername(username)
]);
    
        // ANTI-ACCOUNT ENUMERATION: If user exists, dont throw error, hide it
        if (existingEmail || existingUsername) {
            //fake hash so the response time matches real
            await bcrypt.hash(password + PEPPER, SALT_ROUNDS);
            await addJitter(); // add random delay to make timing attacks harder

        
           
            //returning a generic error message - what a successful registration would look like, to prevent user enumeration
            return{
                message: 'A verification email has been sent to your email address. Please check your inbox and follow the instructions to complete your registration.',
                status: 'pending'
            };

        }

        // Hash the password with salt and pepper
        const hashedPassword = await bcrypt.hash(password + PEPPER, SALT_ROUNDS);
        
        // Create the user
        const newUser = await UserModel.create(username, email, hashedPassword);
        await addJitter(); // add random delay to make timing attacks harder
        
        
        // userID, username, email, token SHOULD ONLY BE RETURNED IN THE SIGN IN, NOT SIGN UP. IN SIGN UP, WE WANT TO RETURN A GENERIC SUCCESS MESSAGE TO PREVENT ACCOUNT ENUMERATION
            return {
        message: 'A verification email has been sent to your email address. Please check your inbox and follow the instructions to complete your registration.',
        status: 'pending'
    };
        }

    // Sign In User
    static async signIn(identifier, password) {

        // Find user by email or username
        const user = await UserModel.findByEmailOrUsername(identifier);

        // If user not found, throw an error
        if (!user) {
            //dont throw error, to prevent user enumeration, just return generic invalid credentials message and do a fake hash to make the response time similar to a real request
            await bcrypt.hash(password + PEPPER, SALT_ROUNDS);
            await addJitter(); // add random delay to make timing attacks harder
            const err = new Error('Invalid credentials');
            err.statusCode = 401;
            throw err;
        }

        // Compare the provided password with the stored hashed password
        const isPasswordValid = await bcrypt.compare(password + PEPPER, user.password);
        if (!isPasswordValid) {
            await addJitter(); // add random delay to make timing attacks harder
            const err = new Error('Invalid credentials');
            err.statusCode = 401;
            throw err;
        }

        // Generate JWT token for the authenticated user
        const token = generateToken({ id: user.id, username: user.username });
        await addJitter(); // add random delay to make timing attacks harder

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
}
export default AuthService;
