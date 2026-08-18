const { getSession } = require('./_lib/auth');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const session = getSession(req);
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({ authenticated: !!session });
};
