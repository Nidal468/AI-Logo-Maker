import { NextResponse } from 'next/server';

const FLUX_API_URL = process.env.FLUX_API_URL || 'https://api.aimlapi.com/v1/images/generations';
const FLUX_API_KEY = '773133fa060d4f97ba8f94913f312807'; // e.g. "773133fa060d4f97ba8f94913f312807"

if (!FLUX_API_KEY) {
  console.error('❌ Missing FLUX_API_KEY in environment');
}

async function callFlux({ prompt, assetType, imageSize }) {
  const aspectSizes = {
    'logo':             { width: 1024, height: 1024 },
    'insta-post':     { width: 1024, height: 1024 },
    'fb-cover':       { width: 1024, height: 576  },
    'youtube-thumb':  { width: 1024, height: 576  },
    'generic-banner': { width: 1024, height: 576  },
    'linkedin-banner':{ width: 1024, height: 256  },
    'insta-story':    { width: 576, height: 1024 },
    'twitter-header': { width: 1024, height: 341 },
    'banner-ad':      { width: 1024, height: 256 },
    'web-banner':     { width: 1024, height: 576 },
    'favicon':        { width: 1024, height: 1024 },
    'flyer':          { width: 768, height: 1024 },
    'brochure':       { width: 1024, height: 768 },
    'business-card':  { width: 1024, height: 576 },
    'poster':         { width: 576, height: 1024 },
    'mug':            { width: 1024, height: 768 },
    'tshirt':         { width: 768, height: 1024 },
    'packaging':      { width: 1024, height: 1024 },
  };
  
  // Use the provided imageSize if available, otherwise fall back to predefined sizes
  const image_size = imageSize || aspectSizes[assetType] || { width: 1024, height: 768 };

  // Verify dimensions are multiples of 32 as required by Flux API
  if (image_size.width % 32 !== 0 || image_size.height % 32 !== 0) {
    throw new Error('Image dimensions must be multiples of 32');
  }

  // Check if dimensions are within the allowed range (256-1440)
  if (image_size.width < 256 || image_size.width > 1440 || 
      image_size.height < 256 || image_size.height > 1440) {
    throw new Error('Image dimensions must be between 256 and 1440 pixels');
  }

  const res = await fetch(FLUX_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${FLUX_API_KEY}`,
    },
    body: JSON.stringify({
      model:        'flux-pro',
      prompt,
      num_images:   1,
      image_size,
      safety_tolerance: '2', // Default as per documentation
      output_format: 'jpeg'  // Default as per documentation
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error('Flux API error', res.status, errText);
    throw new Error(`Flux API responded ${res.status}`);
  }

  const json = await res.json();
  const items = Array.isArray(json.data)
    ? json.data
    : Array.isArray(json.images)
      ? json.images
      : [];
  if (items.length === 0) {
    console.error('Unexpected Flux response', json);
    throw new Error('No images returned by Flux');
  }

  return items
    .map((item) => {
      if (item.url) return item.url;
      if (item.b64_json) return `data:image/png;base64,${item.b64_json}`;
      return null;
    })
    .filter((u) => u);
}

export async function POST(req) {
  try {
    const { prompt, assetType, imageSize } = await req.json();

    if (!prompt?.trim()) {
      return new Response(JSON.stringify({ error: 'Prompt is required.' }), { 
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
    if (!assetType) {
      return new Response(JSON.stringify({ error: 'assetType is required.' }), { 
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    const images = await callFlux({ prompt, assetType, imageSize });
    return new Response(JSON.stringify({ images }), { 
      status: 201,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (err) {
    console.error('[API] flux-generate error', err);
    const status = err.message.includes('responded') ? 502 : 500;
    return new Response(JSON.stringify({ error: err.message }), { 
      status: status,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}