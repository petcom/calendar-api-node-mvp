function filterAndSortEvents(events, {
  startDate = null,
  endDate = null,
  tagArray = [],
  useAndLogic = false,
  applyDateFilter = true
} = {}) {
  return events
    .filter(event => {
      const eventDate = new Date(event.event_date);
      if (isNaN(eventDate)) return false;

      // Optional date filtering
      if (applyDateFilter) {
        if (startDate && eventDate < new Date(startDate)) return false;
        if (endDate && eventDate > new Date(endDate)) return false;
      }

      // Optional tag filtering
      if (tagArray.length > 0) {
        const eventTags = (event.tags || []).map(t => t.toLowerCase());
        const matchTags = tagArray.map(t => t.toLowerCase());

        return useAndLogic
          ? matchTags.every(tag => eventTags.includes(tag))
          : matchTags.some(tag => eventTags.includes(tag));
      }

      return true;
    })
    .sort((a, b) => new Date(a.event_date) - new Date(b.event_date));
}

module.exports = { filterAndSortEvents };
