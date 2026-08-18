const { del } = require('@vercel/blob');
const { getSession } = require('./_lib/auth');
const { getManifest, updateManifest } = require('./_lib/manifest');

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

  const items = await getManifest();
  const target = items.find((item) => item.id === id);
  if (!target) {
    return res.status(404).json({ error: 'Photo not found' });
  }

  // Only delete the underlying file if it actually lives in our Blob store —
  // seed/static images under /images/ should never be removed from disk.
  if (target.imageUrl && target.imageUrl.includes('.public.blob.vercel-storage.com/')) {
    try {
      await del(target.imageUrl);
    } catch (err) {
      console.error('gallery-delete.js: blob delete failed', err);
    }
  }

  try {
    const updated = await updateManifest(
      (current) => current.filter((item) => item.id !== id),
      (check) => !check.some((item) => item.id === id)
    );
    return res.status(200).json({ items: updated });
  } catch (err) {
    console.error('gallery-delete.js', err);
    return res.status(409).json({ error: err.message || 'Could not delete photo. Please try again.' });
  }
};
