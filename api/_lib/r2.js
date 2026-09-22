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
// serverless function — keeps large photos off the function body-size limit
// and off our compute time entirely.
async function getUploadUrl(key, contentType) {
  const command = new PutObjectCommand({ Bucket: BUCKET, Key: key, ContentType: contentType });
  const uploadUrl = await getSignedUrl(client, command, { expiresIn: 300 });
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
