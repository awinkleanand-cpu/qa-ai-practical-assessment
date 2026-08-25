const crypto = require('crypto');

function uniqueEmail(prefix = 'user') {
  const stamp = Date.now();
  const rand = crypto.randomBytes(3).toString('hex');
  return `${prefix}_${stamp}${rand}@example.com`;
}

function uniquePassword() {
  const rand = crypto.randomBytes(4).toString('hex');
  return `Aa1!${rand}`;
}

module.exports = { uniqueEmail, uniquePassword };
