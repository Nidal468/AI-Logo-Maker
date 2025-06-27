'use client';

import { useState, Fragment, useEffect, ChangeEvent } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  FiImage, FiDownload, FiEdit2, FiAlertCircle,
  FiLoader, FiFacebook, FiInstagram, FiLinkedin,
  FiYoutube, FiGlobe, FiCheckCircle, FiLock, FiCoffee,
  FiFileText, FiPrinter, FiShoppingBag, FiTrello, FiTwitter,
  FiSliders, FiPlus, FiHeart, FiCopy, FiShare2, FiArrowRight,
  FiArrowLeft, FiCheck, FiZap, FiStar, FiSettings,
  FiVideo
} from 'react-icons/fi';
import { Dialog, Transition, Tab, Disclosure } from '@headlessui/react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/firebase/config';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { storage } from '@/firebase/config';
import { v4 as uuidv4 } from 'uuid';
import { IconType } from 'react-icons/lib';
import toast from 'react-hot-toast';

type Asset = 'logo' | 'video' | 'fb-cover' | 'insta-post' | 'linkedin-banner' | 'youtube-thumb' | 'twitter-header' | 'flyer' | 'brochure' | 'poster' | 'mug' | 'tshirt' | 'packaging' | 'banner-ad' | 'favicon';

export type AssetCategoryKey = 'social' | 'marketing' | 'product' | 'web';

export type AssetTypeKey =
  | 'logo'
  | 'video'
  | 'fb-cover'
  | 'insta-post'
  | 'insta-story'
  | 'linkedin-banner'
  | 'youtube-thumb'
  | 'twitter-header'
  | 'flyer'
  | 'brochure'
  | 'business-card'
  | 'poster'
  | 'mug'
  | 'tshirt'
  | 'packaging'
  | 'banner-ad'
  | 'web-banner'
  | 'favicon';

export type AssetType = {
  name: string;
  icon: IconType;
  aspectRatio: string;
  free: boolean;
};

export type AssetCategory = {
  name: string;
  types: Partial<Record<AssetTypeKey, AssetType>>;
};

export type AssetCategories = Record<AssetCategoryKey, AssetCategory>;
const styles = [
  { id: 'realistic_image', name: 'Realistic' },
  { id: 'digital_illustration', name: 'Digital Illustration' },
  { id: 'vector_illustration', name: 'Vector Illustration' },
  { id: 'modern', name: 'Modern' },
  { id: 'minimalist', name: 'Minimalist' },
  { id: 'abstract', name: 'Abstract' },
  { id: 'vintage', name: 'Vintage' },
  { id: 'corporate', name: 'Corporate' },
  { id: 'playful', name: 'Playful' },
];

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

const colorSchemes = [
  { id: 'auto', name: 'Auto (Based on Prompt)' },
  { id: 'monochrome', name: 'Monochrome' },
  { id: 'blue', name: 'Blue Tones' },
  { id: 'green', name: 'Green Tones' },
  { id: 'purple', name: 'Purple Tones' },
  { id: 'warm', name: 'Warm Colors' },
  { id: 'cool', name: 'Cool Colors' },
];

const assetCategories: AssetCategories = {
  social: {
    name: 'Social Media',
    types: {
      'logo': { name: 'Logo', icon: FiGlobe, aspectRatio: '1/1', free: true },
      'video': { name: 'Video', icon: FiVideo, aspectRatio: '1/1', free: true },
      'fb-cover': { name: 'Facebook Cover', icon: FiFacebook, aspectRatio: '16/9', free: false },
      'insta-post': { name: 'Instagram Post', icon: FiInstagram, aspectRatio: '1/1', free: true },
      'insta-story': { name: 'Instagram Story', icon: FiInstagram, aspectRatio: '9/16', free: false },
      'linkedin-banner': { name: 'LinkedIn Banner', icon: FiLinkedin, aspectRatio: '4/1', free: false },
      'youtube-thumb': { name: 'YouTube Thumbnail', icon: FiYoutube, aspectRatio: '16/9', free: false },
      'twitter-header': { name: 'Twitter Header', icon: FiTwitter, aspectRatio: '3/1', free: false },
    },
  },
  marketing: {
    name: 'Marketing Materials',
    types: {
      'flyer': { name: 'Flyer Design', icon: FiFileText, aspectRatio: '8.5/11', free: false },
      'brochure': { name: 'Brochure', icon: FiTrello, aspectRatio: '11/8.5', free: false },
      'business-card': { name: 'Business Card', icon: FiCoffee, aspectRatio: '3.5/2', free: false },
      'poster': { name: 'Poster', icon: FiFileText, aspectRatio: '24/36', free: false },
    },
  },
  product: {
    name: 'Product Design',
    types: {
      'mug': { name: 'Mug Design', icon: FiCoffee, aspectRatio: '11/8', free: false },
      'tshirt': { name: 'T-Shirt Design', icon: FiShoppingBag, aspectRatio: '1/1.2', free: false },
      'packaging': { name: 'Packaging', icon: FiPrinter, aspectRatio: '1/1', free: false },
    },
  },
  web: {
    name: 'Web Elements',
    types: {
      'banner-ad': { name: 'Banner Ad', icon: FiImage, aspectRatio: '4/1', free: false },
      'web-banner': { name: 'Website Banner', icon: FiImage, aspectRatio: '3/1', free: false },
      'favicon': { name: 'Favicon', icon: FiImage, aspectRatio: '1/1', free: false },
    },
  },
};

// Flux API size mapping according to API documentation
const getFluxImageSize = (assetType: Asset) => {
  const defaultSize = { width: 1024, height: 768 };

  const aspectSizes = {
    'logo': { width: 1024, height: 1024 },
    'video': { width: 1024, height: 1024 },
    'insta-post': { width: 1024, height: 1024 },
    'packaging': { width: 1024, height: 1024 },
    'favicon': { width: 1024, height: 1024 },
    'fb-cover': { width: 1024, height: 576 },
    'youtube-thumb': { width: 1024, height: 576 },
    'web-banner': { width: 1024, height: 576 },
    'linkedin-banner': { width: 1024, height: 256 },
    'twitter-header': { width: 1024, height: 341 },
    'banner-ad': { width: 1024, height: 256 },
    'insta-story': { width: 576, height: 1024 },
    'flyer': { width: 768, height: 1024 },
    'brochure': { width: 1024, height: 768 },
    'business-card': { width: 1024, height: 576 },
    'poster': { width: 576, height: 1024 },
    'mug': { width: 1024, height: 768 },
    'tshirt': { width: 768, height: 1024 },
  };

  return aspectSizes[assetType] || defaultSize;
};

async function generateAssetAPI({ prompt, assetType }: { prompt: string, assetType: Asset }) {
  const imageSize = getFluxImageSize(assetType);

  const res = await fetch('/api/recraft-generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt,
      assetType,
      imageSize
    }),
  });

  if (!res.ok) {
    const { error } = await res.json().catch(() => ({}));
    throw new Error(error || `Request failed ${res.status}`);
  }

  const data = await res.json();
  return data.images || [];
}

function PaidFeatureModal({ isOpen, onClose, assetUrl, isPremium, remainingCredits }: { isOpen: boolean, onClose: () => void, assetUrl: string | null, isPremium: boolean, remainingCredits: number }) {
  const router = useRouter();
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden">
                {isPremium ? (
                  <>
                    <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-6 text-white">
                      <Dialog.Title className="flex items-center text-xl font-semibold">
                        <FiDownload className="mr-3 h-6 w-6" /> Download Asset
                      </Dialog.Title>
                      <p className="mt-2 text-primary-100">Premium access enables high-resolution downloads</p>
                    </div>
                    <div className="p-6">
                      <div className="mb-4 flex items-center justify-between rounded-lg bg-primary-50 px-4 py-3">
                        <span className="text-sm font-medium text-primary-700">Available Credits</span>
                        <span className="font-bold text-primary-700">{remainingCredits}</span>
                      </div>
                      {assetUrl && (
                        <div className="my-6 flex justify-center overflow-hidden rounded-lg border bg-gray-50 p-3 shadow-inner">
                          <Image src={assetUrl} alt="Generated asset preview" width={250} height={250} className="object-contain" />
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-3">
                        <button className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition" onClick={onClose}>Cancel</button>
                        <button className="rounded-lg bg-primary-600 px-4 py-3 text-sm font-medium text-white shadow-sm hover:bg-primary-700 transition" onClick={() => { assetUrl && window.open(assetUrl, '_blank'); onClose(); }}>Download Now</button>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-6 text-white">
                      <Dialog.Title className="flex items-center text-xl font-semibold">
                        <FiLock className="mr-3 h-6 w-6" /> Premium Feature
                      </Dialog.Title>
                      <p className="mt-2 text-primary-100">Unlock high-quality assets with a premium plan</p>
                    </div>
                    <div className="p-6">
                      <div className="mb-4 rounded-lg bg-amber-50 px-4 py-3 text-amber-800">
                        <p className="text-sm">High-resolution downloads and additional asset types require a premium plan.</p>
                      </div>
                      {assetUrl && (
                        <div className="my-6 flex justify-center overflow-hidden rounded-lg border bg-gray-50 p-3 shadow-inner">
                          <div className="relative">
                            <Image src={assetUrl} alt="Blurred asset preview" width={250} height={250} className="object-contain blur-sm opacity-60" />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="rounded-full bg-white/80 p-4 shadow-lg">
                                <FiLock className="h-10 w-10 text-primary-600" />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-3">
                        <button className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition" onClick={onClose}>Cancel</button>
                        <button className="rounded-lg bg-primary-600 px-4 py-3 text-sm font-medium text-white shadow-sm hover:bg-primary-700 transition" onClick={() => { router.push('/pricing'); onClose(); }}>View Plans</button>
                      </div>
                    </div>
                  </>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

// Step components
function StepIndicator({ currentStep, totalSteps }: { currentStep: number, totalSteps: number }) {
  return (
    <div className="flex items-center justify-center mb-8">
      {Array.from({ length: totalSteps }, (_, i) => (
        <div key={i} className="flex items-center">
          <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${i < currentStep
            ? 'bg-green-500 border-green-500 text-white'
            : i === currentStep
              ? 'bg-primary-600 border-primary-600 text-gray-400'
              : 'bg-gray-100 border-gray-300 text-gray-400'
            }`}>
            {i < currentStep ? <FiCheck className="w-5 h-5" /> : i + 1}
          </div>
          {i < totalSteps - 1 && (
            <div className={`w-12 h-0.5 mx-2 ${i < currentStep ? 'bg-green-500' : 'bg-gray-300'
              }`} />
          )}
        </div>
      ))}
    </div>
  );
}

function Step1AssetSelection(
  { assetCategory,
    setAssetCategory,
    assetType,
    setAssetType,
    userSubscription,
    onNext
  }: {
    assetCategory: AssetCategoryKey,
    setAssetCategory: (key: keyof typeof assetCategories) => void,
    assetType: Asset,
    setAssetType: (v: Asset) => void,
    userSubscription: {
      isPremium: boolean;
      remainingCredits: number;
      plan: string;
    },
    onNext: () => void
  }) {
  const categoryKeys = Object.keys(assetCategories) as (keyof typeof assetCategories)[];
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Asset Type</h2>
        <p className="text-lg text-gray-600">What would you like to create today?</p>
      </div>

      <div className="mb-8">
        <Tab.Group onChange={(index) => setAssetCategory(categoryKeys[index])}>
          <Tab.List className="flex space-x-1 rounded-xl bg-gray-100 p-1 max-w-2xl mx-auto">
            {Object.entries(assetCategories).map(([key, cat]) => (
              <Tab
                key={key}
                className={({ selected }) =>
                  `w-full rounded-lg py-3 text-sm font-medium leading-5 transition-all ${selected
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                  }`
                }
              >
                {cat.name}
              </Tab>
            ))}
          </Tab.List>
        </Tab.Group>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        {assetCategory && Object.entries(assetCategories[assetCategory]?.types || {}).map(([key, info]) => (
          <button
            key={key}
            onClick={() => setAssetType(key as Asset)}
            className={`group relative p-6 rounded-xl border-2 transition-all hover:shadow-lg ${assetType === key
              ? 'border-primary-600 bg-primary-50 shadow-md'
              : 'border-gray-200 bg-white hover:border-primary-200'
              }`}
          >
            <div className={`w-12 h-12 mx-auto mb-4 rounded-lg flex items-center justify-center ${assetType === key
              ? 'bg-primary-100 text-primary-600'
              : 'bg-gray-100 text-gray-500 group-hover:bg-primary-100 group-hover:text-primary-600'
              }`}>
              <info.icon className="w-6 h-6" />
            </div>
            <h3 className="font-medium text-gray-900 mb-1">{info.name}</h3>
            <p className="text-xs text-gray-500">{info.aspectRatio}</p>

            {!info.free && !userSubscription.isPremium && (
              <div className="absolute -top-2 -right-2 bg-amber-100 text-amber-600 rounded-full p-1">
                <FiLock className="w-4 h-4" />
              </div>
            )}
            {info.free && (
              <div className="absolute -top-2 -right-2 bg-green-100 text-green-600 rounded-full p-1">
                <FiStar className="w-4 h-4" />
              </div>
            )}
          </button>
        ))}
      </div>

      <div className="flex justify-center">
        <button
          onClick={onNext}
          disabled={!assetType}
          className="flex items-center gap-2 bg-primary-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          Continue <FiArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

function Step2PromptInput({
  prompt,
  setPrompt,
  style,
  setStyle,
  colorScheme,
  setColorScheme,
  onNext,
  onBack,
  error,
  assetType }: {
    prompt: string,
    setPrompt: (v: string) => void,
    style: string,
    setStyle: (v: string) => void,
    colorScheme: string,
    setColorScheme: (v: string) => void,
    onNext: () => void,
    onBack: () => void,
    error: string,
    assetType: Asset
  }) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [videos, setVideos] = useState<Video[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<{ videoURL: string } | null>(null)
  const [duration, setDuration] = useState(5);
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [taskInfo, setTaskInfo] = useState<{ taskId: string; docId: string } | null>(null);
  const [credits, setCredits] = useState(25);
  const creditsPerSecond = 5;
  const recentPrompts = [
    'Modern logo for a tech startup with blue accent',
    'Clean and professional business card design',
    'Instagram post for a coffee shop promotion',
  ];

  const fetchVideos = async () => {
    try {
      const res = await fetch('/api/videos', {
        method: "GET",
        cache: 'no-store'
      });
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
        body: JSON.stringify({ prompt, duration, videoUrl: selectedVideo?.videoURL }),
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
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Describe Your Vision</h2>
        <p className="text-lg text-gray-600">Tell us what you want to create in detail</p>
      </div>

      {assetType !== 'video' && <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Describe your asset in detail:
        </label>
        <textarea
          rows={4}
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          className={`w-full rounded-lg border p-4 text-lg transition focus:border-primary-300 focus:ring-4 focus:ring-primary-100 ${error ? 'border-red-300 ring-red-100' : 'border-gray-300'
            }`}
          placeholder="E.g., A modern logo for a tech startup called 'Quantum Solutions' with blue and purple colors, clean typography, and a futuristic feel..."
        />
        {error && (
          <p className="mt-2 flex items-center text-sm text-red-600">
            <FiAlertCircle className="mr-1" /> {error}
          </p>
        )}
      </div>}
      {assetType === 'video' && (
        <div className='space-y-3 mb-6'>
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
        </div>
      )}
      {assetType === 'video' && (
        <div className='space-y-3 mb-6'>
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
                  className={`bg-white rounded-2xl p-4 shadow border border-gray-200 space-y-3 ${selectedVideo?.videoURL === v.videoURL ? "border-sky-500" : ""}`}
                  onClick={() => setSelectedVideo({ videoURL: v.videoURL as string })}
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
      )}
      <div className="mb-6">
        <p className="text-sm font-medium text-gray-700 mb-3">Or try these examples:</p>
        <div className="grid gap-2">
          {recentPrompts.map((rp, i) => (
            <button
              key={i}
              onClick={() => setPrompt(rp)}
              className="text-left p-3 rounded-lg border border-gray-200 bg-gray-50 hover:bg-primary-50 hover:border-primary-200 transition-all"
            >
              <span className="text-sm text-gray-700">{rp}</span>
            </button>
          ))}
        </div>
      </div>
      {assetType !== 'video' && (
        <div className="mb-8">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-primary-600 font-medium hover:text-primary-700 transition"
          >
            <FiSettings className="w-5 h-5" />
            Advanced Options
            <FiPlus className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-45' : ''}`} />
          </button>

          {showAdvanced && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Visual Style:</label>
                  <select
                    value={style}
                    onChange={e => setStyle(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 p-2 focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                  >
                    {styles.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Color Scheme:</label>
                  <select
                    value={colorScheme}
                    onChange={e => setColorScheme(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 p-2 focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                  >
                    {colorSchemes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 px-6 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition-all"
        >
          <FiArrowLeft className="w-5 h-5" /> Back
        </button>
        {assetType !== 'video' && <button
          onClick={onNext}
          disabled={!prompt.trim()}
          className="flex items-center gap-2 bg-primary-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          Generate Asset <FiZap className="w-5 h-5" />
        </button>}
      </div>
    </div>
  );
}

function Step3Generation({ loading, onBack }: { loading: boolean, onBack: () => void }) {
  return (
    <div className="max-w-2xl mx-auto text-center">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Creating Your Asset</h2>
        <p className="text-lg text-gray-600">Our AI is working its magic...</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-12 mb-8">
        <div className="flex flex-col items-center">
          <div className="relative mb-6">
            <div className="w-20 h-20 border-4 border-primary-200 rounded-full animate-spin border-t-primary-600"></div>
            <FiZap className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-primary-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Generating your asset...</h3>
          <p className="text-gray-600">This usually takes 30-60 seconds</p>
        </div>
      </div>

      <div className="text-sm text-gray-500 space-y-2">
        <p>✨ AI is analyzing your prompt</p>
        <p>🎨 Creating visual elements</p>
        <p>⚡ Optimizing for quality</p>
      </div>

      <button
        onClick={onBack}
        className="mt-8 flex items-center gap-2 text-gray-600 px-6 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition-all mx-auto"
      >
        <FiArrowLeft className="w-5 h-5" /> Back to Edit
      </button>
    </div>
  );
}

function Step4Results({
  images,
  assetType,
  assetCategory,
  onDownload,
  onEdit,
  onRegenerate,
  userSubscription }: {
    images: any[],
    assetType: Asset,
    assetCategory: AssetCategoryKey,
    onDownload: (url: string) => void,
    onEdit: (url: string) => void,
    onRegenerate: () => void,
    userSubscription: {
      isPremium: boolean;
      remainingCredits: number;
      plan: string;
    }
  }) {
  const [currentPreview, setCurrentPreview] = useState(0);

  const getAspectRatio = (category: AssetCategoryKey, type: AssetTypeKey) => {
    try {
      return assetCategories[category]?.types[type]?.aspectRatio || '1/1';
    } catch (err) {
      return '1/1';
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Your Assets Are Ready!</h2>
        <p className="text-lg text-gray-600">Generated {images.length} high-quality assets</p>
      </div>

      {images.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
          <div className="text-center mb-6">
            <div
              className="relative mx-auto max-w-md bg-gray-50 rounded-lg overflow-hidden shadow-inner"
              style={{ aspectRatio: getAspectRatio(assetCategory, assetType) }}
            >
              <Image
                src={images[currentPreview]}
                alt="Generated asset"
                fill
                className="object-contain"
              />
            </div>

            {images.length > 1 && (
              <div className="flex justify-center mt-4 space-x-2">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPreview(i)}
                    className={`w-3 h-3 rounded-full transition ${i === currentPreview ? 'bg-primary-600' : 'bg-gray-300'
                      }`}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-center gap-4">
            <button
              onClick={() => onDownload(images[currentPreview])}
              className="flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition"
            >
              <FiDownload className="w-5 h-5" /> Download
            </button>
            <button
              onClick={() => onEdit(images[currentPreview])}
              className="flex items-center gap-2 bg-white text-gray-700 px-6 py-3 rounded-lg border border-gray-300 font-medium hover:bg-gray-50 transition"
            >
              <FiEdit2 className="w-5 h-5" /> Edit
            </button>
          </div>
        </div>
      )}

      {images.length > 1 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">All Generated Assets</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((url, i) => (
              <div
                key={i}
                className="group relative bg-white rounded-lg border overflow-hidden shadow-sm hover:shadow-md transition"
              >
                <div
                  className="relative bg-gray-50"
                  style={{ aspectRatio: getAspectRatio(assetCategory, assetType) }}
                >
                  <Image
                    src={url}
                    alt={`Asset ${i + 1}`}
                    fill
                    className="object-contain"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={() => onDownload(url)}
                      className="p-2 bg-white rounded-full shadow-lg hover:scale-105 transition"
                    >
                      <FiDownload className="w-4 h-4 text-primary-600" />
                    </button>
                    <button
                      onClick={() => onEdit(url)}
                      className="p-2 bg-white rounded-full shadow-lg hover:scale-105 transition"
                    >
                      <FiEdit2 className="w-4 h-4 text-primary-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-center gap-4">
        <button
          onClick={onRegenerate}
          className="flex items-center gap-2 bg-white text-gray-700 px-6 py-3 rounded-lg border border-gray-300 font-medium hover:bg-gray-50 transition"
        >
          <FiZap className="w-5 h-5" /> Generate New
        </button>
      </div>
    </div>
  );
}

export default function AiAssetGeneratorPage() {
  const { user } = useAuth();
  const router = useRouter();

  // Step management
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = 4;

  // Form data
  const [prompt, setPrompt] = useState('');
  const [assetType, setAssetType] = useState<Asset>('logo');
  const [assetCategory, setAssetCategory] = useState<AssetCategoryKey>('social');
  const [style, setStyle] = useState('modern');
  const [colorScheme, setColorScheme] = useState('auto');

  // State management
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPaid, setShowPaid] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [userSubscription, setUserSubscription] = useState({
    isPremium: false,
    remainingCredits: 0,
    plan: 'free'
  });

  // Load user subscription data
  useEffect(() => {
    if (!user) return;
    const fetchUserSubscription = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data().subscription || {};
          setUserSubscription({
            isPremium: data.status === 'active',
            remainingCredits: data.creditsRemaining || 0,
            plan: data.plan || 'free',
          });
        }
      } catch { }
    };
    fetchUserSubscription();
  }, [user]);

  // Load saved images from localStorage on component mount
  useEffect(() => {
    const loadSavedImages = () => {
      try {
        const savedData = localStorage.getItem('generatedAssets');
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          if (parsedData.images && parsedData.images.length > 0) {
            setImages(parsedData.images);
            setCurrentStep(3); // Go to results step
          }
          if (parsedData.assetType) {
            // Find the category that contains this asset type
            for (const [categoryKey, categoryData] of Object.entries(assetCategories)) {
              if (Object.keys(categoryData.types).includes(parsedData.assetType)) {
                setAssetCategory(categoryKey as AssetCategoryKey);
                setAssetType(parsedData.assetType);
                break;
              }
            }
          }
        }
      } catch (err) {
        console.error('Error loading saved assets:', err);
      }
    };

    loadSavedImages();
  }, []);

  // Save generated images to localStorage when they change
  useEffect(() => {
    if (images.length > 0) {
      localStorage.setItem('generatedAssets', JSON.stringify({
        images,
        assetType
      }));
    }
  }, [images, assetType]);

  // Update asset type when category changes
  useEffect(() => {
    if (!assetCategory) return;
    const categoryTypes = Object.keys(assetCategories[assetCategory]?.types || {});
    if (categoryTypes.length > 0) {
      setAssetType(categoryTypes[0] as Asset);
    }
  }, [assetCategory]);

  const handleGenerate = async () => {
    if (!user) {
      router.push('/login?redirect=/generate-assets');
      return;
    }

    if (!prompt.trim()) {
      setError('Please enter a prompt.');
      return;
    }

    // Validate that we have a valid asset type
    if (!assetCategory || !assetType || !assetCategories[assetCategory]?.types[assetType]) {
      setError('Invalid asset type selected.');
      return;
    }

    const selected = assetCategories[assetCategory]?.types[assetType];
    if (!selected.free && !userSubscription.isPremium) {
      setError('This asset type requires a premium subscription.');
      return;
    }

    if (userSubscription.isPremium && userSubscription.remainingCredits <= 0) {
      setError('You have used all your generation credits. Please upgrade your plan.');
      return;
    }

    setCurrentStep(2); // Move to generation step
    setLoading(true);
    setError('');

    try {
      const enhanced = `${prompt.trim()}. Style: ${style}. Color scheme: ${colorScheme}.`;
      const result = await generateAssetAPI({ prompt: enhanced, assetType });
      setImages(result);
      setCurrentStep(3); // Move to results step

      if (userSubscription.isPremium) {
        setUserSubscription(prev => ({
          ...prev,
          remainingCredits: prev.remainingCredits - result.length
        }));
      }
    } catch (err: any) {
      setError(err.message);
      setCurrentStep(1); // Go back to prompt step
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (url: string) => {
    setPreviewUrl(url);
    setShowPaid(true);
  };

  const handleEdit = (url: string) => {
    router.push(`/edit-asset?asset=${encodeURIComponent(url)}&type=${assetType}`);
  };

  const handleRegenerate = () => {
    setImages([]);
    setCurrentStep(1); // Go back to prompt step
    localStorage.removeItem('generatedAssets');
  };

  const nextStep = () => {
    if (currentStep === 1) {
      handleGenerate();
    } else {
      setCurrentStep(Math.min(currentStep + 1, totalSteps - 1));
    }
  };

  const prevStep = () => {
    setCurrentStep(Math.max(currentStep - 1, 0));
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-blue-50">
      <div className="container mx-auto max-w-7xl py-10 px-4">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="bg-gradient-to-r from-indigo-600 via-primary-600 to-blue-600 bg-clip-text text-5xl font-extrabold text-transparent md:text-6xl pb-1">
            AI Asset Generator
          </h1>
          <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">
            Create professional assets in 4 simple steps
          </p>
          {userSubscription.isPremium && (
            <div className="mt-4 inline-flex items-center rounded-full bg-gradient-to-r from-primary-50 to-indigo-100 px-5 py-2 text-indigo-700 shadow-sm border border-indigo-100">
              <FiCheckCircle className="mr-2 text-primary-600" />
              <span className="font-medium">{userSubscription.plan.toUpperCase()} Plan:</span>
              <span className="ml-1 font-semibold">{userSubscription.remainingCredits} credits</span>
            </div>
          )}
        </header>

        {/* Step Indicator */}
        <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />

        {/* Step Content */}
        <div className="bg-white rounded-2xl shadow-xl border border-indigo-100/50 p-8 mb-8">
          {currentStep === 0 && (
            <Step1AssetSelection
              assetCategory={assetCategory}
              setAssetCategory={setAssetCategory}
              assetType={assetType}
              setAssetType={setAssetType}
              userSubscription={userSubscription}
              onNext={nextStep}
            />
          )}

          {currentStep === 1 && (
            <Step2PromptInput
              prompt={prompt}
              setPrompt={setPrompt}
              style={style}
              setStyle={setStyle}
              colorScheme={colorScheme}
              setColorScheme={setColorScheme}
              onNext={nextStep}
              onBack={prevStep}
              error={error}
              assetType={assetType}
            />
          )}

          {currentStep === 2 && (
            <Step3Generation
              loading={loading}
              onBack={prevStep}
            />
          )}

          {currentStep === 3 && images.length > 0 && (
            <Step4Results
              images={images}
              assetType={assetType}
              assetCategory={assetCategory}
              onDownload={handleDownload}
              onEdit={handleEdit}
              onRegenerate={handleRegenerate}
              userSubscription={userSubscription}
            />
          )}
        </div>

        {/* Premium Upgrade Banner */}
        {!userSubscription.isPremium && (
          <div className="bg-gradient-to-r from-primary-600 to-indigo-600 rounded-2xl p-8 text-zinc-700 text-center shadow-xl">
            <h3 className="text-2xl font-bold mb-4">Unlock Premium Features</h3>
            <p className="text-primary-100 mb-6 max-w-2xl mx-auto">
              Get access to all asset types, unlimited downloads, and advanced editing tools
            </p>
            <button
              onClick={() => router.push('/pricing')}
              className="text-primary-600 px-8 py-3 rounded-lg font-semibold bg-gray-100 hover:bg-gray-200 transition-all hover:scale-105"
            >
              View Pricing Plans
            </button>
          </div>
        )}

        {/* Quick Tips */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <FiZap className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Lightning Fast</h3>
            <p className="text-gray-600 text-sm">Generate professional assets in under 60 seconds</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <FiCheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">High Quality</h3>
            <p className="text-gray-600 text-sm">Professional-grade assets ready for commercial use</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <FiSettings className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Fully Customizable</h3>
            <p className="text-gray-600 text-sm">Edit, modify, and perfect your assets with built-in tools</p>
          </div>
        </div>

        {/* Paid Feature Modal */}
        <PaidFeatureModal
          isOpen={showPaid}
          onClose={() => setShowPaid(false)}
          assetUrl={previewUrl}
          isPremium={userSubscription.isPremium}
          remainingCredits={userSubscription.remainingCredits}
        />
      </div>
    </div>
  );
}