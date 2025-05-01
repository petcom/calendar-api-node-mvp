const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs-extra');
const path = require('path');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const app = express();
const PORT = 3000;

const EVENTS_FILE = path.join(__dirname, 'storage', 'events.json');
const USERS_FILE = path.join(__dirname, 'storage', 'users.json');
const TOKENS_FILE = path.join(__dirname, 'storage', 'tokens.json');
const GROUPS_FILE = path.join(__dirname, 'storage', 'groups.json');



// Middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

// Helper functions
async function loadJson(file, fallback = []) {
  try {
    const data = await fs.readFile(file, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if (file.includes('groups.json')) {
      const defaultGroups = [
        { id: "g1", name: "Master Admins", parentId: null }
      ];
      await saveJson(file, defaultGroups);
      return defaultGroups;
    }
    return fallback;
  }
}

async function saveJson(file, data) {
  await fs.ensureFile(file);
  await fs.writeFile(file, JSON.stringify(data, null, 2));
}

// Routes
app.get('/', (req, res) => {
  res.redirect('/login.html');
});

// POST /api/register
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  const users = await loadJson(USERS_FILE);

  if (users.find(u => u.username === username)) {
    return res.status(409).send('Username already exists');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
 users.push({ username, password: hashedPassword, groups: [] });
  await saveJson(USERS_FILE, users);

  res.send('<h2>Registration successful!</h2><p><a href="/login.html">Login now</a></p>');
});

// POST /api/login
app.post('/api/login', async (req, res) => {
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

// POST /api/events
/* app.post('/api/events', async (req, res) => {
  const { token, title, description, date, tags } = req.body;

  const tokens = await loadJson(TOKENS_FILE);
  const validToken = tokens.find(t => t.token === token);
  if (!validToken) {
    return res.status(403).send('Unauthorized: Invalid token');
  }

  const newEvent = {
    id: Date.now().toString(),
    title,
    description,
    date,
    tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
  };

  const events = await loadJson(EVENTS_FILE);
  events.push(newEvent);
  await saveJson(EVENTS_FILE, events);

  res.send(`<h2>Event Created Successfully!</h2><p><a href="/createEventForm.html?token=${token}">Create Another</a></p>`);
});
*/

// GET /api/events
/* app.get('/api/events', async (req, res) => {
  const events = await loadJson(EVENTS_FILE);
  res.json(events);
});
*/

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

// Load all users safely (excluding password hashes)
app.get('/api/users', async (req, res) => {
  const users = await loadJson(USERS_FILE);
  const safeUsers = users.map(u => ({ username: u.username, groups: u.groups }));
  res.json(safeUsers);
});

// Load all groups
app.get('/api/groups', async (req, res) => {
  const groups = await loadJson(GROUPS_FILE);
  res.json(groups);
});

// POST /api/events (now needs token and user's group)
app.post('/api/events', async (req, res) => {
  const { token, title, description, date, tags } = req.body;

  const tokens = await loadJson(TOKENS_FILE);
  const tokenRecord = tokens.find(t => t.token === token);
  if (!tokenRecord) {
    return res.status(403).send('Unauthorized: Invalid token');
  }

  const users = await loadJson(USERS_FILE);
  const user = users.find(u => u.username === tokenRecord.username);

  if (!user || !user.groups || user.groups.length === 0) {
    return res.status(403).send('Unauthorized: No group membership');
  }

  const groupId = user.groups[0]; // First group membership (simple for now)

  const newEvent = {
    id: Date.now().toString(),
    title,
    description,
    date,
    tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
    groupId
  };

  const events = await loadJson(EVENTS_FILE);
  events.push(newEvent);
  await saveJson(EVENTS_FILE, events);

  res.send(`<h2>Event Created Successfully!</h2><p><a href="/createEventForm.html?token=${token}">Create Another</a></p>`);
});

// GET /api/events (restricted by user's group)
app.get('/api/events', async (req, res) => {
  const token = req.query.token;
  if (!token) return res.status(400).send('Missing token');

  const tokens = await loadJson(TOKENS_FILE);
  const tokenRecord = tokens.find(t => t.token === token);
  if (!tokenRecord) return res.status(403).send('Invalid token');

  const users = await loadJson(USERS_FILE);
  const user = users.find(u => u.username === tokenRecord.username);

  if (!user) return res.status(403).send('User not found');

  const events = await loadJson(EVENTS_FILE);

  let visibleEvents = [];

  if (user.groups.includes('g1')) { // Master Admin
    visibleEvents = events;
  } else {
    const allowedGroupIds = user.groups;
    visibleEvents = events.filter(e => allowedGroupIds.includes(e.groupId));
  }

  res.json(visibleEvents);
});

// POST /api/groups (create new group)
app.post('/api/groups', async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).send('Missing group name');

  const groups = await loadJson(GROUPS_FILE);
  const newGroup = {
    id: 'g' + Date.now(),
    name,
    parentId: 'g1' // By default new groups are under Master Admins
  };
  groups.push(newGroup);
  await saveJson(GROUPS_FILE, groups);

  res.sendStatus(201);
});

// POST /api/groups/assign (assign users to a group)
app.post('/api/groups/assign', async (req, res) => {
  const { groupId, usernames } = req.body;

  if (!groupId || !usernames || !Array.isArray(usernames)) {
    return res.status(400).send('Invalid input');
  }

  const users = await loadJson(USERS_FILE);

  usernames.forEach(username => {
    const user = users.find(u => u.username === username);
    if (user) {
      if (!user.groups.includes(groupId)) {
        user.groups.push(groupId);
      }
    }
  });

  await saveJson(USERS_FILE, users);
  res.sendStatus(200);
});