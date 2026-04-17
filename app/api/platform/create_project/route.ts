import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { adminDb } from '@/lib/firebase-admin';
import { requireAuth } from '@/lib/server-auth';

const createProjectSchema = z.object({
  projectData: z.object({
    title: z.string().min(3).max(150),
    description: z.string().min(10).max(5000),
    freelancerId: z.string().min(1),
    budget: z.number().positive().optional(),
  }).passthrough(),
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const { projectData } = createProjectSchema.parse(await req.json());

    const userDoc = await adminDb.collection('users').doc(user.uid).get();
    const userRole = userDoc.data()?.role;

    if (userRole !== 'client') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const docRef = await adminDb.collection('projects').add({
      ...projectData,
      clientId: user.uid,
      participantIds: [user.uid, projectData.freelancerId],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, projectId: docRef.id });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request payload', details: error.flatten() }, { status: 400 });
    }

    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.error('Create project route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
