import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { pdfProcessor } from '@/lib/documents/pdf';
import { mediaProcessor } from '@/lib/documents/media';
import { requireAuth } from '@/lib/server-auth';

const compressSchema = z.object({ fileId: z.string().min(1) });
const mergeSchema = z.object({ fileIds: z.array(z.string().min(1)).min(2) });
const thumbnailSchema = z.object({ fileId: z.string().min(1), type: z.enum(['video', 'image']) });

export async function POST(req: NextRequest, { params }: { params: { name: string } }) {
  try {
    await requireAuth(req);
    const { name } = params;
    const body = await req.json();

    switch (name) {
      case 'compress_pdf': {
        compressSchema.parse(body);
        const mockBuffer = Buffer.alloc(10);
        const compressed = await pdfProcessor.compressPdf(mockBuffer);
        return NextResponse.json({ status: 'success', message: 'PDF compressed successfully', size: compressed.length });
      }
      case 'merge_pdf': {
        const { fileIds } = mergeSchema.parse(body);
        const buffers = fileIds.map(() => Buffer.alloc(10));
        const merged = await pdfProcessor.mergePdfs(buffers);
        return NextResponse.json({ status: 'success', message: 'PDFs merged successfully', size: merged.length });
      }
      case 'generate_thumbnail': {
        const { type } = thumbnailSchema.parse(body);
        const mockBuffer = Buffer.alloc(10);
        const preview =
          type === 'video'
            ? await mediaProcessor.generateVideoPreview('/tmp/mock.mp4')
            : await mediaProcessor.generateImagePreview(mockBuffer);
        return NextResponse.json({
          status: 'success',
          message: 'Thumbnail generated',
          previewUrl: 'https://mock-storage.app/previews/thumb.jpg',
          size: preview.length,
        });
      }
      default:
        return NextResponse.json({ error: 'Skill not implemented' }, { status: 404 });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request payload', details: error.flatten() }, { status: 400 });
    }

    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.error(`Skill route error (${params.name}):`, error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
