// middleware/auth.js
const { verifyToken } = require('../utils/jwtUtils');

function authenticateJWT(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Missing token' });

  try {
    req.user = verifyToken(token);
    next();
  } catch (err) {
    console.error('[AUTH] JWT verification failed:', err);
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
}

module.exports = authenticateJWT;
