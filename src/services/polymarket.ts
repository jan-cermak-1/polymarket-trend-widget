import axios from 'axios';

// Use local proxy path to avoid CORS issues
const BASE_URL = '/api/polymarket';

export interface Market {
  id: string;
  question: string;
  conditionId: string;
  slug: string;
  outcomePrices: string[];
  volume: number;
  active: boolean;
  closed: boolean;
  marketMakerAddress: string;
  createdAt: string;
  updatedAt: string;
  new?: boolean;
  featured?: boolean;
  superFeatured?: boolean;
  category?: string;
  tags?: string[];
  groupItemTitle?: string;
}

export interface Event {
  id: string;
  title: string;
  slug: string;
  image: string;
  markets: Market[];
  tags: { id: string; label: string; slug: string }[];
  volume: number;
  volume24hr: number;
  creationDate?: string;
}

export interface Tag {
  id: string;
  label: string;
  slug: string;
  isSpecial?: boolean;
  groupId?: string; // For grouping in UI
  groupLabel?: string; // Label for the group
}

export interface PriceHistoryPoint {
  t: number; // timestamp
  p: number; // price
}

// Extended category list with subcategories based on Polymarket structure
export const getTags = async (): Promise<Tag[]> => {
  const tags: Tag[] = [
    // --- Special ---
    { id: 'trending', label: 'Trending', slug: 'trending', isSpecial: true, groupId: 'featured', groupLabel: 'Featured' },
    { id: 'breaking', label: 'Breaking', slug: 'breaking', isSpecial: true, groupId: 'featured', groupLabel: 'Featured' },
    { id: 'new', label: 'New', slug: 'new', isSpecial: true, groupId: 'featured', groupLabel: 'Featured' },
    
    // --- Politics ---
    { id: 'politics', label: 'All Politics', slug: 'politics', groupId: 'politics', groupLabel: 'Politics' },
    { id: 'us-politics', label: 'US Politics', slug: 'us-politics', groupId: 'politics', groupLabel: 'Politics' },
    { id: 'elections', label: 'Elections', slug: 'elections', groupId: 'politics', groupLabel: 'Politics' },
    { id: 'global-politics', label: 'Global Politics', slug: 'world-politics', groupId: 'politics', groupLabel: 'Politics' },

    // --- Crypto ---
    { id: 'crypto', label: 'All Crypto', slug: 'crypto', groupId: 'crypto', groupLabel: 'Crypto' },
    { id: 'bitcoin', label: 'Bitcoin', slug: 'bitcoin', groupId: 'crypto', groupLabel: 'Crypto' },
    { id: 'ethereum', label: 'Ethereum', slug: 'ethereum', groupId: 'crypto', groupLabel: 'Crypto' },
    { id: 'solana', label: 'Solana', slug: 'solana', groupId: 'crypto', groupLabel: 'Crypto' },
    { id: 'nfts', label: 'NFTs', slug: 'nfts', groupId: 'crypto', groupLabel: 'Crypto' },

    // --- Sports ---
    { id: 'sports', label: 'All Sports', slug: 'sports', groupId: 'sports', groupLabel: 'Sports' },
    { id: 'soccer', label: 'Soccer', slug: 'soccer', groupId: 'sports', groupLabel: 'Sports' },
    { id: 'football', label: 'Football (NFL)', slug: 'nfl', groupId: 'sports', groupLabel: 'Sports' },
    { id: 'basketball', label: 'Basketball (NBA)', slug: 'nba', groupId: 'sports', groupLabel: 'Sports' },
    { id: 'tennis', label: 'Tennis', slug: 'tennis', groupId: 'sports', groupLabel: 'Sports' },
    { id: 'combat-sports', label: 'Combat Sports', slug: 'mma', groupId: 'sports', groupLabel: 'Sports' },
    { id: 'f1', label: 'Formula 1', slug: 'formula-1', groupId: 'sports', groupLabel: 'Sports' },

    // --- Business / Finance ---
    { id: 'finance', label: 'Finance', slug: 'finance', groupId: 'business', groupLabel: 'Business' },
    { id: 'economy', label: 'Economy', slug: 'economy', groupId: 'business', groupLabel: 'Business' },
    { id: 'tech', label: 'Tech', slug: 'technology', groupId: 'business', groupLabel: 'Business' },
    { id: 'startups', label: 'Startups', slug: 'startups', groupId: 'business', groupLabel: 'Business' },

    // --- Pop Culture ---
    { id: 'culture', label: 'Pop Culture', slug: 'pop-culture', groupId: 'culture', groupLabel: 'Pop Culture' },
    { id: 'movies', label: 'Movies', slug: 'movies', groupId: 'culture', groupLabel: 'Pop Culture' },
    { id: 'music', label: 'Music', slug: 'music', groupId: 'culture', groupLabel: 'Pop Culture' },
    { id: 'celebrities', label: 'Celebrities', slug: 'people', groupId: 'culture', groupLabel: 'Pop Culture' },

    // --- Other ---
    { id: 'science', label: 'Science', slug: 'science', groupId: 'other', groupLabel: 'Other' },
    { id: 'ai', label: 'AI', slug: 'ai', groupId: 'other', groupLabel: 'Other' },
    { id: 'space', label: 'Space', slug: 'space', groupId: 'other', groupLabel: 'Other' },
  ];
  return tags;
};

export const getTrendingEvents = async (tagSlug: string = 'trending'): Promise<Event[]> => {
  const params: any = {
    limit: 10,
    active: true,
    closed: false,
    order: 'volume24hr',
    ascending: false,
  };

  if (tagSlug === 'new') {
    params.order = 'startDate';
  } else if (tagSlug === 'breaking') {
    params.order = 'volume24hr'; 
  } else if (tagSlug !== 'trending') {
    params.tag_slug = tagSlug;
  }

  try {
    const response = await axios.get(`${BASE_URL}/events`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching trending events:', error);
    return [];
  }
};

export const getMarketHistory = async (marketId: string): Promise<PriceHistoryPoint[]> => {
    try {
        const response = await axios.get('/api/clob/prices-history', {
            params: {
                market: marketId,
                interval: '1h', // 1 hour points
                fidelity: 10,    // reduce data points
            }
        });
        return response.data.history || [];
    } catch (error) {
        console.warn(`Failed to fetch history for ${marketId}`, error);
        return [];
    }
}
