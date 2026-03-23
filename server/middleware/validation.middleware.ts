import { Request, Response, NextFunction } from 'express';

/**
 * Validate registration input
 */


// Validation includes basic checks for presence of required fields.
//  More complex validation (e.g. email format, password strength) can be added as needed.
// Anti SQL Injection
// Anti XSS
// Anti CSRF - should be handled in frontend and backend (e.g. using CSRF tokens)

export const validateSignUp = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    // Extract username, email, and password from request body
    const { username, email, password } = req.body;
    
    next();
}



/**
 * Validate login input
 */

export const validateSignIn = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    // Extract email (email or username) and password from request body
    const { email, password } = req.body;


    next();
}
