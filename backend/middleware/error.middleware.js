/*
* Global error handling middleware
* Catches errors thrown in route handlers and sends a consistent error response
*/
export const errorHandler = (err, req, res, next) => {
    const statusCode = err?.statusCode && Number.isInteger(err.statusCode) ? err.statusCode : 500;
    const message = err?.message || 'Internal server error';

    // Log the error details for debugging
    console.error('Error:', message);

    // If headers are already sent, delegate to the default Express error handler
    if (res.headersSent) return next(err);
    res.status(statusCode).json({
        success: false,
        message
    });
};
