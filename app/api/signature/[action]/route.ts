import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';
import { Resend } from 'resend';
import { z } from 'zod';
import { adminDb, adminStorage } from '@/lib/firebase-admin';
import { requireAuth } from '@/lib/server-auth';
import { checkRateLimit, getRateLimitKey } from '@/lib/rate-limit';

const sendSchema = z.object({
  contractId: z.string().min(1),
  email: z.string().email(),
  projectName: z.string().min(1).max(200),
});

const signSchema = z.object({
  contractId: z.string().min(1),
  signatureDataUrl: z.string().min(20).max(2_000_000),
});

export async function POST(req: NextRequest, { params }: { params: { action: string } }) {
  try {
    const user = await requireAuth(req);
    const rateKey = getRateLimitKey(user.uid, `api:signature:${params.action}`);
    const rateResult = checkRateLimit(rateKey, 20, 60_000);

    if (!rateResult.allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const { action } = params;

    if (action === 'send') {
      const { contractId, email, projectName } = sendSchema.parse(await req.json());
      const contractRef = adminDb.collection('contracts').doc(contractId);
      const contractSnap = await contractRef.get();

      if (!contractSnap.exists) {
        return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
      }

      const contract = contractSnap.data() as { clientId?: string; freelancerId?: string };
      const isParticipant = contract.clientId === user.uid || contract.freelancerId === user.uid;

      if (!isParticipant) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      const resend = new Resend(process.env.RESEND_API_KEY);
      await contractRef.update({ status: 'PENDING_SIGNATURE', updatedAt: new Date().toISOString() });
      await resend.emails.send({
        from: 'Paylob <hello@paylob.xyz>',
        to: email,
        subject: 'Contract Signature Request',
        html: `<p>Please sign the contract for project ${projectName}.</p><p><a href="${process.env.NEXT_PUBLIC_APP_URL}/sign/${contractId}">Sign Here</a></p>`,
      });

      return NextResponse.json({ success: true });
    }

    if (action === 'sign') {
      const { contractId } = signSchema.parse(await req.json());
      const contractRef = adminDb.collection('contracts').doc(contractId);
      const contractDoc = await contractRef.get();

      if (!contractDoc.exists) {
        return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
      }

      const contract = contractDoc.data() as { clientId?: string; freelancerId?: string };
      const isParticipant = contract.clientId === user.uid || contract.freelancerId === user.uid;

      if (!isParticipant) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      const file = adminStorage.bucket().file(`contracts/${contractId}.pdf`);
      const [pdfBytes] = await file.download();
      await PDFDocument.load(pdfBytes);

      await contractRef.update({ status: 'SIGNED', updatedAt: new Date().toISOString() });

      await adminDb.collection('signature_audit').add({
        contractId,
        eventType: 'signed',
        actorId: user.uid,
        timestamp: new Date().toISOString(),
        documentHash: 'pending-hash',
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request payload', details: error.flatten() }, { status: 400 });
    }

    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.error('Signature route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
