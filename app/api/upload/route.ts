import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { adminStorage, adminDb } from '@/lib/firebase-admin';
import { requireAuth, requireRole } from '@/lib/server/auth';
import { fileUploadSchema } from '@/lib/validation/api';
import { getClientIp, rateLimit } from '@/lib/server/rate-limit';
import { mediaProcessor } from '@/lib/documents/media';

const MAX_FILE_SIZE = 25 * 1024 * 1024;
const ALLOWED_MIME = new Set(['application/pdf', 'image/png', 'image/jpeg', 'video/mp4']);

function magicMime(buffer: Buffer): string | null {
  if (buffer.length >= 4 && buffer.slice(0, 4).toString('hex') === '25504446') return 'application/pdf';
  if (buffer.length >= 4 && buffer.slice(0, 4).toString('hex') === '89504e47') return 'image/png';
  if (buffer.length >= 3 && buffer.slice(0, 3).toString('hex') === 'ffd8ff') return 'image/jpeg';
  if (buffer.length >= 12 && buffer.slice(4, 8).toString() === 'ftyp') return 'video/mp4';
  return null;
}

export async function POST(req: Request) {
  try {
    const auth = await requireAuth(req);
    requireRole(auth, ['freelancer', 'admin']);

    const ip = getClientIp(req);
    const limited = rateLimit({ key: `upload:${ip}:${auth.uid}`, max: 30, windowMs: 60_000 });
    if (!limited.success) return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const projectId = formData.get('projectId');
    const milestoneId = formData.get('milestoneId');

    const parsed = fileUploadSchema.safeParse({
      projectId: typeof projectId === 'string' ? projectId : '',
      milestoneId: typeof milestoneId === 'string' ? milestoneId : undefined,
    });
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });
    if (file.size > MAX_FILE_SIZE) return NextResponse.json({ error: 'File too large' }, { status: 400 });
    if (!ALLOWED_MIME.has(file.type)) return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });

    const project = await adminDb.collection('projects').doc(parsed.data.projectId).get();
    if (!project.exists) return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    const projectData = project.data() as { freelancerId: string; clientId: string };

    if (projectData.freelancerId !== auth.uid && auth.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const detected = magicMime(buffer);
    if (!detected || detected !== file.type) {
      return NextResponse.json({ error: 'Invalid file signature' }, { status: 400 });
    }

    const hash = crypto.createHash('sha256').update(buffer).digest('hex');
    const fileName = `uploads/${auth.uid}/${Date.now()}-${file.name}`;

    let previewPath: string | null = null;
    if (file.type.startsWith('image/')) {
      previewPath = await mediaProcessor.generateImagePreview(buffer);
    } else if (file.type === 'application/pdf') {
      previewPath = await mediaProcessor.generatePdfPreview(buffer);
    } else if (file.type === 'video/mp4') {
      previewPath = await mediaProcessor.generateVideoPreview(fileName);
    }

    const fileRef = adminStorage.bucket().file(fileName);

    await fileRef.save(buffer, {
      metadata: {
        contentType: file.type,
        metadata: {
          projectId: parsed.data.projectId,
          milestoneId: parsed.data.milestoneId || '',
          ownerId: auth.uid,
          hash,
        },
      },
    });

    const [url] = await fileRef.getSignedUrl({ action: 'read', expires: Date.now() + 15 * 60 * 1000 });

    return NextResponse.json({ url, fileName, hash, previewPath });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "UNKNOWN";
    if (errorMessage === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (errorMessage === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
