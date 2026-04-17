import { NextRequest, NextResponse } from 'next/server';
import { adminStorage } from '@/lib/firebase-admin';
import multer from 'multer';

// Setup multer for handling file uploads in API routes (if needed)
const upload = multer({ storage: multer.memoryStorage() });

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `uploads/${Date.now()}-${file.name}`;
    const fileRef = adminStorage.bucket().file(fileName);

    await fileRef.save(buffer, {
      metadata: { contentType: file.type }
    });

    const [url] = await fileRef.getSignedUrl({
      action: 'read',
      expires: '03-01-2500'
    });

    return NextResponse.json({ url, fileName });
  } catch (error) {
    console.error('Upload Error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
