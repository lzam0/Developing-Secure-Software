import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import UserModel from '../models/user.model.js';
import dotenv from 'dotenv';
import { randomUUID } from 'crypto';
import pool from '../controllers/database.js';

import {randomInt} from 'crypto';
import rateLimit from 'express-rate-limit';
dotenv.config();

// Validate required environment variables
if (!process.env.SALT_ROUNDS) {
    throw new Error('FATAL: SALT_ROUNDS is not defined in .env file');
}
if (!process.env.PEPPER) {
    throw new Error('FATAL: PEPPER is not defined in .env file');
}


// Load environment variables 
const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS, 10);
const PEPPER = process.env.PEPPER;

// Helper function to generate token
// function generateToken(payload) {
//     return jwt.sign(payload, JWT_WEB_TOKEN_SECRET, { expiresIn: JWT_EXPIRES_IN });
// }

// convert a duration string into milliseconds
// needed for the timestamp in the revoked_tokens table to know when a token is expired
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
    const token = jwt.sign({ ...payload, jti }, process.env.JWT_WEB_TOKEN_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN }); 
    // calculate when token will expire
    const expiresAt = new Date(Date.now() + parseDurationMs(process.env.JWT_EXPIRES_IN));
    return { token, jti, expiresAt }; // return for sign-in process
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
            // PASSWORD = YELLOW 
            // SALT = BLUE

            // HASH the salt and password together

            // Add extra pepper to make it secure
            await bcrypt.hash(password + PEPPER, SALT_ROUNDS);
            await addJitter(); // add random delay to make timing attacks harder

        
           
            //returning a generic error message
            // what a successful registration would look like, to prevent user enumeration
            return{
                message: 'A verification email has been sent to your email address. Please check your inbox and follow the instructions to complete your registration.',
                status: 'pending'
            };

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
        await addJitter(); // add random delay to make timing attacks harder
                
        // userID, username, email, token 
        // SHOULD ONLY BE RETURNED IN THE SIGN IN, NOT SIGN UP.
        //  IN SIGN UP, WE WANT TO RETURN A GENERIC SUCCESS MESSAGE TO PREVENT ACCOUNT ENUMERATION
            return {
        message: 'A verification email has been sent to your email address. Please check your inbox and follow the instructions to complete your registration.',
        status: 'pending',
        user: {
            id: newUser.id,
            username: newUser.username,
            email: newUser.email
            }
        }
    };

    // Sign In User
    static async signIn(email, password) {

        if (!this.validateEmail(email)) {
            await bcrypt.hash(password + PEPPER, SALT_ROUNDS);
            await addJitter();
            const err = new Error('Invalid credentials');
            err.statusCode = 401;
            throw err;
        }

        // Find user by encrypted email lookup only
        const user = await UserModel.findByEmail(email);

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
        const isPasswordValid = await this.verifyPassword(password, user.password);
        if (!isPasswordValid) {
            await addJitter(); // add random delay to make timing attacks harder
            const err = new Error('Invalid credentials');
            err.statusCode = 401;
            throw err;
        }
        
        if (!user.is_verified) {
        const err = new Error('Please verify your email before signing in');
        err.statusCode = 403;
        throw err;
        }
        
        await addJitter(); // add random delay to make timing attacks harder

        // Return user details only
        // JWT is issued after OTP verification in the controller
        return {
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        };
    }

    // blacklist of ids so tokens cannot be used again 
    static async revokeToken(jti, userID, expiresAt) {
        // add the tokens unique id (jti) to the revoked_tokens table 
        await pool.query(
            `INSERT INTO revoked_tokens (jti, userid, expires_at)
             VALUES ($1, $2, $3)
             ON CONFLICT (jti) DO NOTHING`,
             // $1 - unique serial number (jti) of the token 
             // $2 - id of the user 
             // $3 - token expire time 
             [jti, userID, expiresAt]
        );
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

    static validatePassword(password) {

        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d])(?!.*['";<>`\\\\]).{8,72}$/;

        if (!passwordRegex.test(password)) {
            return false;
        } else {
            return true;
        }
        return null;
    }

    static async changePassword(userid, newHashedPassword) {
        await UserModel.updatePassword(userid, newHashedPassword);
    }

    static async hashPassword(password) {
        return await bcrypt.hash(password + PEPPER, SALT_ROUNDS);
    }

    static async verifyPassword(password, hash) {
        return bcrypt.compare(password + PEPPER, hash);
    }
}
export default AuthService;
