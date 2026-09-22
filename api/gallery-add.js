const crypto = require('crypto');
const { getSession } = require('./_lib/auth');
const { insertItem, categoryLabel, CATEGORY_LABELS } = require('./_lib/manifest');

const VALID_SIZES = new Set(['normal', 'big', 'tall', 'wide']);
const VALID_MEDIA_TYPES = new Set(['image', 'video']);

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = getSession(req);
  if (!session) {
    return res.status(401).json({ error: 'Please log in again.' });
  }

  const { url, category, title, size, mediaType } = req.body || {};

  if (!url || typeof url !== 'string' || !/^https:\/\//.test(url)) {
    return res.status(400).json({ error: 'Missing or invalid image URL' });
  }
  if (!category || !CATEGORY_LABELS[category]) {
    return res.status(400).json({ error: 'Invalid category' });
  }
  const cleanTitle = (typeof title === 'string' ? title : '').trim().slice(0, 120);
  if (!cleanTitle) {
    return res.status(400).json({ error: 'Title is required' });
  }
  const cleanSize = VALID_SIZES.has(size) ? size : 'normal';
  const cleanMediaType = VALID_MEDIA_TYPES.has(mediaType) ? mediaType : 'image';

  const newItem = {
    id: crypto.randomUUID(),
    category,
    categoryLabel: categoryLabel(category),
    title: cleanTitle,
    size: cleanSize,
    imageUrl: url,
    mediaType: cleanMediaType,
    createdAt: Date.now(),
  };

  try {
    const items = await insertItem(newItem);
    return res.status(200).json({ items });
  } catch (err) {
    console.error('gallery-add.js', err);
    return res.status(500).json({ error: 'Could not save photo. Please try again.' });
  }
};
