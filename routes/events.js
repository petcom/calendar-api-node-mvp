const express = require('express');
const path = require('path');
const { loadJson, saveJson } = require('../utils/fileHelpers');
const { filterAndSortEvents } = require('../utils/eventsHelpers');


const router = express.Router();

const EVENTS_FILE = path.join(__dirname, '..', 'storage', 'events.json');
const USERS_FILE = path.join(__dirname, '..', 'storage', 'users.json');
const TOKENS_FILE = path.join(__dirname, '..', 'storage', 'tokens.json');


// GET /api/events?token=...&tag=optionalTag
router.get('/events', async (req, res) => {
    try {
      const token = req.query.token;
      const filterTag = req.query.tag?.toLowerCase();
  
      if (!token) {
        console.warn('[EVENTS] Missing token');
        return res.status(400).send('Missing token');
      }
  
      const tokens = await loadJson(TOKENS_FILE);
      const tokenRecord = tokens.find(t => t.token === token);
      if (!tokenRecord) {
        console.warn('[EVENTS] Invalid token:', token);
        return res.status(403).send('Invalid token');
      }
  
      const users = await loadJson(USERS_FILE);
      const user = users.find(u => u.username === tokenRecord.username);
      if (!user) {
        console.warn('[EVENTS] User not found for token:', token);
        return res.status(403).send('User not found');
      }
  
      console.log(`[EVENTS] ${user.username} requested events`);
  
      const allEvents = await loadJson(EVENTS_FILE);
      console.log(`[EVENTS] Loaded ${allEvents.length} total events`);
  
      // Filter by user's groups
      let visibleEvents = user.groups.includes('g1')
        ? allEvents
        : allEvents.filter(e => user.groups.includes(e.groupId));
  
      console.log(`[EVENTS] ${visibleEvents.length} events visible to group(s):`, user.groups);
  
      // Filter by date range
      const now = new Date();
      const defaultEnd = new Date();
      defaultEnd.setDate(now.getDate() + 14);
  
      const startDate = req.query.startDate ? new Date(req.query.startDate) : now;
      const endDate = req.query.endDate ? new Date(req.query.endDate) : defaultEnd;
  
      console.log(`[EVENTS] Filtering from ${startDate.toISOString()} to ${endDate.toISOString()}`);
  
      visibleEvents = visibleEvents.filter(e => {
        if (!e.date) return false;
        const eventDate = new Date(`${e.date}T00:00:00`);
        return !isNaN(eventDate) && eventDate >= startDate && eventDate <= endDate;
      });
  
      console.log(`[EVENTS] ${visibleEvents.length} events after date filtering`);
  
  // Filter by tag if provided
    if (filterTag) {
        console.log(`[EVENTS] Filtering by tag "${filterTag}"`);
        visibleEvents = visibleEvents.filter(e =>
        Array.isArray(e.tags) &&
        e.tags.map(t => t.toLowerCase()).includes(filterTag)
        );
        }
  
        console.log(`[EVENTS] ${visibleEvents.length} events after tag filtering for: "${filterTag}"`);
      
  
      if (visibleEvents.length > 0) {
        console.log(`[EVENTS] Returning ${visibleEvents.length} event(s). Sample:`, visibleEvents[0]);
      } else {
        console.log('[EVENTS] No matching events found.');
      }
  
      // ... after tag filtering
      visibleEvents = visibleEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
      
      console.log(`[EVENTS] ${visibleEvents.length} events after sorting for`);
      

      res.json(visibleEvents);
    } catch (err) {
      console.error('[EVENTS] Unexpected error:', err);
      res.status(500).send('Internal Server Error');
    }
  });


  // GET /api/events/upcoming?token=...&tag=tag1&tag=tag2
router.get('/events/upcoming', async (req, res) => {
  try {
    const token = req.query.token;
    const tagParams = req.query.tag;

    if (!token) {
      console.warn('[EVENTS] Missing token');
      return res.status(400).send('Missing token');
    }

    const tokens = await loadJson(TOKENS_FILE);
    const tokenRecord = tokens.find(t => t.token === token);
    if (!tokenRecord) {
      console.warn('[EVENTS] Invalid token:', token);
      return res.status(403).send('Invalid token');
    }

    const users = await loadJson(USERS_FILE);
    const user = users.find(u => u.username === tokenRecord.username);
    if (!user) {
      console.warn('[EVENTS] User not found for token:', token);
      return res.status(403).send('User not found');
    }

    const allEvents = await loadJson(EVENTS_FILE);

    // Filter by group access
    let visibleEvents = user.groups.includes('g1')
      ? allEvents
      : allEvents.filter(e => user.groups.includes(e.groupId));

    const today = new Date().toISOString().split('T')[0];

    visibleEvents = visibleEvents.filter(e => new Date(e.date) >= new Date(today));

    // Normalize tag parameters to array
    const tagArray = tagParams
      ? Array.isArray(tagParams)
        ? tagParams.map(t => t.toLowerCase())
        : [tagParams.toLowerCase()]
      : null;

    if (tagArray && tagArray.length > 0) {
      visibleEvents = visibleEvents.filter(e =>
        Array.isArray(e.tags) &&
        tagArray.every(tag => e.tags.map(t => t.toLowerCase()).includes(tag))
      );
    }

    const upcoming = visibleEvents
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 5);

    res.json(upcoming);
  } catch (err) {
    console.error('[EVENTS] Unexpected error in /upcoming:', err);
    res.status(500).send('Internal Server Error');
  }
});

// POST /api/events
router.post('/events', async (req, res) => {
    try {
      const { token, title, description, date, tags, image, thumbnail } = req.body;
  
      // Validate required fields
      if (!token || !title || !description || !date) {
        console.warn('[EVENTS] Missing required fields in POST');
        return res.status(400).json({ message: 'Missing required fields: token, title, description, date' });
      }
  
      const tokens = await loadJson(TOKENS_FILE);
      const tokenRecord = tokens.find(t => t.token === token);
      if (!tokenRecord) {
        console.warn('[EVENTS] Invalid token:', token);
        return res.status(403).json({ message: 'Invalid token' });
      }
  
      const users = await loadJson(USERS_FILE);
      const user = users.find(u => u.username === tokenRecord.username);
      if (!user || !Array.isArray(user.groups) || user.groups.length === 0) {
        console.warn('[EVENTS] Unauthorized: user not in group');
        return res.status(403).json({ message: 'User not authorized to post events' });
      }
  
      const groupId = user.groups[0]; // Use the first group the user is part of
  
      // Normalize and validate tags
      const cleanTags = Array.isArray(tags)
        ? tags.map(t => typeof t === 'string' ? t.trim().toLowerCase() : null).filter(Boolean)
        : [];
  
      const newEvent = {
        id: Date.now().toString(),
        title: title.trim(),
        description: description.trim(),
        date: date,
        tags: cleanTags,
        groupId,
        image: image || '',
        thumbnail: thumbnail || ''
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
