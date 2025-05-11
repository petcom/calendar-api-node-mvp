// utils/eventHelpers.js

function isDateInRange(dateStr, startDate, endDate) {
    const eventDate = new Date(`${dateStr}T00:00:00`);
    return !isNaN(eventDate) && eventDate >= startDate && eventDate <= endDate;
  }
  
  function matchesTagsAND(event, tagArray) {
    if (!Array.isArray(tagArray) || tagArray.length === 0) return true;
    if (!Array.isArray(event.tags)) return false;
  
    const eventTags = event.tags.map(t => t.toLowerCase());
    return tagArray.every(tag => eventTags.includes(tag.toLowerCase()));
  }
  
  function filterAndSortEvents(events, {
    startDate = new Date(),
    endDate = null,
    tagArray = []
  } = {}) {
    const end = endDate || new Date(startDate.getTime() + 14 * 24 * 60 * 60 * 1000);
  
    return events
      .filter(e =>
        e.date &&
        isDateInRange(e.date, startDate, end) &&
        matchesTagsAND(e, tagArray)
      )
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }
  
  module.exports = {
    isDateInRange,
    matchesTagsAND,
    filterAndSortEvents
  };
  