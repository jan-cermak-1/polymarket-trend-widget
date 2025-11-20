import axios from 'axios';

const REDDIT_API_URL = '/api/reddit';

export interface RedditPost {
  id: string;
  title: string;
  url: string;
  image?: string;
  description: string;
  publishedAt: string;
  author: string;
  score: number;
  comments: number;
  subreddit: string;
}

export interface RedditCategory {
  id: string;
  label: string;
  subreddit: string;
}

// Popular Reddit subreddits for trending content
export const getRedditCategories = (): RedditCategory[] => [
  { id: 'popular', label: 'Popular', subreddit: 'popular' },
  { id: 'all', label: 'All', subreddit: 'all' },
  { id: 'news', label: 'News', subreddit: 'news' },
  { id: 'worldnews', label: 'World News', subreddit: 'worldnews' },
  { id: 'technology', label: 'Technology', subreddit: 'technology' },
  { id: 'science', label: 'Science', subreddit: 'science' },
  { id: 'gaming', label: 'Gaming', subreddit: 'gaming' },
  { id: 'sports', label: 'Sports', subreddit: 'sports' },
];

export const getRedditPosts = async (category: RedditCategory): Promise<RedditPost[]> => {
  try {
    const response = await axios.get(REDDIT_API_URL, { 
      params: {
        subreddit: category.subreddit,
        sort: 'hot',
        limit: '12',
      },
      timeout: 10000
    });

    return response.data.posts || [];
  } catch (error) {
    console.error('Error fetching Reddit posts:', error);
    return [];
  }
};

