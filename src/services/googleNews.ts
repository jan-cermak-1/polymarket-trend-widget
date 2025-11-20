import axios from 'axios';

// For Vercel deployment with rewrites
const RSS_BASE_URL = '/api/news/rss';

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
  query: string; // Always use search query for consistency
}

export const getNewsCategories = (): NewsCategory[] => [
  { id: 'top', label: 'Top Stories', query: 'breaking news' },
  { id: 'world', label: 'World', query: 'world news' },
  { id: 'business', label: 'Business', query: 'business news' },
  { id: 'tech', label: 'Technology', query: 'technology news' },
  { id: 'crypto', label: 'Crypto', query: 'cryptocurrency bitcoin ethereum' },
  { id: 'ai', label: 'AI', query: 'artificial intelligence openai' },
  { id: 'sports', label: 'Sports', query: 'sports news' },
  { id: 'retail', label: 'Retail', query: 'retail industry ecommerce' },
  { id: 'entertainment', label: 'Entertainment', query: 'entertainment news' },
];

export const getGoogleNews = async (category: NewsCategory): Promise<NewsItem[]> => {
  try {
    const url = `${RSS_BASE_URL}/search`;
    const params = {
      hl: 'en-US',
      gl: 'US',
      ceid: 'US:en',
      q: category.query,
    };

    // Note: Google RSS returns XML
    const response = await axios.get(url, { 
      params,
      responseType: 'text',
      timeout: 10000 // 10 second timeout
    });

    return parseRSS(response.data);
  } catch (error) {
    console.error('Error fetching Google News:', error);
    return [];
  }
};

const parseRSS = (xmlText: string): NewsItem[] => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, "text/xml");
  
  // Check for parsing errors
  const parserError = xmlDoc.querySelector('parsererror');
  if (parserError) {
    console.error('XML parsing error:', parserError.textContent);
    return [];
  }
  
  const items = xmlDoc.getElementsByTagName("item");
  const newsItems: NewsItem[] = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const title = item.getElementsByTagName("title")[0]?.textContent || "No Title";
    const link = item.getElementsByTagName("link")[0]?.textContent || "#";
    const pubDateStr = item.getElementsByTagName("pubDate")[0]?.textContent || "";
    const description = item.getElementsByTagName("description")[0]?.textContent || "";
    const source = item.getElementsByTagName("source")[0]?.textContent || "Google News";

    // Attempt to extract image from description HTML if present
    let image = undefined;
    const imgMatch = description.match(/src="([^"]+)"/);
    if (imgMatch) {
      image = imgMatch[1];
    }

    // Clean up title (Google News often is "Title - Source")
    const titleParts = title.split(" - ");
    const cleanTitle = titleParts.length > 1 ? titleParts.slice(0, -1).join(" - ") : title;
    const cleanSource = titleParts.length > 1 ? titleParts[titleParts.length - 1] : source;

    newsItems.push({
      id: link + i, // use link + index as ID to ensure uniqueness
      title: cleanTitle,
      link,
      pubDate: pubDateStr,
      source: cleanSource,
      image,
      description
    });
  }

  return newsItems;
};
