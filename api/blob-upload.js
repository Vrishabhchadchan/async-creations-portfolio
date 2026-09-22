const { getSession } = require('./_lib/auth');
const { getUploadPost } = require('./_lib/r2');

const ALLOWED_TYPES = {
  'image/jpeg': 'image',
  'image/png': 'image',
  'image/webp': 'image',
  'image/gif': 'image',
  'image/heic': 'image',
  'image/heif': 'image',
  'video/mp4': 'video',
  'video/webm': 'video',
  'video/quicktime': 'video',
};

const MAX_SIZE_BYTES = {
  image: 30 * 1024 * 1024,
  video: 200 * 1024 * 1024,
};

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
  const mediaType = ALLOWED_TYPES[contentType];
  if (!mediaType) {
    return res.status(400).json({ error: 'Unsupported file type' });
  }

  const safeName = filename.replace(/[^a-zA-Z0-9.\-_]/g, '-');
  const key = `gallery/${mediaType === 'video' ? 'videos' : 'photos'}/${Date.now()}-${safeName}`;

  try {
    const { url, fields, publicUrl } = await getUploadPost(key, contentType, MAX_SIZE_BYTES[mediaType]);
    return res.status(200).json({ uploadUrl: url, fields, publicUrl, mediaType });
  } catch (err) {
    console.error('blob-upload.js', err);
    return res.status(500).json({ error: 'Could not prepare upload' });
  }
};
