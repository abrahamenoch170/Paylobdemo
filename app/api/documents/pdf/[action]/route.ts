import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/server/auth';
import { adminDb } from '@/lib/firebase-admin';
import { fileIdSchema } from '@/lib/validation/api';
import { pdfProcessor } from '@/lib/documents/pdf';

export async function POST(req: Request, { params }: { params: { action: string } }) {
  try {
    const auth = await requireAuth(req);
    const body = await req.json();

    if (params.action === 'merge') {
      if (!Array.isArray(body.fileIds) || body.fileIds.length < 2) {
        return NextResponse.json({ error: 'fileIds must include at least two ids' }, { status: 400 });
      }

      const buffers: Buffer[] = [];
      for (const fileId of body.fileIds) {
        const fileSnap = await adminDb.collection('files').doc(fileId).get();
        if (!fileSnap.exists) return NextResponse.json({ error: `File ${fileId} not found` }, { status: 404 });
        const file = fileSnap.data() as { projectId: string };
        const projectSnap = await adminDb.collection('projects').doc(file.projectId).get();
        if (!projectSnap.exists) return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        const project = projectSnap.data() as { clientId: string; freelancerId: string };
        const isParticipant = project.clientId === auth.uid || project.freelancerId === auth.uid || auth.role === 'admin';
        if (!isParticipant) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        buffers.push(Buffer.alloc(10));
      }

      const merged = await pdfProcessor.mergePdfs(buffers);
      return NextResponse.json({ status: 'ok', action: params.action, size: merged.length });
    }

    const parsed = fileIdSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    const fileSnap = await adminDb.collection('files').doc(parsed.data.fileId).get();
    if (!fileSnap.exists) return NextResponse.json({ error: 'File not found' }, { status: 404 });

    const file = fileSnap.data() as { projectId: string };
    const projectSnap = await adminDb.collection('projects').doc(file.projectId).get();
    if (!projectSnap.exists) return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    const project = projectSnap.data() as { clientId: string; freelancerId: string };

    const isParticipant = project.clientId === auth.uid || project.freelancerId === auth.uid || auth.role === 'admin';
    if (!isParticipant) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    if (params.action === 'compress') {
      const compressed = await pdfProcessor.compressPdf(Buffer.alloc(10));
      return NextResponse.json({ status: 'ok', action: params.action, fileId: parsed.data.fileId, size: compressed.length });
    }

    return NextResponse.json({ error: 'Unsupported action' }, { status: 400 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    if (message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ error: 'Document action failed' }, { status: 500 });
  }
}
