const { handleUpload } = require('@vercel/blob/client');
const { getSession } = require('./_lib/auth');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const jsonResponse = await handleUpload({
      body: req.body,
      request: req,
      onBeforeGenerateToken: async () => {
        const session = getSession(req);
        if (!session) {
          throw new Error('Unauthorized — please log in again.');
        }
        return {
          allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif'],
          addRandomSuffix: true,
          maximumSizeInBytes: 30 * 1024 * 1024,
        };
      },
      onUploadCompleted: async () => {
        // The admin page appends the uploaded photo to the manifest itself
        // once upload() resolves, so nothing to do here.
      },
    });
    return res.status(200).json(jsonResponse);
  } catch (err) {
    console.error('blob-upload.js', err);
    return res.status(400).json({ error: err.message || 'Upload failed' });
  }
};
