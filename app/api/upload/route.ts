import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { z } from 'zod';
import { adminStorage } from '@/lib/firebase-admin';
import { requireAuth } from '@/lib/server-auth';
import { checkRateLimit, getRateLimitKey } from '@/lib/rate-limit';

const uploadMetaSchema = z.object({
  folder: z.string().min(1).max(50).optional(),
});

function getMagicFileType(buffer: Buffer): { ext: string; mime: string } | null {
  const signatures = [
    { ext: 'png', mime: 'image/png', bytes: [0x89, 0x50, 0x4e, 0x47] },
    { ext: 'jpg', mime: 'image/jpeg', bytes: [0xff, 0xd8, 0xff] },
    { ext: 'pdf', mime: 'application/pdf', bytes: [0x25, 0x50, 0x44, 0x46] },
    { ext: 'webp', mime: 'image/webp', bytes: [0x52, 0x49, 0x46, 0x46] },
  ];

  for (const sig of signatures) {
    if (sig.bytes.every((byte, i) => buffer[i] === byte)) {
      return { ext: sig.ext, mime: sig.mime };
    }
  }

  return null;
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const rateKey = getRateLimitKey(user.uid, 'api:upload');
    const rateResult = checkRateLimit(rateKey, 30, 60_000);

    if (!rateResult.allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const formData = await req.formData();
    const metaInput = formData.get('meta')?.toString();
    if (metaInput) {
      uploadMetaSchema.parse(JSON.parse(metaInput));
    }

    const file = formData.get('file');
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const maxBytes = 10 * 1024 * 1024;
    if (file.size > maxBytes) {
      return NextResponse.json({ error: 'File too large' }, { status: 413 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const detectedType = getMagicFileType(buffer);

    if (!detectedType) {
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
    }

    const fileName = `uploads/${user.uid}/${Date.now()}-${crypto.randomUUID()}.${detectedType.ext}`;
    const fileRef = adminStorage.bucket().file(fileName);

    await fileRef.save(buffer, {
      metadata: {
        contentType: detectedType.mime,
        metadata: { ownerId: user.uid },
      },
    });

    const [url] = await fileRef.getSignedUrl({
      action: 'read',
      expires: Date.now() + 60 * 60 * 1000,
    });

    return NextResponse.json({ url, fileName, contentType: detectedType.mime });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request payload', details: error.flatten() }, { status: 400 });
    }

    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.error('Upload route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
