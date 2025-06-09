require('dotenv').config();
const jwt = require('jsonwebtoken');

// Example payload, adjust as needed
const payload = {
  username: 'adam',
  groups: ['g1']
};

const secret = process.env.JWT_SECRET;

if (!secret) {
  console.error('JWT_SECRET is not set in environment variables.');
  process.exit(1);
}

const token = jwt.sign(payload, secret, { expiresIn: '2h' });

console.log('Your JWT token:\n');
console.log(token);