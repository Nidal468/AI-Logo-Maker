'use client';

import React, { useEffect, useState } from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';
import { db, storage } from '@/firebase/config';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';

interface Video {
  id?: string;
  videoURL?: string;
  url?: string;
  generatedUrl?: string;
  prompt?: string;
  duration?: number;
  status?: string;
  error?: string;
  errorCode?: string;
  createdAt?: number;
  thumbnailURL?: string;
}

const AiGeneratorPage: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState('');
  const [duration, setDuration] = useState(5);
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [taskInfo, setTaskInfo] = useState<{ taskId: string; docId: string } | null>(null);
  const [credits, setCredits] = useState(25);
  const creditsPerSecond = 5;

  const fetchVideos = async () => {
    try {
      const res = await fetch('/api/videos');
      const data = await res.json();
      setVideos(data);
    } catch (err) {
      console.error('❌ Error fetching videos:', err);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  useEffect(() => {
    let interval: any;
    if (taskInfo?.taskId && taskInfo?.docId) {
      interval = setInterval(async () => {
        try {
          const res = await fetch('/api/check-task', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(taskInfo),
          });

          const data = await res.json();

          if (data.status === 'SUCCEEDED') {
            clearInterval(interval);
            toast.success('🎉 AI Video Ready!');
            setTaskInfo(null);

            const outputUrl = data.output?.[0] || data.videoUrl || null;
            if (!outputUrl) return;

            await updateDoc(doc(db, 'videos', taskInfo.docId), {
              generatedUrl: outputUrl,
              thumbnailURL: data.output?.thumbnail || '/thumbnail-placeholder.png',
              status: 'SUCCEEDED',
              completedAt: Date.now(),
            });

            fetchVideos();
          }

          if (data.status === 'FAILED') {
            clearInterval(interval);
            toast.error(`❌ Failed: ${data.error || 'Unknown error'}`);
            setTaskInfo(null);
            await updateDoc(doc(db, 'videos', taskInfo.docId), {
              status: 'FAILED',
              error: data.error || 'Unknown error',
              errorCode: data.errorCode || '',
              completedAt: Date.now(),
            });
            fetchVideos();
          }
        } catch (err) {
          console.error('❌ Error polling task:', err);
          clearInterval(interval);
          setTaskInfo(null);
        }
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [taskInfo]);

  const handleUpload = async () => {
    if (!videoFile || !prompt || !duration) {
      toast.error('Required fields missing');
      return;
    }
    setIsUploading(true);

    try {
      const filename = `${uuidv4()}-${videoFile.name}`;
      const storageRef = ref(storage, `uploads/${filename}`);
      const uploadTask = uploadBytesResumable(storageRef, videoFile);

      uploadTask.on(
        'state_changed',
        null,
        (err) => {
          console.error(err);
          toast.error('❌ Upload failed');
          setIsUploading(false);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          const res = await fetch('/api/save-video', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              videoURL: downloadURL,
              prompt,
              duration,
              status: 'SUCCEEDED',
              createdAt: Date.now(),
            }),
          });

          const data = await res.json();
          if (!res.ok) throw new Error(data?.error || 'Failed to save video');

          setPrompt('');
          setVideoFile(null);
          setIsUploading(false);
          fetchVideos();
          toast.success('✅ Video uploaded!');
        }
      );
    } catch (err: any) {
      toast.error(err.message);
      setIsUploading(false);
    }
  };

  const handleGenerate = async () => {
    if (!prompt || !duration) {
      toast.error('Prompt and duration required');
      return;
    }

    const requiredCredits = duration * creditsPerSecond;
    if (credits < requiredCredits) {
      toast.error('❌ Not enough credits!');
      return;
    }

    setIsGenerating(true);

    try {
      const res = await fetch('/api/runway-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, duration }),
      });

      const text = await res.text();
      const data = JSON.parse(text);

      if (!res.ok) throw new Error(data?.error || 'Runway API failed');

      setCredits((prev) => prev - requiredCredits);
      setTaskInfo({ taskId: data.taskId, docId: data.docId });
      toast.success('✅ Task started!');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const formatDate = (createdAt: any) => {
    if (!createdAt) return 'N/A';
    if (createdAt.seconds) return new Date(createdAt.seconds * 1000).toLocaleString();
    if (typeof createdAt === 'number') return new Date(createdAt).toLocaleString();
    return 'Invalid Date';
  };

  return (
    <div className="bg-gray-100 min-h-screen py-10 px-4">
      <div className="max-w-5xl mx-auto space-y-10">
        <h1 className="text-3xl md:text-4xl font-extrabold text-center text-gray-800">
          🎥 AI Video Generator
        </h1>

        {/* Upload / Generate Section */}
        <div className="bg-white p-6 rounded-2xl shadow-md border space-y-4">
          <input
            type="file"
            accept="video/*"
            onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
            className="w-full"
          />

          <input
            type="text"
            placeholder="Enter prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isUploading || isGenerating}
            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring focus:ring-blue-300"
          />

          <div className="flex flex-wrap justify-between items-center gap-4">
            <label className="flex items-center gap-2 text-gray-700">
              Duration:
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="p-2 border border-gray-300 rounded"
                disabled={isUploading || isGenerating}
              >
                <option value={5}>5s</option>
                <option value={10}>10s</option>
              </select>
            </label>

            <span className="text-sm text-gray-600">
              🎯 Credits per video: <b>{duration * creditsPerSecond}</b> | 💰 Remaining: <b>{credits}</b>
            </span>
          </div>

          <div className="flex flex-wrap gap-4">
            <button
              onClick={handleUpload}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 disabled:opacity-50"
              disabled={isUploading || isGenerating || !videoFile || !prompt}
            >
              {isUploading ? 'Uploading...' : 'Upload Video'}
            </button>

            <button
              onClick={handleGenerate}
              className="flex-1 bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 disabled:opacity-50"
              disabled={isUploading || isGenerating || !prompt}
            >
              {isGenerating ? '⏳ Generating...' : 'Generate AI Video'}
            </button>
          </div>

          {isGenerating && (
            <div className="text-center text-blue-600 font-medium mt-2">
              Generating your video... Please wait ⏳
            </div>
          )}
        </div>

        {/* Videos Section */}
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            🎬 Generated Videos
          </h2>

          {videos.length === 0 ? (
            <p className="text-gray-500">No videos yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((v, idx) => (
                <div
                  key={v.id || idx}
                  className="bg-white rounded-2xl p-4 shadow border border-gray-200 space-y-3"
                >
                  <video
                    src={v.videoURL || v.url || v.generatedUrl}
                    controls
                    poster={v.thumbnailURL || '/thumbnail-placeholder.png'}
                    className="w-full rounded-lg"
                  />
                  <p className="text-sm text-gray-800">
                    <b>📝 Prompt:</b> {v.prompt}
                  </p>
                  <p className="text-sm text-gray-800">
                    <b>⏱️ Duration:</b> {v.duration}s
                  </p>
                  <p className="text-sm text-gray-800">
                    <b>📅 Created:</b> {formatDate(v.createdAt)}
                  </p>
                  {v.status === 'FAILED' && (
                    <p className="text-sm text-red-600">
                      ❌ Error: {v.error}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AiGeneratorPage;
