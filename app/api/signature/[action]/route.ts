import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { eSignature } from '@/lib/signature/docuseal';

export async function POST(req: Request, { params }: { params: { action: string } }) {
  const { action } = params;
  const body = await req.json();

  try {
    if (action === 'request') {
      const { milestoneId, signers, documentUrl } = body;
      const result = await eSignature.createSignatureRequest(documentUrl, signers);
      
      await adminDb.collection('signature_audit').add({
        milestoneId,
        submissionId: result.submissionId,
        status: 'PENDING',
        requestedAt: new Date()
      });

      return NextResponse.json({ success: true, data: result });
    }

    if (action === 'verify') {
      const { submissionId } = body;
      const status = await eSignature.getSignatureStatus(submissionId);
      
      return NextResponse.json({ success: true, status });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error(`Signature ${action} error:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
