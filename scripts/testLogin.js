require('dotenv').config();
const axios = require('axios');

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api';

const testCredentials = {
  username: 'testuser',     // Replace with valid username
  password: 'testpassword'  // Replace with valid password
};

async function testLogin() {
  try {
    const response = await axios.post(`${BASE_URL}/login`, testCredentials);
    const { token } = response.data;

    if (token) {
      console.log('[✅] Login successful.');
      console.log('[🔐] JWT Token:', token);
    } else {
      console.error('[❌] Login response did not contain a token.');
    }
  } catch (err) {
    if (err.response) {
      console.error('[❌] Login failed:', err.response.status, err.response.data);
    } else {
      console.error('[❌] Request error:', err.message);
    }
  }
}

testLogin();