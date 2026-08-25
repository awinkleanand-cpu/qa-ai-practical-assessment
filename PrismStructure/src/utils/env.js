const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const text = fs.readFileSync(filePath, 'utf8');
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) {
      continue;
    }
    const eq = line.indexOf('=');
    if (eq <= 0) {
      continue;
    }
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(path.join(ROOT, '.env'));

function stripTrailingSlash(url) {
  return String(url || '').replace(/\/+$/, '');
}

function uiBaseUrl() {
  return stripTrailingSlash(
    process.env.UI_BASE_URL || 'https://practicesoftwaretesting.com'
  );
}

function apiBaseUrl() {
  return stripTrailingSlash(
    process.env.API_BASE_URL || 'https://api.practicesoftwaretesting.com'
  );
}

module.exports = { loadEnvFile, uiBaseUrl, apiBaseUrl };
