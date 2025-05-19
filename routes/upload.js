const express = require('express');
const path = require('path');
const { loadJson, saveJson } = require('../utils/fileHelpers');
const { filterAndSortEvents } = require('../utils/eventsHelpers');

const router = express.Router();

const EVENTS_FILE = path.join(__dirname, '..', 'storage', 'events.json');
const USERS_FILE = path.join(__dirname, '..', 'storage', 'users.json');
const TOKENS_FILE = path.join(__dirname, '..', 'storage', 'tokens.json');

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
    thumb_url: event.thumb_url || ''
  };
}

module.exports = router;
