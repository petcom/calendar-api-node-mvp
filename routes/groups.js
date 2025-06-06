const express = require('express');
const path = require('path');
const { loadJson, saveJson } = require('../utils/fileHelpers');

const router = express.Router();

const USERS_FILE = path.join(__dirname, '..', 'storage', 'users.json');
const GROUPS_FILE = path.join(__dirname, '..', 'storage', 'groups.json');

// GET /api/groups
router.get('/groups', async (req, res) => {
  const groups = await loadJson(GROUPS_FILE);
  res.json(groups);
});

// POST /api/groups
router.post('/groups', async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).send('Missing group name');

  const groups = await loadJson(GROUPS_FILE);
  const newGroup = {
    id: 'g' + Date.now(),
    name,
    parentId: 'g1'
  };
  groups.push(newGroup);
  await saveJson(GROUPS_FILE, groups);

  res.sendStatus(201);
});

// POST /api/groups/assign
router.post('/groups/assign', async (req, res) => {
  const { groupId, usernames } = req.body;

  if (!groupId || !Array.isArray(usernames)) {
    return res.status(400).send('Invalid input');
  }

  const users = await loadJson(USERS_FILE);

  usernames.forEach(username => {
    const user = users.find(u => u.username === username);
    if (user && !user.groups.includes(groupId)) {
      user.groups.push(groupId);
    }
  });

  await saveJson(USERS_FILE, users);
  res.sendStatus(200);
});

module.exports = router;