const { getSession } = require('./_lib/auth');
const { getItem, deleteItem } = require('./_lib/manifest');
const { deleteObject, keyFromPublicUrl } = require('./_lib/r2');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = getSession(req);
  if (!session) {
    return res.status(401).json({ error: 'Please log in again.' });
  }

  const { id } = req.body || {};
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Missing id' });
  }

  const target = await getItem(id);
  if (!target) {
    return res.status(404).json({ error: 'Photo not found' });
  }

  // Only delete the underlying file if it actually lives in our R2 bucket —
  // seed/static images under /images/ should never be removed from disk.
  const key = keyFromPublicUrl(target.imageUrl);
  if (key) {
    try {
      await deleteObject(key);
    } catch (err) {
      console.error('gallery-delete.js: R2 delete failed', err);
    }
  }

  try {
    const updated = await deleteItem(id);
    return res.status(200).json({ items: updated });
  } catch (err) {
    console.error('gallery-delete.js', err);
    return res.status(500).json({ error: 'Could not delete photo. Please try again.' });
  }
};
