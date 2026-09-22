const { getSession } = require('./_lib/auth');
const { getUploadUrl } = require('./_lib/r2');

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif']);

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = getSession(req);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized — please log in again.' });
  }

  const { filename, contentType } = req.body || {};
  if (!filename || typeof filename !== 'string') {
    return res.status(400).json({ error: 'Missing filename' });
  }
  if (!ALLOWED_TYPES.has(contentType)) {
    return res.status(400).json({ error: 'Unsupported file type' });
  }

  const safeName = filename.replace(/[^a-zA-Z0-9.\-_]/g, '-');
  const key = `gallery/photos/${Date.now()}-${safeName}`;

  try {
    const { uploadUrl, publicUrl } = await getUploadUrl(key, contentType);
    return res.status(200).json({ uploadUrl, publicUrl });
  } catch (err) {
    console.error('blob-upload.js', err);
    return res.status(500).json({ error: 'Could not prepare upload' });
  }
};
