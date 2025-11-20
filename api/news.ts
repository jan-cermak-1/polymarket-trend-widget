import type { VercelRequest, VercelResponse } from '@vercel/node';

// GNews API - Free tier: 100 requests/day
// https://gnews.io/
const GNEWS_API_KEY = process.env.GNEWS_API_KEY || 'f79b955fb4edd4ebc9dfd481154c2924';

// In-memory cache (persists for the lifetime of the serverless function)
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { q, category, lang = 'en', country = 'us', max = '12' } = req.query;
    
    // Create cache key
    const cacheKey = `${category || q || 'general'}-${lang}-${country}`;
    
    // Check cache first
    const cached = cache.get(cacheKey);
    const now = Date.now();
    
    if (cached && (now - cached.timestamp < CACHE_DURATION)) {
      console.log('Returning cached GNews data for:', cacheKey);
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('X-Cache', 'HIT');
      res.setHeader('X-Cache-Age', String(Math.floor((now - cached.timestamp) / 1000)));
      return res.status(200).json(cached.data);
    }
    
    // Build GNews API URL - use top-headlines for category, search for query
    let baseUrl = '';
    if (q) {
      baseUrl = 'https://gnews.io/api/v4/search';
    } else {
      baseUrl = 'https://gnews.io/api/v4/top-headlines';
    }
    
    const url = new URL(baseUrl);
    
    if (q) {
      url.searchParams.set('q', q as string);
    } else if (category) {
      url.searchParams.set('category', category as string);
    } else {
      url.searchParams.set('category', 'general');
    }
    
    url.searchParams.set('lang', lang as string);
    url.searchParams.set('country', country as string);
    url.searchParams.set('max', max as string);
    url.searchParams.set('apikey', GNEWS_API_KEY);

    console.log('Fetching fresh GNews data for:', cacheKey);
    const response = await fetch(url.toString(), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`GNews API returned ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    
    // Store in cache
    cache.set(cacheKey, {
      data,
      timestamp: now
    });
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('X-Cache', 'MISS');
    res.status(200).json(data);
  } catch (error: any) {
    console.error('Error proxying GNews:', error);
    res.status(500).json({ error: error.message });
  }
}
