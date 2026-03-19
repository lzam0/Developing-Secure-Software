import { Request, Response, NextFunction } from 'express';

/*
* Global error handling middleware
* Catches errors thrown in route handlers and sends a consistent error response
*/

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    console.error('Error:', err.message); // Log the error for debugging
}

module.exports = errorHandler;