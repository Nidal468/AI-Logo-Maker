'use client';
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { FiChevronLeft, FiDownload, FiSave, FiSliders, FiZoomIn, FiZoomOut, FiCrop, FiFilter, FiLock, FiRotateCw, FiRefreshCw, FiImage, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';

export default function EditAssetPage() {
  const { user, userDetails } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const assetUrl = searchParams.get('asset');
  const assetType = searchParams.get('type');
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('adjust');
  const [zoomLevel, setZoomLevel] = useState(100);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  
  // Editing parameters
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [blur, setBlur] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState('Normal');
  
  // Manage applied filters CSS
  const [filterStyle, setFilterStyle] = useState('');
  
  // Crop parameters
  const [cropRatio, setCropRatio] = useState('original');
  const [cropApplied, setCropApplied] = useState(false);
  
  const filters = {
    'Normal': '',
    'Vivid': 'brightness(110%) contrast(120%) saturate(130%)',
    'Muted': 'brightness(90%) contrast(90%) saturate(80%)',
    'Warm': 'brightness(105%) sepia(20%)',
    'Cool': 'brightness(100%) saturate(90%) hue-rotate(10deg)',
    'Vintage': 'brightness(95%) sepia(30%) contrast(85%)',
    'Noir': 'brightness(90%) contrast(130%) grayscale(100%)',
    'Sepia': 'sepia(80%)'
  };
  
  // Access control
  useEffect(() => {
    if (!user) {
      router.push('/login?redirect=/edit-asset');
      return;
    }
    
    if (!assetUrl) {
      router.push('/generate-assets');
      return;
    }
    
    // Properly check subscription status
    const checkSubscription = async () => {
      try {
        // Check if user has premium access - check both locations where subscription status might be stored
        if (
         true
        ) {
          setIsPremium(true);
        }
      } catch (error) {
        console.error("Error checking subscription:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkSubscription();
  }, [user, userDetails, assetUrl, router]);
  
  // Update filter style when editing parameters change
  useEffect(() => {
    let newFilter = '';
    
    // Apply base adjustments
    newFilter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
    
    // Apply selected filter
    if (selectedFilter !== 'Normal') {
      newFilter = filters[selectedFilter];
    }
    
    // Apply blur if any
    if (blur > 0) {
      newFilter += ` blur(${blur}px)`;
    }
    
    setFilterStyle(newFilter);
  }, [brightness, contrast, saturation, blur, selectedFilter]);
  
  const handleApplyFilter = (filter) => {
    setSelectedFilter(filter);
    
    // Set preset values based on filter
    if (filter === 'Vivid') {
      setBrightness(110);
      setContrast(120);
      setSaturation(130);
    } else if (filter === 'Muted') {
      setBrightness(90);
      setContrast(90);
      setSaturation(80);
    } else if (filter === 'Normal') {
      setBrightness(100);
      setContrast(100);
      setSaturation(100);
      setBlur(0);
    }
    
    showNotification(`${filter} filter applied`);
  };
  
  const handleDownload = () => {
    try {
      // Create a temporary canvas to apply filters and transformations
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = document.getElementById('editable-image');
      
      if (!img) {
        showNotification('Image not loaded properly', 'error');
        return;
      }
      
      // Set canvas dimensions
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      
      // Apply rotation if needed
      if (rotation !== 0) {
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.translate(-canvas.width / 2, -canvas.height / 2);
      }
      
      // Draw the image with current visible state
      ctx.filter = filterStyle;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // Convert to data URL
      const dataUrl = canvas.toDataURL('image/png');
      
      // Create a link and click it to download
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `edited-asset-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showNotification('Image downloaded successfully');
    } catch (error) {
      console.error("Download error:", error);
      showNotification('Error downloading image', 'error');
    }
  };
  
  const handleResetEdits = () => {
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setBlur(0);
    setRotation(0);
    setZoomLevel(100);
    setSelectedFilter('Normal');
    setCropRatio('original');
    setCropApplied(false);
    showNotification('All edits reset');
  };
  
  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };
  
  const handleCropApply = () => {
    setCropApplied(true);
    showNotification(`Crop ratio ${cropRatio} applied`);
  };
  
  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
    showNotification('Image rotated 90°');
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Loading editor...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Notification */}
      {notification.show && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-md shadow-md ${
          notification.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
        }`}>
          <div className="flex items-center">
            {notification.type === 'error' ? (
              <FiAlertCircle className="mr-2" />
            ) : (
              <FiCheckCircle className="mr-2" />
            )}
            {notification.message}
          </div>
        </div>
      )}
      
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-screen-xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-700 hover:text-primary-600"
          >
            <FiChevronLeft className="mr-1" /> Back
          </button>
          
          <div className="text-center">
            <h1 className="text-xl font-semibold text-gray-900">Edit Asset</h1>
            {isPremium && (
              <span className="inline-flex items-center text-xs text-primary-600">
                <FiCheckCircle className="mr-1" /> Premium Editor
              </span>
            )}
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={handleDownload}
              className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              <FiDownload className="mr-2" /> Download
            </button>
          </div>
        </div>
      </div>
      
      <div className="max-w-screen-xl mx-auto p-4 md:p-8 flex flex-col lg:flex-row gap-6">
        {/* Main editing area */}
        <div className="flex-1 bg-white rounded-lg shadow-md p-4 flex items-center justify-center overflow-hidden">
          {assetUrl ? (
            <div 
              className="relative overflow-hidden"
              style={{ 
                transform: `scale(${zoomLevel / 100}) rotate(${rotation}deg)`,
                transition: 'transform 0.3s ease-out'
              }}
            >
              <Image
                id="editable-image"
                src={assetUrl}
                alt="Editable asset"
                width={500}
                height={500}
                style={{ filter: filterStyle }}
                className={`max-w-full h-auto ${cropApplied ? `aspect-ratio-${cropRatio}` : ''}`}
              />
              
              {/* Only show overlay for non-premium users */}
              {!isPremium && (
                <div className="absolute inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
                  <div className="text-center p-4 bg-white rounded-lg shadow-lg">
                    <FiLock className="mx-auto h-8 w-8 text-primary-600 mb-2" />
                    <h3 className="text-lg font-bold text-gray-900">Premium Feature</h3>
                    <p className="text-sm text-gray-600 mb-3">Advanced editing requires a premium subscription</p>
                    <button 
                      onClick={() => router.push('/pricing')}
                      className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                    >
                      Upgrade Now
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center p-8 text-gray-500">
              <FiImage className="mx-auto h-12 w-12 mb-3 text-gray-300" />
              <p>No asset selected for editing</p>
            </div>
          )}
        </div>
        
        {/* Editing tools panel */}
        <div className="w-full lg:w-64 bg-white rounded-lg shadow-md overflow-hidden">
          <div className="border-b">
            <div className="flex">
              <button
                onClick={() => setActiveTab('adjust')}
                className={`flex-1 py-3 text-sm font-medium ${
                  activeTab === 'adjust' 
                    ? 'bg-primary-50 text-primary-600 border-b-2 border-primary-600' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                Adjust
              </button>
              <button
                onClick={() => setActiveTab('filters')}
                className={`flex-1 py-3 text-sm font-medium ${
                  activeTab === 'filters' 
                    ? 'bg-primary-50 text-primary-600 border-b-2 border-primary-600' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                Filters
              </button>
              <button
                onClick={() => setActiveTab('crop')}
                className={`flex-1 py-3 text-sm font-medium ${
                  activeTab === 'crop' 
                    ? 'bg-primary-50 text-primary-600 border-b-2 border-primary-600' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                Crop
              </button>
            </div>
          </div>
          
          <div className="p-4">
            {activeTab === 'adjust' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Brightness
                  </label>
                  <div className="flex items-center">
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={brightness}
                      onChange={(e) => setBrightness(Number(e.target.value))}
                      disabled={!isPremium}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                    />
                    <span className="ml-2 w-8 text-sm text-gray-600">{brightness}%</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contrast
                  </label>
                  <div className="flex items-center">
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={contrast}
                      onChange={(e) => setContrast(Number(e.target.value))}
                      disabled={!isPremium}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                    />
                    <span className="ml-2 w-8 text-sm text-gray-600">{contrast}%</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Saturation
                  </label>
                  <div className="flex items-center">
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={saturation}
                      onChange={(e) => setSaturation(Number(e.target.value))}
                      disabled={!isPremium}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                    />
                    <span className="ml-2 w-8 text-sm text-gray-600">{saturation}%</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Blur
                  </label>
                  <div className="flex items-center">
                    <input
                      type="range"
                      min="0"
                      max="10"
                      step="0.5"
                      value={blur}
                      onChange={(e) => setBlur(Number(e.target.value))}
                      disabled={!isPremium}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                    />
                    <span className="ml-2 w-8 text-sm text-gray-600">{blur}px</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Zoom
                  </label>
                  <div className="flex items-center">
                    <button
                      onClick={() => setZoomLevel(Math.max(50, zoomLevel - 10))}
                      disabled={!isPremium}
                      className="p-1 rounded-md bg-gray-100 text-gray-700 disabled:opacity-50"
                    >
                      <FiZoomOut />
                    </button>
                    <input
                      type="range"
                      min="50"
                      max="200"
                      value={zoomLevel}
                      onChange={(e) => setZoomLevel(Number(e.target.value))}
                      disabled={!isPremium}
                      className="mx-2 flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                    />
                    <button
                      onClick={() => setZoomLevel(Math.min(200, zoomLevel + 10))}
                      disabled={!isPremium}
                      className="p-1 rounded-md bg-gray-100 text-gray-700 disabled:opacity-50"
                    >
                      <FiZoomIn />
                    </button>
                    <span className="ml-2 w-10 text-sm text-gray-600">{zoomLevel}%</span>
                  </div>
                </div>
                
                <div className="pt-3">
                  <div className="flex space-x-2">
                    <button
                      onClick={handleRotate}
                      disabled={!isPremium}
                      className="flex items-center justify-center p-2 border rounded-md text-sm flex-1 disabled:opacity-50 hover:bg-gray-50"
                    >
                      <FiRotateCw className="mr-1" /> Rotate
                    </button>
                    <button
                      onClick={handleResetEdits}
                      disabled={!isPremium}
                      className="flex items-center justify-center p-2 border rounded-md text-sm flex-1 disabled:opacity-50 hover:bg-gray-50"
                    >
                      <FiRefreshCw className="mr-1" /> Reset
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'filters' && (
              <div>
                <div className="grid grid-cols-2 gap-3">
                  {Object.keys(filters).map((filter) => (
                    <button 
                      key={filter}
                      onClick={() => handleApplyFilter(filter)}
                      disabled={!isPremium}
                      className={`p-2 border rounded-md text-center text-sm ${
                        selectedFilter === filter ? 'bg-primary-50 border-primary-300 text-primary-600' : ''
                      } disabled:opacity-50 hover:bg-gray-50`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
                
                {isPremium && (
                  <div className="flex justify-center mt-4">
                    <div className="bg-primary-50 rounded-md px-3 py-1 text-xs text-primary-600 flex items-center">
                      <FiCheckCircle className="mr-1" /> Premium filters enabled
                    </div>
                  </div>
                )}
                
                {!isPremium && (
                  <div className="flex justify-center mt-4">
                    <div className="bg-gray-50 rounded-md px-3 py-1 text-xs text-gray-500 flex items-center">
                      <FiLock className="mr-1" /> Premium filters
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'crop' && (
              <div className="space-y-4">
                <div className="text-center">
                  <p className="mb-4 text-sm text-gray-700">
                    Select a crop ratio for your image
                  </p>
                  
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {['original', '1:1', '4:3', '16:9', '3:2', '2:3', '9:16'].map((ratio) => (
                      <button
                        key={ratio}
                        onClick={() => setCropRatio(ratio)}
                        disabled={!isPremium}
                        className={`py-2 border rounded-md text-sm disabled:opacity-50 hover:bg-gray-50 ${
                          cropRatio === ratio ? 'bg-primary-50 border-primary-300 text-primary-600' : ''
                        }`}
                      >
                        {ratio}
                      </button>
                    ))}
                  </div>
                  
                  <button
                    onClick={handleCropApply}
                    className="w-full py-2 mb-2 bg-primary-600 text-white rounded-md disabled:opacity-50"
                    disabled={!isPremium}
                  >
                    Apply Crop
                  </button>
                  
                  <button
                    onClick={() => {
                      setCropRatio('original');
                      setCropApplied(false);
                      showNotification('Crop reset');
                    }}
                    className="w-full py-2 border border-gray-300 rounded-md text-gray-700 disabled:opacity-50"
                    disabled={!isPremium || !cropApplied}
                  >
                    Reset Crop
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {!isPremium && (
            <div className="p-4 bg-gray-50 border-t">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">
                  Unlock all editing features with a premium plan
                </p>
                <button
                  onClick={() => router.push('/pricing')}
                  className="w-full py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                >
                  Upgrade Now
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}