const express = require('express');
const path = require('path');
const jwt = require('jsonwebtoken');
const { loadJson, saveJson } = require('../utils/fileHelpers');
const { filterAndSortEvents } = require('../utils/eventsHelpers');
const { getAllDescendantGroupIds } = require('../utils/groupsHelpers');
const authenticateJWT = require('../middleware/auth');

const router = express.Router();

const EVENTS_FILE = path.join(__dirname, '..', 'storage', 'events.json');
const USERS_FILE = path.join(__dirname, '..', 'storage', 'users.json');
const TOKENS_FILE = path.join(__dirname, '..', 'storage', 'tokens.json');
const GROUPS_FILE = path.join(__dirname, '..', 'storage', 'groups.json');

let mergeLock = false;
const SECRET = process.env.JWT_SECRET;
if (!SECRET) {
  console.error('[AUTH] JWT_SECRET is not defined. Add it to your .env file');
  process.exit(1);
}

function normalizeEvent(event) {
  return {
    id: event.id,
    title: event.title,
    description: event.description,
    long_description: event.long_description || '',
    event_date: event.event_date,
    display_from_date: event.display_from_date,
    tags: event.tags || [],
    group_id: event.group_id,
    full_image_url: event.full_image_url || '',
    small_image_url: event.small_image_url || event.full_image_url || '',
    thumb_image_url: event.thumb_image_url || event.thumb_url || ''
  };
}

async function getUserFromAuthHeader(req) {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) return null;

  try {
    const decoded = jwt.verify(token, SECRET);
    const users = await loadJson(USERS_FILE);
    return users.find(u => u.username === decoded.username) || null;
  } catch (err) {
    console.warn('[AUTH] Token verification failed:', err.message);
    return null;
  }
}

router.post('/events/merge', authenticateJWT, async (req, res) => {
  try {
    const { events: clientEvents } = req.body;
    if (!Array.isArray(clientEvents)) return res.status(400).json({ message: 'Invalid event data' });
    if (mergeLock) return res.status(423).json({ message: 'Merge is locked' });

    mergeLock = true;
    const serverEvents = await loadJson(EVENTS_FILE);
    const clientEventIds = clientEvents.map(e => e.id);
    const merged = [
      ...serverEvents.filter(se => !clientEventIds.includes(se.id)),
      ...clientEvents.map(normalizeEvent)
    ];
    await saveJson(EVENTS_FILE, merged);
    mergeLock = false;

    res.json({ message: 'Merge complete', total: merged.length });
  } catch (err) {
    mergeLock = false;
    res.status(500).json({ message: 'Merge failed' });
  }
});

router.get('/events', async (req, res) => {
  try {
    const user = await getUserFromAuthHeader(req);
    if (!user) return res.status(401).send('Unauthorized');

    const allEvents = await loadJson(EVENTS_FILE);
    const allGroups = await loadJson(GROUPS_FILE);
    const tagParam = req.query.tag;
    const useAndLogic = req.query.logic === 'and';

    const startDate = req.query.startDate ? new Date(req.query.startDate) : null;
    const endDate = req.query.endDate ? new Date(req.query.endDate) : null;
    const applyDateFilter = !!startDate || !!endDate;

    const allowedGroupIds = user.groups.includes('admin')
      ? allGroups.map(g => g.id)
      : user.groups.flatMap(gid => getAllDescendantGroupIds(allGroups, gid));

    const visibleEvents = allEvents.filter(e => allowedGroupIds.includes(e.group_id));
    const filtered = filterAndSortEvents(visibleEvents, {
      startDate,
      endDate,
      tagArray: tagParam ? [tagParam] : [],
      useAndLogic,
      applyDateFilter
    });

    res.json(filtered.map(normalizeEvent));
  } catch (err) {
    console.error('[GET /events] Error:', err);
    res.status(500).send('Internal server error');
  }
});

router.post('/events/query', async (req, res) => {
  try {
    const user = await getUserFromAuthHeader(req);
    if (!user) return res.status(401).send('Unauthorized');

    const allEvents = await loadJson(EVENTS_FILE);
    const allGroups = await loadJson(GROUPS_FILE);
    const { tags = [], tag_logic = 'or', startDate: s, endDate: e } = req.body;

    const useAndLogic = tag_logic === 'and';
    const startDate = s ? new Date(s) : null;
    const endDate = e ? new Date(e) : null;
    const applyDateFilter = !!startDate || !!endDate;

    const allowedGroupIds = user.groups.includes('admin')
      ? allGroups.map(g => g.id)
      : user.groups.flatMap(gid => getAllDescendantGroupIds(allGroups, gid));

    const visibleEvents = allEvents.filter(e => allowedGroupIds.includes(e.group_id));
    const filtered = filterAndSortEvents(visibleEvents, {
      startDate,
      endDate,
      tagArray: tags,
      useAndLogic,
      applyDateFilter
    });

    res.json(filtered.map(normalizeEvent));
  } catch (err) {
    console.error('[POST /events/query] Error:', err);
    res.status(500).send('Internal server error');
  }
});

router.put('/events/:id', async (req, res) => {
  try {
    const eventId = req.params.id;
    const user = await getUserFromAuthHeader(req);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    const events = await loadJson(EVENTS_FILE);
    const index = events.findIndex(e => e.id === eventId);

    const updated = {
      ...events[index] || {},
      ...req.body,
      id: eventId,
      group_id: index !== -1 ? events[index].group_id : user.groups[0]
    };

    if (index !== -1) {
      events[index] = updated;
    } else {
      events.push(updated);
    }

    await saveJson(EVENTS_FILE, events);
    res.status(200).json(updated);
  } catch (err) {
    console.error('[PUT /events/:id] Error:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
