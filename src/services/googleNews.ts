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
  query?: string; // Custom query for search
  topic?: string; // Standard topics: WORLD, NATION, BUSINESS, TECHNOLOGY, ENTERTAINMENT, SPORTS, SCIENCE, HEALTH
}

export const getNewsCategories = (): NewsCategory[] => [
  { id: 'top', label: 'Top Stories', topic: 'NATION' },
  { id: 'world', label: 'World', topic: 'WORLD' },
  { id: 'business', label: 'Business', topic: 'BUSINESS' },
  { id: 'tech', label: 'Technology', topic: 'TECHNOLOGY' },
  { id: 'crypto', label: 'Crypto', query: 'cryptocurrency OR bitcoin OR ethereum' },
  { id: 'ai', label: 'AI', query: 'artificial intelligence OR openai OR llm' },
  { id: 'sports', label: 'Sports', topic: 'SPORTS' },
  { id: 'retail', label: 'Retail', query: 'retail industry OR ecommerce' },
  { id: 'entertainment', label: 'Entertainment', topic: 'ENTERTAINMENT' },
];

export const getGoogleNews = async (category: NewsCategory): Promise<NewsItem[]> => {
  try {
    let url = `${RSS_BASE_URL}`;
    const params: any = {
      hl: 'en-US',
      gl: 'US',
      ceid: 'US:en',
    };

    if (category.query) {
      url += `/search`;
      params.q = category.query;
    } else if (category.topic) {
      url += `/topics/${getTopicId(category.topic)}`;
    }

    // Note: Google RSS returns XML
    const response = await axios.get(url, { 
      params,
      responseType: 'text' 
    });

    return parseRSS(response.data);
  } catch (error) {
    console.error('Error fetching Google News:', error);
    return [];
  }
};

// Helper to map friendly topic names to Google's obscure topic IDs if needed, 
// but usually /headlines/section/topic/ works. 
// Actually Google RSS topics are often like 'CAAqJggBCiJCAQAqSVgwQ1FBUW9LQWdUWmh5QW1OVlJoY0hCc1pTNXpZM1Z5U2lnS0NRb1RDQ2tTV1c1cGRHbHZibkp5WlhSekxtTnZiU2dBUAE'
// So using 'headlines/section/topic/TECHNOLOGY' is easier if supported, but the RSS URL structure varies.
// Simple Approach: Use /search?q={TopicName} for robustness if topics are complex, 
// BUT standard topics have URLs like https://news.google.com/rss/headlines/section/topic/TECHNOLOGY
// Let's use the search endpoint for everything to be safe and consistent, or conditional logic.

// Update: The robust way for topics is using the specific URL structure, but let's stick to Search for simplicity first.
// Actually, `search?q=Technology` is not as good as the curated topic.
// Let's use `search` for everything for now to ensure it works without complex ID mapping.
// If category.topic is present, we just search for that topic name as a keyword, or use a predefined map if we want to be fancy.

const getTopicId = (topic: string) => {
  // This is a simplification. For a real robust RSS reader we might need the long IDs.
  // But searching for "Technology News" is usually good enough.
  return topic; 
};

const parseRSS = (xmlText: string): NewsItem[] => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, "text/xml");
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
    // Google RSS descriptions often contain: <a href="..."><font ...>...</a>
    // They rarely have direct <img> tags in the RSS description anymore, 
    // but sometimes they do.
    // Use a reliable placeholder or try to find an img tag.
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
      id: link, // use link as ID
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

