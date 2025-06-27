import { NextResponse } from 'next/server';

const RECRAFT_API_URL = 'https://external.api.recraft.ai/v1/images/generations';
const RECRAFT_API_KEY = 'LXVwiMFdTz7SXDaTxIrbxjKJs00Z5T96kaYxWQwG6P5uZCpEDuFDMAg742HVnKl7'; // Replace with your actual Recraft API key

if (!RECRAFT_API_KEY) {
  console.error('❌ Missing RECRAFT_API_KEY in environment');
}

async function callRecraft({ prompt, assetType, imageSize }) {
  const aspectSizes = {
    'logo': { size: '1024x1024' },
    'video': { size: '1920 × 1080' },
    'insta-post': { size: '1024x1024' },
    'fb-cover': { size: '1365x1024' },
    'youtube-thumb': { size: '1365x1024' },
    'generic-banner': { size: '1365x1024' },
    'linkedin-banner': { size: '1820x1024' },
    'insta-story': { size: '1024x1365' },
    'twitter-header': { size: '1536x1024' },
    'banner-ad': { size: '1820x1024' },
    'web-banner': { size: '1365x1024' },
    'favicon': { size: '1024x1024' },
    'flyer': { size: '1024x1365' },
    'brochure': { size: '1365x1024' },
    'business-card': { size: '1536x1024' },
    'poster': { size: '1024x1820' },
    'mug': { size: '1365x1024' },
    'tshirt': { size: '1024x1365' },
    'packaging': { size: '1024x1024' },
  };

  // Use the provided imageSize if available, otherwise fall back to predefined sizes
  const size = aspectSizes[assetType]?.size || '1024x1024';

  const requestBody = {
    prompt,
    style: 'digital_illustration', // Default style, can be made configurable
    model: 'recraftv3',
    n: 1,
    size,
    response_format: 'url'
  };

  const res = await fetch(RECRAFT_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${RECRAFT_API_KEY}`,
    },
    body: JSON.stringify(requestBody),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error('Recraft API error', res.status, errText);
    throw new Error(`Recraft API responded ${res.status}`);
  }

  const json = await res.json();
  const items = Array.isArray(json.data) ? json.data : [];

  if (items.length === 0) {
    console.error('Unexpected Recraft response', json);
    throw new Error('No images returned by Recraft');
  }

  return items.map(item => item.url).filter(url => url);
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

    const images = await callRecraft({ prompt, assetType, imageSize });
    return new Response(JSON.stringify({ images }), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (err) {
    console.error('[API] recraft-generate error', err);
    const status = err.message.includes('responded') ? 502 : 500;
    return new Response(JSON.stringify({ error: err.message }), {
      status: status,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}