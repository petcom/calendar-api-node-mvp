const path = require('path');
const fs = require('fs-extra');

const DEFAULT_STORAGE_DIR = path.resolve(__dirname, '..', 'storage');
const STORAGE_DIR = process.env.STORAGE_DIR
  ? path.resolve(process.env.STORAGE_DIR)
  : DEFAULT_STORAGE_DIR;

function getStoragePath(...segments) {
  return path.join(STORAGE_DIR, ...segments);
}

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

module.exports = { loadJson, saveJson, getStoragePath, STORAGE_DIR };