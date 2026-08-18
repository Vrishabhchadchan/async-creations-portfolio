const { getManifest } = require('./_lib/manifest');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const items = await getManifest();
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({ items });
  } catch (err) {
    console.error('gallery.js', err);
    return res.status(500).json({ error: 'Failed to load gallery' });
  }
};
