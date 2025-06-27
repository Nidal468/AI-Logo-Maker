import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/firebase/config';
import { collection, addDoc } from 'firebase/firestore';

export async function POST(req: NextRequest) {
  try {
    const { prompt, duration, videoUrl } = await req.json();

    // 🟢 Runway API Call
    const response = await fetch('https://api.dev.runwayml.com/v1/image_to_video', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.RUNWAY_API_KEY}`,
        'X-Runway-Version': '2024-11-06' // ✅ Required version
      },
      body: JSON.stringify({
        model: 'gen4_turbo',
        promptText: prompt,
        duration,
        video: videoUrl,
        ratio: '1280:720',
        seed: 42,
        promptImage: 'https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png'
      })
    });

    const raw = await response.text();
    let json;

    try {
      json = JSON.parse(raw);
    } catch (err: any) {
      console.error('❌ Invalid JSON from Runway:', raw, err);
      return NextResponse.json(
        { error: 'Invalid JSON returned from Runway', raw, details: err.message },
        { status: 500 }
      );
    }

    if (!response.ok || !json.id) {
      console.error('❌ Runway API error:', json);
      return NextResponse.json(
        { error: 'Runway generation failed', details: json },
        { status: 500 }
      );
    }

    // 🟢 Save to Firestore
    const docRef = await addDoc(collection(db, 'videos'), {
      prompt,
      duration,
      taskId: json.id,
      status: 'pending',
      createdAt: Date.now()
    });

    console.log('✅ Runway task saved to Firestore:', docRef.id);

    return NextResponse.json({
      taskId: json.id,
      docId: docRef.id
    }, { status: 200 });

  } catch (err: any) {
    console.error('❌ Server Error:', err);
    return NextResponse.json({ error: err.message, stack: err.stack }, { status: 500 });
  }
}
