import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/firebase/config';
import { addDoc, collection, doc, updateDoc } from 'firebase/firestore';

export async function POST(req: NextRequest) {
  try {
    const {
      videoURL,
      prompt,
      duration,
      status,
      createdAt } = await req.json();

    await addDoc(collection(db, 'videos'), {
      videoURL: videoURL,
      prompt,
      duration,
      status: status,
      createdAt,
    });

    console.log('✅ Firestore doc updated with videoURL');
    return NextResponse.json({ success: true }, { status: 200 });

  } catch (err: any) {
    console.error('❌ Failed to save video URL:', err);
    return NextResponse.json({ error: 'Failed to save video URL', details: err.message }, { status: 500 });
  }
}
