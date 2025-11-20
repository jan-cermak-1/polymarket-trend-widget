import axios from 'axios';

// Reddit API via Vercel serverless function - completely free
const NEWS_API_URL = '/api/news';

export interface NewsItem {
  id: string;
  title: string;
  link: string;
  pubDate: string;
  source: string;
  image?: string;
  description?: string;
}

export interface NewsCategory {
  id: string;
  label: string;
  subreddit: string;
}

export const getNewsCategories = (): NewsCategory[] => [
  { id: 'world', label: 'World News', subreddit: 'worldnews' },
  { id: 'news', label: 'Top News', subreddit: 'news' },
  { id: 'tech', label: 'Technology', subreddit: 'technology' },
  { id: 'crypto', label: 'Crypto', subreddit: 'cryptocurrency' },
  { id: 'business', label: 'Business', subreddit: 'business' },
  { id: 'science', label: 'Science', subreddit: 'science' },
  { id: 'sports', label: 'Sports', subreddit: 'sports' },
  { id: 'gaming', label: 'Gaming', subreddit: 'gaming' },
];

export const getGoogleNews = async (category: NewsCategory): Promise<NewsItem[]> => {
  try {
    const response = await axios.get(NEWS_API_URL, { 
      params: {
        subreddit: category.subreddit
      },
      timeout: 10000
    });

    const articles = response.data.articles || [];
    
    return articles.map((article: any, index: number) => ({
      id: article.url || `news-${index}`,
      title: article.title || 'No Title',
      link: article.url || '#',
      pubDate: article.publishedAt || new Date().toISOString(),
      source: article.source?.name || 'Reddit',
      image: article.urlToImage || undefined,
      description: article.description || '',
    }));
  } catch (error) {
    console.error('Error fetching news:', error);
    return [];
  }
};
