import { NextResponse } from 'next/server';
import { flutterwave } from '@/lib/payment/flutterwave';
import { paystack } from '@/lib/payment/paystack';
import { adminDb } from '@/lib/firebase-admin';
import { paymentsInitSchema } from '@/lib/validation/api';
import { requireAuth, requireRole } from '@/lib/server/auth';
import { getClientIp, rateLimit } from '@/lib/server/rate-limit';

export async function POST(req: Request) {
  try {
    const auth = await requireAuth(req);
    requireRole(auth, ['client', 'admin']);

    const ip = getClientIp(req);
    const limited = rateLimit({ key: `pay-init:${ip}:${auth.uid}`, max: 25, windowMs: 60_000 });
    if (!limited.success) return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });

    const body = await req.json();
    const parsed = paymentsInitSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { milestoneId, provider, amount, email, name } = parsed.data;

    const milestoneSnap = await adminDb.collection('milestones').doc(milestoneId).get();
    if (!milestoneSnap.exists) {
      return NextResponse.json({ error: 'Milestone not found' }, { status: 404 });
    }

    const milestone = milestoneSnap.data() as { projectId: string };
    const projectSnap = await adminDb.collection('projects').doc(milestone.projectId).get();
    if (!projectSnap.exists) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

    const project = projectSnap.data() as { clientId: string; freelancerId: string };
    if (project.clientId !== auth.uid && auth.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const tx_ref = `${milestoneId}-${Date.now()}`;

    let response;
    if (provider === 'flutterwave') {
      response = await flutterwave.initializeTransaction({
        tx_ref,
        amount,
        currency: 'USD',
        redirect_url: `${process.env.APP_URL}/pay/verify?provider=flutterwave`,
        customer: { email, name: name || 'Paylob User' },
        meta: { milestoneId },
      });
    } else {
      response = await paystack.initializeTransaction({
        email,
        amount: Math.round(amount * 100),
        callback_url: `${process.env.APP_URL}/pay/verify?provider=paystack`,
        reference: tx_ref,
        metadata: { milestoneId },
      });
    }

    return NextResponse.json({ status: 'success', data: response });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "UNKNOWN";
    if (errorMessage === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (errorMessage === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    return NextResponse.json({ error: 'Payment initialization failed' }, { status: 500 });
  }
}
