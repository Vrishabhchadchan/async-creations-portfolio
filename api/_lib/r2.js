const { S3Client, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { createPresignedPost } = require('@aws-sdk/s3-presigned-post');

const BUCKET = process.env.R2_BUCKET_NAME;
const PUBLIC_URL = (process.env.R2_PUBLIC_URL || '').replace(/\/$/, '');

const client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

// Client uploads go straight to R2 via a presigned POST policy, never
// through this serverless function — keeps large photos/videos off the
// function body-size limit and off our compute time entirely. A presigned
// POST (rather than a plain PUT URL) lets R2 enforce content-length-range
// itself, so an oversized upload is rejected by R2 before it ever lands in
// the bucket — the same class of "storage quietly fills up" bug that took
// the site down before.
async function getUploadPost(key, contentType, maxSizeBytes) {
  const { url, fields } = await createPresignedPost(client, {
    Bucket: BUCKET,
    Key: key,
    Conditions: [
      ['content-length-range', 0, maxSizeBytes],
      ['eq', '$Content-Type', contentType],
    ],
    Fields: { 'Content-Type': contentType },
    Expires: 300,
  });
  return { url, fields, publicUrl: `${PUBLIC_URL}/${key}` };
}

async function deleteObject(key) {
  await client.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
}

function keyFromPublicUrl(url) {
  if (!url || !PUBLIC_URL || !url.startsWith(`${PUBLIC_URL}/`)) return null;
  return url.slice(PUBLIC_URL.length + 1);
}

module.exports = { getUploadPost, deleteObject, keyFromPublicUrl };
