// routes/auth.js
const express = require('express');
const bcrypt = require('bcrypt');
const path = require('path');
const { signToken } = require('../utils/jwtUtils');
const { loadJson } = require('../utils/fileHelpers');

const USERS_FILE = path.join(__dirname, '..', 'storage', 'users.json');
const router = express.Router();

router.post('/jwtlogin', async (req, res) => {
  console.log('[AUTH] Login attempt:', req.body);
  const { username, password } = req.body;

  try {
    const users = await loadJson(USERS_FILE);
    const user = users.find(u => u.username === username);

    if (!user || !await bcrypt.compare(password, user.password)) {
      console.warn(`[AUTH] Invalid login attempt for username: ${username}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = signToken({ username });
    console.warn(`[AUTH] User ${username} logged in with token: ${token}`);

    res.json({ token });
  } catch (err) {
    console.error('[AUTH] Error during login:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;