const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'meditrack_super_secret_key_2025';

// Verify Token Middleware
exports.verifyToken = (req, res, next) => {
  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const splitToken = token.split(' ')[1]; // Extract from "Bearer <token>"
    const decoded = jwt.verify(splitToken || token, JWT_SECRET);
    req.user = decoded; // { id, email, role }
    next();
  } catch (err) {
    res.status(400).json({ message: 'Invalid token.' });
  }
};

// Role Authorization Middleware
exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden. You do not have permission.' });
    }
    next();
  };
};
