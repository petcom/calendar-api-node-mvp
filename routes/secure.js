const express = require('express');
const path = require('path');
const authenticateJWT = require('../middleware/auth');

const router = express.Router();

router.get('/secure/createEventForm.html', authenticateJWT, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'private', 'createEventForm.html'));
});

// routes/secure.js
router.get('/secure/manageUsersGroups.html', authenticateJWT, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'private', 'manageUsersGroups.html'));
});


module.exports = router;
