const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

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

// Client uploads go straight to R2 via a presigned URL, never through this
// serverless function — keeps large files off the function body-size limit
// and off our compute time entirely.
//
// R2 doesn't support presigned POST (content-length-range policies), so the
// size cap is enforced a different way: contentLength is baked into the
// PutObjectCommand and forced into the signature via unhoistableHeaders.
// That makes the exact byte count part of what's signed — R2 rejects the
// PUT if the real request body doesn't match, so a caller can't silently
// upload more than what was declared and checked against the size limit.
async function getUploadUrl(key, contentType, contentLength) {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
    ContentLength: contentLength,
  });
  const uploadUrl = await getSignedUrl(client, command, {
    expiresIn: 300,
    unhoistableHeaders: new Set(['content-length']),
  });
  return { uploadUrl, publicUrl: `${PUBLIC_URL}/${key}` };
}

async function deleteObject(key) {
  await client.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
}

function keyFromPublicUrl(url) {
  if (!url || !PUBLIC_URL || !url.startsWith(`${PUBLIC_URL}/`)) return null;
  return url.slice(PUBLIC_URL.length + 1);
}

module.exports = { getUploadUrl, deleteObject, keyFromPublicUrl };
