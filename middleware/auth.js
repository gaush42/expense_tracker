const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET;

exports.authenticate = (req, res, next) => {
  // Get the 'Authorization' header from the request (expected format: "Bearer <token>")
  // Bearer is the scheme that tells the server, "This token is a bearer token."
  // It Follows the RFC 6750 standard for OAuth 2.0.
  const authHeader = req.headers.authorization;

  // If the header is missing, respond with 401 Unauthorized
  if (!authHeader)
    return res.status(401).json({ message: 'Authorization header missing' });

  // Extract the token part by splitting at the space (splits "Bearer <token>")
  const token = authHeader.split(' ')[1]; // Expecting: Bearer <token>
  if (!token)
    return res.status(401).json({ message: 'Token missing' });

  try {
    // Verify the token using the secret key (also checks if it's expired)
    const decoded = jwt.verify(token, SECRET_KEY);
    // If valid, attach the user's ID (from token payload) to the request object
    req.userId = decoded.userId; // attach to request
    // Proceed to the next middleware or route handler
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};
