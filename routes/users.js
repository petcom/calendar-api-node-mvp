const express = require('express');
const path = require('path');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { loadJson, saveJson } = require('../utils/fileHelpers');
const authenticateJWT = require('../middleware/auth');

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
router.get('/users', authenticateJWT, async (req, res) => {
  const users = await loadJson(USERS_FILE);
  const safeUsers = users.map(u => ({
    username: u.username,
    full_name: u.full_name || '',
    groups: u.groups || [],
    token_expiry: u.token_expiry || ''
  }));
  res.json(safeUsers);
});

// POST /api/users - create a new user
router.post('/users', authenticateJWT, async (req, res) => {
  const { username, full_name, password, groups = [], token_expiry = '' } = req.body;

  if (!username || !password) {
    return res.status(400).send('Missing username or password');
  }

  const users = await loadJson(USERS_FILE);

  if (users.find(u => u.username === username)) {
    return res.status(409).send('Username already exists');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({
    username,
    password: hashedPassword,
    full_name,
    groups,
    token_expiry
  });

  await saveJson(USERS_FILE, users);
  console.log(`[USER CREATED] ${username} created`);
  res.sendStatus(201);
});


// GET /api/me
router.get('/users/me', authenticateJWT, async (req, res) => {
  const users = await loadJson(USERS_FILE);
  const user = users.find(u => u.username === req.user.username);
  if (!user) return res.status(404).send('User not found');

  res.json({
    username: user.username,
    full_name: user.full_name || '',
    groups: user.groups || [],
    token_expiry: user.token_expiry || ''
  });
});

// PUT /api/users/:username
router.put('/users/:username', authenticateJWT, async (req, res) => {
  console.log(`[DEBUG] PUT /users/${req.params.username} hit`);

  const { username } = req.params;
  const { full_name, groups, token_expiry } = req.body;

  const users = await loadJson(USERS_FILE);
  const user = users.find(u => u.username === username);
  if (!user) return res.status(404).send('User not found');

  user.full_name = full_name || '';
  user.groups = Array.isArray(groups) ? groups : [];
  user.token_expiry = token_expiry || '';

  await saveJson(USERS_FILE, users);
  res.sendStatus(200);
});

// DELETE /api/users/:username
router.delete('/users/:username', authenticateJWT, async (req, res) => {
  const users = await loadJson(USERS_FILE);
  const updated = users.filter(u => u.username !== req.params.username);

  if (users.length === updated.length) {
    return res.status(404).send('User not found');
  }

  console.log(`[USER DELETE] ${req.params.username} deleted by ${req.user.username}`);
  await saveJson(USERS_FILE, updated);
  res.sendStatus(204);
});

module.exports = router;
