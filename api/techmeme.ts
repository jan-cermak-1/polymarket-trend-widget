import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as xml2js from 'xml2js';

// Techmeme RSS Feed
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const url = 'https://www.techmeme.com/feed.xml';

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; TrendWidget/1.0)',
      },
    });

    if (!response.ok) {
      throw new Error(`Techmeme returned ${response.status}`);
    }

    const xmlData = await response.text();
    const parser = new xml2js.Parser();
    const result = await parser.parseStringPromise(xmlData);
    
    // Transform RSS data to our format
    const items = result?.rss?.channel?.[0]?.item || [];
    const stories = items.slice(0, 12).map((item: any) => {
      const title = item.title?.[0] || 'No Title';
      const link = item.link?.[0] || '#';
      const pubDate = item.pubDate?.[0] || new Date().toISOString();
      const description = item.description?.[0] || '';
      
      return {
        id: link,
        title,
        link,
        pubDate,
        description: description.replace(/<[^>]*>/g, '').substring(0, 200), // Strip HTML
      };
    });
    
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({ stories });
  } catch (error: any) {
    console.error('Error proxying Techmeme:', error);
    res.status(500).json({ error: error.message });
  }
}

