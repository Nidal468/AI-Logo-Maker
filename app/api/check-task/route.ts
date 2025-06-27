import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/firebase/config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export async function POST(req: NextRequest) {
  try {
    const { taskId, docId } = await req.json();
    console.log("📡 Calling Runway API for task:", taskId);

    const response = await fetch(`https://api.dev.runwayml.com/v1/tasks/${taskId}`, {
      headers: {
        Authorization: `Bearer ${process.env.RUNWAY_API_KEY}`,
        'X-Runway-Version': '2024-11-06',
      },
    });

    const data = await response.json();
    console.log("🔎 Runway API response:", data);

    if (!response.ok || data.error) {
      console.error("❌ Error from Runway:", data);
      return NextResponse.json({ error: 'Failed to fetch task', details: data }, { status: 500 });
    }

    const docRef = doc(db, 'videos', docId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      console.error('❌ Document not found in Firestore:', docId);
      return NextResponse.json({ error: 'Firestore doc not found' }, { status: 404 });
    }

    const { status, output } = data;

    const updateData = {
      status,
      lastChecked: Date.now(),
      generatedUrl: '',
      thumbnailURL: '',
      error: '',
      errorCode: '',
    };

    if (status === 'SUCCEEDED' && output && output.length > 0) {
      updateData.generatedUrl = output[0];

      // Optional thumbnail if exists
      if (data.output?.thumbnail) {
        updateData.thumbnailURL = data.output.thumbnail;
      }
    }

    if (status === 'FAILED' && data.failure) {
      updateData.error = data.failure;
      updateData.errorCode = data.failureCode || '';
    }

    await updateDoc(docRef, updateData);
    console.log('✅ Firestore doc updated with status:', status);

    return NextResponse.json({
      success: true,
      status,
      videoUrl: updateData.generatedUrl || null,
      thumbnailURL: updateData.thumbnailURL || null,
    });

  } catch (err: any) {
    console.error("❌ check-task error:", err);
    return NextResponse.json({ error: 'Unknown error', details: err.message }, { status: 500 });
  }
}
