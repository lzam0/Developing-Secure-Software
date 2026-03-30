import bcrypt from 'bcrypt';


const password = '123';
const PEPPER = 'pepper';
const SALT_ROUNDS = 10;
const hashedPassword = await bcrypt.hash(password + PEPPER, SALT_ROUNDS);
console.log('Hashed Password:', hashedPassword);