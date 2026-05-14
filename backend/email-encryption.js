import readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';
import UserModel from './models/user.model.js';

// Check if the email is valid
function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

// Get email in CLI
async function getEmailFromInput() {
    // Check if email is provided as a command line argument
    const emailArg = process.argv[2];
    // If email is provided as an argument, use it. Otherwise, prompt the user for input.
    if (emailArg) return emailArg;

    // Prompt the user for email input
    const rl = readline.createInterface({ input, output });
    
    // Loop until a valid email is entered
    const email = await rl.question('Enter email to encrypt: ');
    
    // close the readline interface
    rl.close();
    return email;
}

// Test email encryption and decryption
const email = await getEmailFromInput();
const normalisedEmail = UserModel.normaliseEmail(email);

// Validate email format before encryption
if (!validateEmail(normalisedEmail)) {
    console.error('Invalid email format');
    process.exit(1);
}

// Encrypt the email and generate the email lookup value
const encryptedEmail = UserModel.encrypt(normalisedEmail);
const emailLookup = UserModel.emailLookup(normalisedEmail);

// Output the results
console.log('\nEmail encryption output\n');
console.log('Plain email:     ', normalisedEmail);
console.log('Database email:  ', encryptedEmail);
console.log('Email lookup:    ', emailLookup);
console.log('Decrypt check:   ', UserModel.decrypt(encryptedEmail));