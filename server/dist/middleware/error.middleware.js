/*
* Global error handling middleware
* Catches errors thrown in route handlers and sends a consistent error response
*/
export const errorHandler = (err, req, res, next) => {
    console.error('Error:', err.message); // Log the error for debugging
};
module.exports = errorHandler;
