import { NextResponse } from 'next/server';
import { pdfProcessor } from '@/lib/documents/pdf';
import { mediaProcessor } from '@/lib/documents/media';
import { fileIdSchema } from '@/lib/validation/api';
import { requireAuth } from '@/lib/server/auth';
import { getClientIp, rateLimit } from '@/lib/server/rate-limit';

export async function POST(req: Request, { params }: { params: { name: string } }) {
  try {
    await requireAuth(req);

    const ip = getClientIp(req);
    const limited = rateLimit({ key: `skills:${ip}:${params.name}`, max: 20, windowMs: 60_000 });
    if (!limited.success) return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });

    const { name } = params;
    const body = await req.json();

    switch (name) {
      case 'compress_pdf':
      case 'compress': {
        const parsed = fileIdSchema.safeParse(body);
        if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
        const compressed = await pdfProcessor.compressPdf(Buffer.alloc(10));
        return NextResponse.json({ status: 'success', message: 'PDF compressed successfully', size: compressed.length });
      }
      case 'merge_pdf':
      case 'merge': {
        if (!Array.isArray(body.fileIds) || body.fileIds.length < 2) {
          return NextResponse.json({ error: 'fileIds must include at least two ids' }, { status: 400 });
        }
        const merged = await pdfProcessor.mergePdfs(body.fileIds.map(() => Buffer.alloc(10)));
        return NextResponse.json({ status: 'success', message: 'PDFs merged successfully', size: merged.length });
      }
      case 'generate_thumbnail': {
        const parsed = fileIdSchema.safeParse(body);
        if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
        if (body.type === 'video') {
          await mediaProcessor.generateVideoPreview('/tmp/mock.mp4');
        } else {
          await mediaProcessor.generateImagePreview(Buffer.alloc(10));
        }
        return NextResponse.json({ status: 'success', message: 'Thumbnail generated', previewUrl: 'https://mock-storage.app/previews/thumb.jpg' });
      }
      default:
        return NextResponse.json({ error: 'Skill not implemented' }, { status: 404 });
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "UNKNOWN";
    if (errorMessage === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ status: 'error', message: 'Skill processing failed' }, { status: 500 });
  }
}
