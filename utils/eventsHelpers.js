function filterAndSortEvents(events, options = {}) {
  const {
    startDate = new Date('2000-01-01'),
    endDate = new Date('2100-01-01'),
    tagArray = [],
    useAndLogic = false
  } = options;

  return events
    .filter(event => {
      // Check date range
      const eventDate = new Date(event.date);
      if (isNaN(eventDate) || eventDate < startDate || eventDate > endDate) {
        return false;
      }

      // Check tags
      if (tagArray.length > 0 && Array.isArray(event.tags)) {
        const normalizedEventTags = event.tags.map(t => t.toLowerCase());
        const normalizedFilterTags = tagArray.map(t => t.toLowerCase());

        switch (useAndLogic) {
          case true:
            return normalizedFilterTags.every(tag => normalizedEventTags.includes(tag));
          case false:
          default:
            return normalizedFilterTags.some(tag => normalizedEventTags.includes(tag));
        }
      }

      return true;
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date));
}

module.exports = { filterAndSortEvents };