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
  { id: 'top', label: 'Top Stories', gnewsCategory: 'general' },
  { id: 'world', label: 'World News', gnewsCategory: 'world' },
  { id: 'tech', label: 'Technology', gnewsCategory: 'technology' },
  { id: 'crypto', label: 'Crypto', query: 'cryptocurrency bitcoin' },
  { id: 'business', label: 'Business', gnewsCategory: 'business' },
  { id: 'science', label: 'Science', gnewsCategory: 'science' },
  { id: 'sports', label: 'Sports', gnewsCategory: 'sports' },
  { id: 'gaming', label: 'Gaming', query: 'gaming esports' },
];

export const getGNews = async (category: NewsCategory): Promise<NewsItem[]> => {
  const cacheKey = `gnews-cache-${category.id}`;
  const cachedData = localStorage.getItem(cacheKey);
  const cacheTimestamp = localStorage.getItem(`${cacheKey}-timestamp`);
  const now = Date.now();
  const ONE_DAY_MS = 24 * 60 * 60 * 1000; // 24 hours

  if (cachedData && cacheTimestamp && (now - parseInt(cacheTimestamp, 10) < ONE_DAY_MS)) {
    console.log(`GNews Cache HIT for ${category.id}`);
    return JSON.parse(cachedData);
  }

  console.log(`GNews Cache MISS for ${category.id}, fetching new data...`);

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
    
    const newsItems = articles.map((article: any, index: number) => ({
      id: article.url || `news-${index}`,
      title: article.title || 'No Title',
      link: article.url || '#',
      pubDate: article.publishedAt || new Date().toISOString(),
      source: article.source?.name || 'Unknown',
      image: article.image || undefined,
      description: article.description || article.content || '',
    }));
    
    localStorage.setItem(cacheKey, JSON.stringify(newsItems));
    localStorage.setItem(`${cacheKey}-timestamp`, now.toString());
    return newsItems;

  } catch (error) {
    console.error('Error fetching news:', error);
    return [];
  }
};

// Export with original name for backwards compatibility
export const getGoogleNews = getGNews;
