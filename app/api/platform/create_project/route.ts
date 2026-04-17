import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(req: NextRequest) {
  const { projectData, userRole } = await req.json();

  if (userRole !== 'client') {
    return NextResponse.json({ error: 'Unauthorized: Client role required' }, { status: 403 });
  }

  // Implementation logic for project creation
  const docRef = await adminDb.collection('projects').add(projectData);

  return NextResponse.json({ success: true, projectId: docRef.id });
}
