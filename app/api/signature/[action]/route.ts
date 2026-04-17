import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminStorage } from '@/lib/firebase-admin';
import { PDFDocument } from 'pdf-lib';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest, { params }: { params: { action: string } }) {
  const { action } = params;
  const body = await req.json();

  if (action === 'send') {
    const { contractId, email, projectName } = body;
    // Update contract status and send email
    await adminDb.collection('contracts').doc(contractId).update({ status: 'PENDING_SIGNATURE' });
    await resend.emails.send({
      from: 'Paylob <hello@paylob.xyz>',
      to: email,
      subject: 'Contract Signature Request',
      html: `<p>Please sign the contract for project ${projectName}: <a href="${process.env.NEXT_PUBLIC_APP_URL}/sign/${contractId}">Sign Here</a></p>`
    });
    return NextResponse.json({ success: true });
  } else if (action === 'sign') {
    const { contractId, signatureDataUrl } = body;
    // Process signature: fetch PDF, embed with pdf-lib, upload back
    const contractDoc = await adminDb.collection('contracts').doc(contractId).get();
    if (!contractDoc.exists) return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
    const contractData = contractDoc.data()!;
    
    // 1. Fetch PDF from storage (mocking path for now)
    const file = adminStorage.bucket().file(`contracts/${contractId}.pdf`);
    const [pdfBytes] = await file.download();
    const pdfDoc = await PDFDocument.load(pdfBytes);
    
    // 2. Embed signature (simplified mock implementation)
    // In production, you would convert signatureDataUrl to bytes, 
    // embed in the PDF, flatten, hash, and timestamp.
    
    await adminDb.collection('contracts').doc(contractId).update({ status: 'SIGNED' });
    
    // 3. Record in signature_audit
    await adminDb.collection('signature_audit').add({
      contractId,
      eventType: 'signed',
      timestamp: new Date().toISOString(),
      documentHash: 'temp-hash'
    });
    
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
