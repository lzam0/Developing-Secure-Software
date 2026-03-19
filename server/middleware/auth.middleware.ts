import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

function authenticateToken(req, res, next) {
  console.log('Authenticating token...');

  // Check Authorization header first
  const token = req.cookies?.token;

  // If no token, return unauthorized
  if (!token) {
    console.log('No token found, redirecting to /login');
    return res.status(401).json({ message: "Unauthorized" }); // error 401
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.log('Token verification failed:', err);
      return res.status(403).json({ message: "Forbidden" }); // error 403

    }
    console.log('Token verified, user:', user);
    req.user = user;
    next();
  });
}


module.exports = authenticateToken;