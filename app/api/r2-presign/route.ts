import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { isR2Configured, getR2PresignedUploadUrl } from '@/lib/r2';

const ALLOWED_CONTENT_TYPES = new Set([
  // Images
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/heic',
  'image/heif',
  'image/svg+xml',
  // Videos
  'video/mp4',
  'video/quicktime',
  'video/webm',
  'video/x-msvideo',
  'video/mpeg',
]);

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized — please log in again.' }, { status: 401 });
    }

    if (!isR2Configured) {
      return NextResponse.json({ error: 'R2 storage is not configured.' }, { status: 503 });
    }

    const { filename, contentType, folder } = await request.json();

    if (!filename || typeof filename !== 'string') {
      return NextResponse.json({ error: 'Missing filename.' }, { status: 400 });
    }

    if (!contentType || !ALLOWED_CONTENT_TYPES.has(contentType)) {
      return NextResponse.json({ error: 'File type not allowed.' }, { status: 400 });
    }

    const safeName = filename.replace(/[^a-zA-Z0-9.\-_]/g, '-');
    const targetFolder = (folder || 'gallery/photos').replace(/^\/+|\/+$/g, '');
    const key = `${targetFolder}/${Date.now()}-${safeName}`;

    const presigned = await getR2PresignedUploadUrl(key, contentType);

    return NextResponse.json(presigned);
  } catch (err) {
    console.error('POST /api/r2-presign', err);
    return NextResponse.json({ error: (err as Error).message || 'Failed to generate upload URL' }, { status: 500 });
  }
}
