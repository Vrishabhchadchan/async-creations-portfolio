import { NextResponse } from 'next/server';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { getSession } from '@/lib/auth';

export async function POST(request: Request) {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        const session = await getSession();
        if (!session) throw new Error('Unauthorized — please log in again.');
        return {
          allowedContentTypes: [
            // Images
            'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif',
            // Videos
            'video/mp4', 'video/quicktime', 'video/webm', 'video/x-msvideo', 'video/mpeg',
          ],
          addRandomSuffix: true,
          maximumSizeInBytes: 500 * 1024 * 1024, // 500 MB for videos
        };
      },
      // The portal appends the uploaded photo to the manifest itself once
      // upload() resolves, so there is nothing to do here.
      onUploadCompleted: async () => {},
    });
    return NextResponse.json(jsonResponse);
  } catch (err) {
    console.error('POST /api/blob-upload', err);
    return NextResponse.json({ error: (err as Error).message || 'Upload failed' }, { status: 400 });
  }
}
