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

export const getRedditCategories = (): RedditCategory[] => [
  { id: 'popular', label: 'Popular', subreddit: 'all' },
  { id: 'world', label: 'World News', subreddit: 'worldnews' },
  { id: 'tech', label: 'Technology', subreddit: 'technology' },
  { id: 'crypto', label: 'Crypto', subreddit: 'cryptocurrency' },
  { id: 'science', label: 'Science', subreddit: 'science' },
  { id: 'gaming', label: 'Gaming', subreddit: 'gaming' },
  { id: 'sports', label: 'Sports', subreddit: 'sports' },
  { id: 'movies', label: 'Movies', subreddit: 'movies' },
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

