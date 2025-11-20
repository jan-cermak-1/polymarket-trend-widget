import axios from 'axios';

// GNews API via Vercel serverless function
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
  gnewsCategory?: string; // GNews category
  query?: string; // Search query as fallback
}

export const getNewsCategories = (): NewsCategory[] => [
  { id: 'general', label: 'Top Stories', gnewsCategory: 'general' },
  { id: 'world', label: 'World', gnewsCategory: 'world' },
  { id: 'business', label: 'Business', gnewsCategory: 'business' },
  { id: 'technology', label: 'Technology', gnewsCategory: 'technology' },
  { id: 'crypto', label: 'Crypto', query: 'cryptocurrency bitcoin' },
  { id: 'entertainment', label: 'Entertainment', gnewsCategory: 'entertainment' },
  { id: 'sports', label: 'Sports', gnewsCategory: 'sports' },
  { id: 'science', label: 'Science', gnewsCategory: 'science' },
  { id: 'health', label: 'Health', gnewsCategory: 'health' },
];

export const getGoogleNews = async (category: NewsCategory): Promise<NewsItem[]> => {
  try {
    const params: any = {
      lang: 'en',
      country: 'us',
      max: '12',
    };

    if (category.gnewsCategory) {
      params.category = category.gnewsCategory;
    } else if (category.query) {
      params.q = category.query;
    }

    const response = await axios.get(NEWS_API_URL, { 
      params,
      timeout: 10000 // 10 second timeout
    });

    // GNews API returns JSON format
    const articles = response.data.articles || [];
    
    return articles.map((article: any, index: number) => ({
      id: article.url || `news-${index}`,
      title: article.title || 'No Title',
      link: article.url || '#',
      pubDate: article.publishedAt || new Date().toISOString(),
      source: article.source?.name || 'Unknown',
      image: article.image || undefined,
      description: article.description || article.content || '',
    }));
  } catch (error) {
    console.error('Error fetching news:', error);
    return [];
  }
};
