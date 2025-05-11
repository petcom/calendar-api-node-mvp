const express = require('express');
const path = require('path');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { loadJson, saveJson } = require('../utils/fileHelpers');

const router = express.Router();

const USERS_FILE = path.join(__dirname, '..', 'storage', 'users.json');
const TOKENS_FILE = path.join(__dirname, '..', 'storage', 'tokens.json');

// POST /api/register
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const users = await loadJson(USERS_FILE);

  if (users.find(u => u.username === username)) {
    return res.status(409).send('Username already exists');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({ username, password: hashedPassword, groups: [] });
  await saveJson(USERS_FILE, users);

  res.sendStatus(201);
});

// POST /api/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const users = await loadJson(USERS_FILE);
  const user = users.find(u => u.username === username);
  if (!user) return res.status(401).send('Invalid username or password');

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).send('Invalid username or password');

  const token = crypto.randomBytes(16).toString('hex');
  const tokens = await loadJson(TOKENS_FILE);
  tokens.push({ username, token });
  await saveJson(TOKENS_FILE, tokens);

  res.json({ token });
});

// GET /api/users
router.get('/users', async (req, res) => {
  const users = await loadJson(USERS_FILE);
  const safeUsers = users.map(u => ({ username: u.username, groups: u.groups }));
  res.json(safeUsers);
});

module.exports = router;