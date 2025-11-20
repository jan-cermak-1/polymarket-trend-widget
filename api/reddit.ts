import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as xml2js from 'xml2js';

// Reddit RSS Feed - more reliable than JSON API for serverless
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { subreddit = 'popular', sort = 'hot', limit = '12' } = req.query;
    
    // Use Reddit RSS feed which is more reliable
    const url = `https://www.reddit.com/r/${subreddit}/${sort === 'hot' ? '.rss' : `/${sort}.rss`}?limit=${limit}`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; TrendWidget/1.0)',
      },
    });

    if (!response.ok) {
      throw new Error(`Reddit returned ${response.status}`);
    }

    const xmlData = await response.text();
    const parser = new xml2js.Parser();
    const result = await parser.parseStringPromise(xmlData);
    
    // Transform RSS data to our format
    const items = result?.feed?.entry || [];
    const posts = items.slice(0, parseInt(limit as string, 10)).map((entry: any) => {
      const title = entry.title?.[0] || 'No Title';
      const link = entry.link?.[0]?.$?.href || '#';
      const author = entry.author?.[0]?.name?.[0] || 'Unknown';
      const published = entry.updated?.[0] || entry.published?.[0] || new Date().toISOString();
      const content = entry.content?.[0]?._ || entry.summary?.[0] || '';
      
      // Extract subreddit from category
      const category = entry.category?.[0]?.$?.term || subreddit;
      
      // Try to extract score and comments from content
      let score = 0;
      let comments = 0;
      const scoreMatch = content.match(/(\d+)\s+points?/i);
      const commentsMatch = content.match(/(\d+)\s+comments?/i);
      if (scoreMatch) score = parseInt(scoreMatch[1], 10);
      if (commentsMatch) comments = parseInt(commentsMatch[1], 10);
      
      return {
        id: entry.id?.[0] || Math.random().toString(),
        title,
        url: link,
        image: null, // RSS doesn't include images reliably
        description: content.substring(0, 200),
        publishedAt: published,
        author,
        score,
        comments,
        subreddit: category,
      };
    });
    
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({ posts });
  } catch (error: any) {
    console.error('Error proxying Reddit RSS:', error);
    res.status(500).json({ error: error.message });
  }
}

