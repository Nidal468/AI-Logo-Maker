'use client';

import { ChangeEvent, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { storage } from '@/firebase/config';

export default function UploadVideoPage() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [prompt, setPrompt] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleVideoChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setVideoFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!videoFile) return alert('Please select a video first.');
    if (!prompt.trim()) return alert('Please enter a prompt.');

    setUploading(true);

    const uniqueName = `videos/${uuidv4()}-${videoFile.name}`;
    const storageRef = ref(storage, uniqueName);
    const uploadTask = uploadBytesResumable(storageRef, videoFile);

    uploadTask.on(
      'state_changed',
      null,
      (error) => {
        console.error('Upload error:', error);
        setUploading(false);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then(async (url) => {
          setVideoUrl(url);
          setUploading(false);
          await saveVideoToFirestore(url); // Save to Firestore
        });
      }
    );
  };

  const saveVideoToFirestore = async (videoUrl: string) => {
    setSaving(true);
    try {
      const res = await fetch('/api/save-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoUrl, prompt }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save');

      alert('Video info saved to Firestore!');
    } catch (err) {
      console.error('Firestore save error:', err);
      alert('Error saving video info');
    }
    setSaving(false);
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Video Upload</h1>

      <input
        type="text"
        placeholder="Enter your prompt"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        className="w-full p-2 border rounded mb-4"
      />

      <input
        type="file"
        accept="video/*"
        onChange={handleVideoChange}
        className="mb-4"
      />

      <button
        onClick={handleUpload}
        disabled={uploading || saving}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {uploading ? 'Uploading...' : saving ? 'Saving...' : 'Upload Video'}
      </button>

      {videoUrl && (
        <div className="mt-6">
          <p className="mb-2 text-green-600">Upload successful! Video preview:</p>
          <video controls width="100%" className="rounded shadow">
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      )}
    </div>
  );
}
