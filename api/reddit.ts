import type { VercelRequest, VercelResponse } from '@vercel/node';

// Reddit API - completely free, no API key needed
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { subreddit = 'all', sort = 'hot', limit = '12' } = req.query;
    
    // Reddit JSON API URL
    const url = `https://www.reddit.com/r/${subreddit}/${sort}.json?limit=${limit}`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Referer': 'https://www.reddit.com/',
        'Origin': 'https://www.reddit.com',
      },
    });

    if (!response.ok) {
      throw new Error(`Reddit returned ${response.status}`);
    }

    const data = await response.json();
    
    // Transform Reddit data to our format
    const posts = data.data.children
      .filter((post: any) => !post.data.stickied && !post.data.over_18) // Filter out pinned and NSFW posts
      .map((post: any) => {
        const data = post.data;
        
        // Try to get thumbnail or preview image
        let image = null;
        if (data.thumbnail && data.thumbnail.startsWith('http')) {
          image = data.thumbnail;
        } else if (data.preview?.images?.[0]?.source?.url) {
          image = data.preview.images[0].source.url.replace(/&amp;/g, '&');
        }
        
        return {
          id: data.id,
          title: data.title,
          url: `https://reddit.com${data.permalink}`,
          image: image,
          description: data.selftext?.substring(0, 200) || '',
          publishedAt: new Date(data.created_utc * 1000).toISOString(),
          author: data.author,
          score: data.score,
          comments: data.num_comments,
          subreddit: data.subreddit,
        };
      });
    
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({ posts });
  } catch (error: any) {
    console.error('Error proxying Reddit:', error);
    res.status(500).json({ error: error.message });
  }
}

