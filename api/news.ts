import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { hl, gl, ceid, q } = req.query;
    
    const url = new URL('https://news.google.com/rss/search');
    url.searchParams.set('hl', hl as string || 'en-US');
    url.searchParams.set('gl', gl as string || 'US');
    url.searchParams.set('ceid', ceid as string || 'US:en');
    url.searchParams.set('q', q as string || 'breaking news');

    const response = await fetch(url.toString(), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`Google News returned ${response.status}`);
    }

    const data = await response.text();
    
    res.setHeader('Content-Type', 'text/xml');
    res.status(200).send(data);
  } catch (error: any) {
    console.error('Error proxying Google News:', error);
    res.status(500).json({ error: error.message });
  }
}

