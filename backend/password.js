import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
dotenv.config();

const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS, 10);
const PEPPER = process.env.PEPPER;

const password = '123';
const hashedPassword = await bcrypt.hash(password + PEPPER, SALT_ROUNDS);
console.log('Hashed Password:', hashedPassword);