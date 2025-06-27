// app/ai-generator/videos/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { collection, DocumentData, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/config';

export default function VideoList() {
  const [videos, setVideos] = useState<DocumentData[]>([]);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'videos'));
        const videoData = querySnapshot.docs.map(doc => doc.data());
        setVideos(videoData);
      } catch (error) {
        console.error('Error fetching videos:', error);
      }
    };

    fetchVideos();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Uploaded Videos</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {videos.length === 0 ? (
          <p>No videos found.</p>
        ) : (
          videos.map((video, index) => (
            <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden">
              <video src={video.url} controls className="w-full h-auto" />
              <div className="p-4">
                <p className="text-sm text-gray-600">Prompt: {video.prompt}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
