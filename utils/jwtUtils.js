const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET;


function signToken(payload, expiresIn = '1h') {
  console.log('[JWT] Signing token with payload:', payload + "|" + secret);
  return jwt.sign(payload, secret, { expiresIn });
}

function verifyToken(token) {
  console.log('[JWT] Verifying token:', token + "|" + secret);
  return jwt.verify(token, secret);
}


module.exports = { signToken, verifyToken };