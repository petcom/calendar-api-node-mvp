const express = require('express');
const path = require('path');
const { loadJson, saveJson } = require('../utils/fileHelpers');
const authenticateJWT = require('../middleware/auth');

const router = express.Router();

const USERS_FILE = path.join(__dirname, '..', 'storage', 'users.json');
const GROUPS_FILE = path.join(__dirname, '..', 'storage', 'groups.json');

// GET /api/groups - 🔐 protected
router.get('/groups', authenticateJWT, async (req, res) => {
  const groups = await loadJson(GROUPS_FILE);
  res.json(groups);
});

// POST /api/groups - 🔐 create new group with client-supplied ID
router.post('/groups', authenticateJWT, async (req, res) => {
  const { id, name, parentId = 'root' } = req.body;

  if (!id || !name) {
    return res.status(400).send('Missing group ID or name');
  }

  const groups = await loadJson(GROUPS_FILE);

  if (groups.find(g => g.id === id)) {
    return res.status(409).send('Group ID already exists');
  }

  const newGroup = { id, name, parentId };
  groups.push(newGroup);
  await saveJson(GROUPS_FILE, groups);

  res.status(201).json(newGroup);
});

// POST /api/groups/assign - 🔐 assign users to group
router.post('/groups/assign', authenticateJWT, async (req, res) => {
  const { groupId, usernames } = req.body;

  if (!groupId || !Array.isArray(usernames)) {
    return res.status(400).send('Invalid input');
  }

  const users = await loadJson(USERS_FILE);
  let updated = false;

  usernames.forEach(username => {
    const user = users.find(u => u.username === username);
    if (user && !user.groups.includes(groupId)) {
      user.groups.push(groupId);
      updated = true;
    }
  });

  if (updated) await saveJson(USERS_FILE, users);
  res.sendStatus(200);
});

// PUT /api/groups/:id - 🔐 update group name or parent
router.put('/groups/:id', authenticateJWT, async (req, res) => {
  const groupId = req.params.id;
  const { name, parentId } = req.body;

  if (!name) return res.status(400).send('Missing group name');

  const groups = await loadJson(GROUPS_FILE);
  const group = groups.find(g => g.id === groupId);

  if (!group) return res.status(404).send('Group not found');

  group.name = name;
  if (parentId !== undefined) group.parentId = parentId;

  await saveJson(GROUPS_FILE, groups);
  res.sendStatus(200);
});

// DELETE /api/groups/:id - 🔐 delete a group
router.delete('/groups/:id', authenticateJWT, async (req, res) => {
  const groups = await loadJson(GROUPS_FILE);
  const id = req.params.id;
  const updated = groups.filter(g => g.id !== id);

  if (groups.length === updated.length) {
    return res.status(404).send('Group not found');
  }

  await saveJson(GROUPS_FILE, updated);
  res.sendStatus(204);
});

module.exports = router;
