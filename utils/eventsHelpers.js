function filterAndSortEvents(events, options = {}) {
  const {
    startDate = new Date('2000-01-01'),
    endDate = new Date('2100-01-01'),
    tagArray = [],
    useAndLogic = false
  } = options;

  return events
    .filter(event => {
      // Enforce presence of required date fields
      if (!event.event_date) return false;

      const eventDate = new Date(event.event_date);
      const displayFromDate = new Date(event.display_from_date || startDate);

      if (
        isNaN(eventDate) ||
        isNaN(displayFromDate) ||
        eventDate < startDate ||
        eventDate > endDate ||
        displayFromDate > endDate
      ) {
        return false;
      }

      // Tag filtering
      if (tagArray.length > 0 && Array.isArray(event.tags)) {
        const normalizedEventTags = event.tags.map(t => t.toLowerCase());
        const normalizedFilterTags = tagArray.map(t => t.toLowerCase());

        return useAndLogic
          ? normalizedFilterTags.every(tag => normalizedEventTags.includes(tag))
          : normalizedFilterTags.some(tag => normalizedEventTags.includes(tag));
      }

      return true;
    })
    .sort((a, b) => new Date(a.event_date) - new Date(b.event_date));
}

module.exports = { filterAndSortEvents };
