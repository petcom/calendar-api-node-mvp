// routes/internal.js
const express = require('express');
const path = require('path');
const { loadJson } = require('../utils/fileHelpers');
const { filterAndSortEvents } = require('../utils/eventsHelpers');

const router = express.Router();

const EVENTS_FILE = path.join(__dirname, '..', 'storage', 'events.json');


// === Rate limiter setup ===
const rateLimitMap = new Map(); // IP -> timestamp
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

setInterval(() => {
  const now = Date.now();
  for (const [ip, timestamp] of rateLimitMap.entries()) {
    if (now - timestamp > RATE_LIMIT_WINDOW_MS) {
      rateLimitMap.delete(ip);
    }
  }
}, 10 * 60 * 1000); // clean up every 10 minutes


// Normalize function copied from routes/events.js
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

// GET /api/internal/upcoming-events
router.get('/internal/upcoming-events', async (req, res) => {
  const requesterIP = req.ips?.[0] || req.ip || req.connection.remoteAddress;
  const now = Date.now();

  const lastRequestTime = rateLimitMap.get(requesterIP);
  if (lastRequestTime && now - lastRequestTime < RATE_LIMIT_WINDOW_MS) {
    const remainingMs = RATE_LIMIT_WINDOW_MS - (now - lastRequestTime);
    return res.status(429).json({
      message: 'Too Many Requests. Try again in a few minutes.',
      retry_after_seconds: Math.ceil(remainingMs / 1000),
    });
  }

  rateLimitMap.set(requesterIP, now);

  try {
    const tagParams = req.query.tag;
    const useAndLogic = req.query.logic === 'and';

    const allEvents = await loadJson(EVENTS_FILE);

    const tagArray = tagParams
      ? Array.isArray(tagParams)
        ? tagParams
        : [tagParams]
      : [];

    const upcoming = filterAndSortEvents(allEvents, {
      startDate: new Date(),
      tagArray,
      useAndLogic
    }).slice(0, 5);

    res.json(upcoming.map(normalizeEvent));
  } catch (err) {
    console.error('[INTERNAL] Unexpected error in /internal/upcoming-events:', err);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
