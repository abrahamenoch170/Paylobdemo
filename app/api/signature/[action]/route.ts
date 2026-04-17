import { NextResponse } from 'next/server';
import { adminDb, adminStorage } from '@/lib/firebase-admin';
import { PDFDocument } from 'pdf-lib';
import { Resend } from 'resend';
import { requireAuth } from '@/lib/server/auth';
import { signatureSendSchema, signatureSignSchema } from '@/lib/validation/api';

const escapeHtml = (v: string) =>
  v.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');

export async function POST(req: Request, { params }: { params: { action: string } }) {
  try {
    const auth = await requireAuth(req);
    const { action } = params;
    const body = await req.json();

    if (action === 'send') {
      const parsed = signatureSendSchema.safeParse(body);
      if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
      const { contractId, email, projectName } = parsed.data;

      const contractRef = adminDb.collection('contracts').doc(contractId);
      const contractDoc = await contractRef.get();
      if (!contractDoc.exists) return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
      const contract = contractDoc.data() as { clientId: string; freelancerId: string };

      if (![contract.clientId, contract.freelancerId].includes(auth.uid) && auth.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      await contractRef.update({ status: 'PENDING_SIGNATURE' });
      const resend = new Resend(process.env.RESEND_API_KEY || 're_placeholder');
      await resend.emails.send({
        from: 'Paylob <hello@paylob.xyz>',
        to: email,
        subject: 'Contract Signature Request',
        html: `<p>Please sign the contract for project ${escapeHtml(projectName)}: <a href="${process.env.APP_URL}/sign/${contractId}">Sign Here</a></p>`,
      });
      return NextResponse.json({ success: true });
    }

    if (action === 'sign') {
      const parsed = signatureSignSchema.safeParse(body);
      if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

      const { contractId } = parsed.data;
      const contractDoc = await adminDb.collection('contracts').doc(contractId).get();
      if (!contractDoc.exists) return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
      const contract = contractDoc.data() as { clientId: string; freelancerId: string };

      if (![contract.clientId, contract.freelancerId].includes(auth.uid) && auth.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      const file = adminStorage.bucket().file(`contracts/${contractId}.pdf`);
      const [pdfBytes] = await file.download();
      await PDFDocument.load(pdfBytes);

      await adminDb.collection('contracts').doc(contractId).update({ status: 'SIGNED' });
      await adminDb.collection('signature_audit').add({
        contractId,
        eventType: 'signed',
        userId: auth.uid,
        timestamp: new Date().toISOString(),
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "UNKNOWN";
    if (errorMessage === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ error: 'Signature action failed' }, { status: 500 });
  }
}
