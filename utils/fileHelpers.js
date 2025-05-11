const fs = require('fs-extra');

async function loadJson(file, fallback = []) {
  try {
    const data = await fs.readFile(file, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return fallback;
  }
}

async function saveJson(file, data) {
  await fs.ensureFile(file);
  await fs.writeFile(file, JSON.stringify(data, null, 2));
}

module.exports = { loadJson, saveJson };