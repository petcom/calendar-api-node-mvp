const express = require('express');
const path = require('path');
const { loadJson, saveJson } = require('../utils/fileHelpers');
const { filterAndSortEvents } = require('../utils/eventsHelpers');

const router = express.Router();

const EVENTS_FILE = path.join(__dirname, '..', 'storage', 'events.json');
const USERS_FILE = path.join(__dirname, '..', 'storage', 'users.json');
const TOKENS_FILE = path.join(__dirname, '..', 'storage', 'tokens.json');

let mergeLock = false;

// Normalize events to match event-editor-local schema
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

const authenticateJWT = require('../middleware/auth');

// Helper to extract token from Authorization header
async function getUserFromAuthHeader(req) {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return null;
  const tokens = await loadJson(TOKENS_FILE);
  const tokenRecord = tokens.find(t => t.token === token);
  if (!tokenRecord) return null;
  const users = await loadJson(USERS_FILE);
  return users.find(u => u.username === tokenRecord.username);
}

// POST /api/events/merge (still protected by JWT)
router.post('/events/merge', authenticateJWT, async (req, res) => {
  
  try {
    const { events: clientEvents } = req.body;

    if (mergeLock) {
      return res.status(423).json({ message: 'Merge is currently locked by another client.' });
    }

    if (!Array.isArray(clientEvents)) {
      return res.status(400).json({ message: 'Invalid request: events are required.' });
    }

    const username = req.user.username;
    const users = await loadJson(USERS_FILE);
    const user = users.find(u => u.username === username);
    if (!user) {
      return res.status(403).json({ message: 'User not found' });
    }

    mergeLock = true;

    const serverEvents = await loadJson(EVENTS_FILE);
    const clientEventIds = clientEvents.map(e => e.id);

    const merged = [
      ...serverEvents.filter(se => !clientEventIds.includes(se.id)),
      ...clientEvents.map(normalizeEvent)
    ];

    await saveJson(EVENTS_FILE, merged);
    mergeLock = false;

    console.log(`[MERGE] ${clientEvents.length} events merged by ${username}`);
    res.status(200).json({ message: 'Merge successful', total: merged.length });
  } catch (err) {
    mergeLock = false;
    console.error('[MERGE] Error during merge:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// GET /api/events?tag=optionalTag
router.get('/events', async (req, res) => {
  try {
    const user = await getUserFromAuthHeader(req);
    if (!user) {
      console.warn('[EVENTS] Missing or invalid token');
      return res.status(401).send('Missing or invalid token');
    }

    const tagParam = req.query.tag;
    const useAndLogic = req.query.logic === 'and';

    console.log(`[EVENTS] ${user.username} requested events`);

    const allEvents = await loadJson(EVENTS_FILE);
    console.log(`[EVENTS] Loaded ${allEvents.length} total events`);

    const visibleEvents = user.groups.includes('g1')
      ? allEvents
      : allEvents.filter(e => user.groups.includes(e.group_id));

    const now = new Date();
    const defaultEnd = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    const startDate = req.query.startDate ? new Date(req.query.startDate) : now;
    const endDate = req.query.endDate ? new Date(req.query.endDate) : defaultEnd;

    console.log(`[EVENTS] Filtering from ${startDate.toISOString()} to ${endDate.toISOString()}`);

    const filteredEvents = filterAndSortEvents(visibleEvents, {
      startDate,
      endDate,
      tagArray: tagParam ? [tagParam] : [],
      useAndLogic
    });

    console.log(`[EVENTS] ${filteredEvents.length} events after filtering and sorting`);
    if (filteredEvents.length > 0) {
      console.log(`[EVENTS] Returning sample event:`, filteredEvents[0]);
    } else {
      console.log('[EVENTS] No matching events found.');
    }

    res.json(filteredEvents.map(normalizeEvent));
  } catch (err) {
    console.error('[EVENTS] Unexpected error:', err);
    res.status(500).send('Internal Server Error');
  }
});

// GET /api/events/upcoming?tag=tag1&tag=tag2
router.get('/upcoming-events', async (req, res) => {
  try {
    const user = await getUserFromAuthHeader(req);
    if (!user) {
      console.warn('[EVENTS] Missing or invalid token');
      return res.status(401).send('Missing or invalid token');
    }

    const tagParams = req.query.tag;
    const useAndLogic = req.query.logic === 'and';

    const allEvents = await loadJson(EVENTS_FILE);

    const visibleEvents = user.groups.includes('g1')
      ? allEvents
      : allEvents.filter(e => user.groups.includes(e.group_id));

    const tagArray = tagParams
      ? Array.isArray(tagParams)
        ? tagParams
        : [tagParams]
      : [];

    const upcoming = filterAndSortEvents(visibleEvents, {
      startDate: new Date(),
      tagArray,
      useAndLogic
    }).slice(0, 5);

    res.json(upcoming.map(normalizeEvent));
  } catch (err) {
    console.error('[EVENTS] Unexpected error in /upcoming:', err);
    res.status(500).send('Internal Server Error');
  }
});

// POST /api/events
router.post('/events', async (req, res) => {
  try {
    const {
      title, description, long_description,
      event_date, display_from_date, tags,
      full_image_url, small_image_url, thumb_image_url, thumb_url
    } = req.body;

    const user = await getUserFromAuthHeader(req);
    if (!user || !Array.isArray(user.groups) || user.groups.length === 0) {
      console.warn('[EVENTS] Unauthorized: user not in group or missing/invalid token');
      return res.status(403).json({ message: 'User not authorized to post events' });
    }

    if (!title || !description || !event_date) {
      console.warn('[EVENTS] Missing required fields in POST');
      return res.status(400).json({ message: 'Missing required fields: title, description, event_date' });
    }

    const group_id = user.groups[0];
    const cleanTags = Array.isArray(tags)
      ? tags.map(t => typeof t === 'string' ? t.trim().toLowerCase() : null).filter(Boolean)
      : [];

    const newEvent = {
      id: Date.now().toString(),
      title: title.trim(),
      description: description.trim(),
      long_description: long_description || '',
      event_date,
      display_from_date: display_from_date || null,
      tags: cleanTags,
      group_id,
      full_image_url: full_image_url || '',
      small_image_url: small_image_url || full_image_url || '',
      thumb_image_url: thumb_image_url || thumb_url || ''
    };

    const events = await loadJson(EVENTS_FILE);
    events.push(newEvent);
    await saveJson(EVENTS_FILE, events);

    console.log(`[EVENTS] Created new event by ${user.username}:`, newEvent);

    res.status(201).json(newEvent);
  } catch (err) {
    console.error('[EVENTS] Error creating event:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;