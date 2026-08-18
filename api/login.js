const crypto = require('crypto');
const { setSessionCookie } = require('./_lib/auth');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const expected = process.env.TEAM_PASSCODE;
  if (!expected) {
    return res.status(500).json({ error: 'Server is not configured (missing TEAM_PASSCODE)' });
  }

  const { passcode } = req.body || {};
  const given = typeof passcode === 'string' ? passcode : '';

  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  const match = a.length === b.length && crypto.timingSafeEqual(a, b);

  if (!match) {
    return res.status(401).json({ error: 'Incorrect passcode' });
  }

  setSessionCookie(req, res);
  return res.status(200).json({ ok: true });
};
