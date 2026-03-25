/*
* Global error handling middleware
* Catches errors thrown in route handlers and sends a consistent error response
*/
export const errorHandler = (err, req, res, next) => {
    const statusCode = err?.statusCode && Number.isInteger(err.statusCode) ? err.statusCode : 500;
    const message = err?.message || 'Internal server error';

    console.error('Error:', message);

    if (res.headersSent) return next(err);
    res.status(statusCode).json({
        success: false,
        message
    });
};
