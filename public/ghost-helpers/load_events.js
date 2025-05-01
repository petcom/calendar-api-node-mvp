const fetch = require('node-fetch');

module.exports = async function load_events() {
  const API_TOKEN = 'YOUR_SECURE_TOKEN_HERE'; // Keep this private
  const EVENTS_API = `http://localhost:3000/api/events?token=${API_TOKEN}`;

  try {
    const res = await fetch(EVENTS_API);
    if (!res.ok) throw new Error('Failed to fetch events');
    const events = await res.json();

    // Convert events into an HTML string
    let output = '<section class="event-list"><h2>Upcoming Events</h2><ul>';
    if (events.length === 0) {
      output += '<li>No events found.</li>';
    } else {
      for (const event of events) {
        output += `
          <li>
            <strong>${event.title}</strong> – ${event.date}<br>
            <em>${event.description}</em><br>
            <small>Tags: ${event.tags?.join(', ') || 'None'}</small>
          </li>
        `;
      }
    }
    output += '</ul></section>';
    return output;
  } catch (err) {
    console.error('[Ghost Event Helper Error]', err);
    return '<p>Could not load events at this time.</p>';
  }
};
