const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/events';
const UPCOMING_URL = 'http://localhost:3000/api/upcoming-events';
const TEST_TOKEN = 'c037d7ad1aeb0b3f7f2f72ea5e7ba335';

describe('Events API', () => {
  it('GET /events should return events', async () => {
    const res = await axios.get(BASE_URL, {
      params: { token: TEST_TOKEN }
    });
    expect(Array.isArray(res.data)).toBe(true);
  });

  it('GET /upcoming-events should return up to 5 upcoming events', async () => {
    const res = await axios.get(UPCOMING_URL, {
      params: { token: TEST_TOKEN }
    });
    expect(Array.isArray(res.data)).toBe(true);
    expect(res.data.length).toBeLessThanOrEqual(5);
  });

  it('POST /events should create an event', async () => {
    const payload = {
      token: TEST_TOKEN,
      title: 'Test Event',
      description: 'This event is for testing',
      date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      tags: ['test', 'api']
    };

    const res = await axios.post(BASE_URL, payload);
    expect(res.status).toBe(201);
    expect(res.data.title).toBe('Test Event');
  });

  it('GET /upcoming-events with AND logic should filter correctly', async () => {
    const res = await axios.get(UPCOMING_URL, {
      params: { token: TEST_TOKEN, tag: ['sonar', 'beefy'], logic: 'and' }
    });
    expect(Array.isArray(res.data)).toBe(true);
    res.data.forEach(event => {
      const tags = event.tags.map(t => t.toLowerCase());
      expect(tags).toEqual(expect.arrayContaining(['sonar', 'beefy']));
    });
  });

  it('GET /upcoming-events with OR logic should return events matching any tag', async () => {
    const res = await axios.get(UPCOMING_URL, {
      params: { token: TEST_TOKEN, tag: ['sonar', 'steve'], logic: 'or' }
    });
    expect(Array.isArray(res.data)).toBe(true);
    res.data.forEach(event => {
      const tags = event.tags.map(t => t.toLowerCase());
      expect(tags.includes('sonar') || tags.includes('steve')).toBe(true);
    });
  });
});
