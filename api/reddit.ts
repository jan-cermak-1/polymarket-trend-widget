import type { VercelRequest, VercelResponse } from '@vercel/node';

// Reddit API - using old.reddit.com which is less restrictive
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
    
    // Use old.reddit.com JSON API which is less restrictive
    const url = `https://old.reddit.com/r/${subreddit}/${sort}.json?limit=${limit}`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; WidgetBot/1.0)',
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

