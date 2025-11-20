import type { VercelRequest, VercelResponse } from '@vercel/node';

// GNews API - Free tier: 100 requests/day
// https://gnews.io/
const GNEWS_API_KEY = process.env.GNEWS_API_KEY || 'demo'; // User needs to set this in Vercel env vars

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
    
    // Build GNews API URL
    const url = new URL('https://gnews.io/api/v4/search');
    
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
    
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(data);
  } catch (error: any) {
    console.error('Error proxying GNews:', error);
    res.status(500).json({ error: error.message });
  }
}
