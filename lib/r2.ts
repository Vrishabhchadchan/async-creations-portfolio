import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucketName = process.env.R2_BUCKET_NAME || 'async-website-gallery';
const publicUrlBase = process.env.R2_PUBLIC_URL?.replace(/\/$/, '');

export const isR2Configured = Boolean(
  accountId && accessKeyId && secretAccessKey && bucketName && publicUrlBase
);

export const s3Client = isR2Configured
  ? new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: accessKeyId!,
        secretAccessKey: secretAccessKey!,
      },
    })
  : null;

/**
 * Generate a presigned PUT URL allowing the client browser to upload
 * directly to Cloudflare R2 without passing through serverless body limits.
 */
export async function getR2PresignedUploadUrl(key: string, contentType: string) {
  if (!s3Client || !isR2Configured) {
    throw new Error('Cloudflare R2 is not fully configured.');
  }

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  const publicUrl = `${publicUrlBase}/${key}`;

  return { uploadUrl, publicUrl, key };
}
