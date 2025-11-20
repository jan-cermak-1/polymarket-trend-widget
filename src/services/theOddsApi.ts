import axios from 'axios';

const API_KEY = 'YOUR_API_KEY'; // Placeholder, user needs to provide this
const BASE_URL = 'https://api.the-odds-api.com/v4/sports';

export interface Outcome {
  name: string;
  price: number;
  point?: number; // For spreads and totals
}

export interface Market {
  key: string; // 'h2h', 'spreads', 'totals'
  outcomes: Outcome[];
}

export interface Bookmaker {
  key: string; // 'fanduel', 'draftkings', 'betmgm'
  title: string;
  markets: Market[];
}

export interface Game {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: Bookmaker[];
}

export type MarketType = 'h2h' | 'spreads' | 'totals';

// Cache key
const getCacheKey = (bookmaker: string, marketType: MarketType) => 
  `odds_api_cache_${bookmaker}_${marketType}`;

const CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 hours in milliseconds

interface CacheData {
  timestamp: number;
  data: Game[];
}

export const getOddsByBookmaker = async (
  bookmakerKey: string, 
  marketType: MarketType = 'h2h'
): Promise<Game[]> => {
  const cacheKey = getCacheKey(bookmakerKey, marketType);
  
  // 1. Check Cache
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    try {
      const parsed: CacheData = JSON.parse(cached);
      const now = Date.now();
      if (now - parsed.timestamp < CACHE_DURATION) {
        console.log(`Using cached betting data for ${bookmakerKey} - ${marketType}`);
        return parsed.data;
      }
    } catch (e) {
      console.warn('Invalid cache data', e);
    }
  }

  // 2. If no cache or expired, fetch (ONLY if API key is set)
  if (API_KEY === 'YOUR_API_KEY') {
    // Return mock data if no key to prevent errors and show UI
    return getMockData(bookmakerKey, marketType);
  }

  try {
    // Fetch odds for 'upcoming' sports, US region, specified market, specific bookie
    const response = await axios.get(`${BASE_URL}/upcoming/odds`, {
      params: {
        apiKey: API_KEY,
        regions: 'us',
        markets: marketType,
        bookmakers: bookmakerKey,
        oddsFormat: 'decimal',
      }
    });

    const data = response.data.slice(0, 10); // Limit to 10 games

    // 3. Save to Cache
    localStorage.setItem(cacheKey, JSON.stringify({
      timestamp: Date.now(),
      data: data
    }));

    return data;
  } catch (error) {
    console.error(`Error fetching betting odds for ${bookmakerKey}:`, error);
    return [];
  }
};

export const clearCache = () => {
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.startsWith('odds_api_cache_')) {
      localStorage.removeItem(key);
    }
  });
};

// Mock Data for when no API key is present
const getMockData = (bookmakerKey: string, marketType: MarketType): Game[] => {
  const now = new Date();
  const getGameTime = (hoursToAdd: number) => new Date(now.getTime() + hoursToAdd * 60 * 60 * 1000).toISOString();

  const bookmakerTitle = bookmakerKey === 'fanduel' ? 'FanDuel' : 
                         bookmakerKey === 'draftkings' ? 'DraftKings' : 'BetMGM';

  const basePrice = bookmakerKey === 'fanduel' ? 0.05 : bookmakerKey === 'draftkings' ? 0.03 : 0.02;

  const games: Game[] = [
    {
      id: '1',
      sport_key: 'basketball_nba',
      sport_title: 'NBA',
      commence_time: getGameTime(2),
      home_team: 'Lakers',
      away_team: 'Warriors',
      bookmakers: []
    },
    {
      id: '2',
      sport_key: 'americanfootball_nfl',
      sport_title: 'NFL',
      commence_time: getGameTime(24),
      home_team: 'Chiefs',
      away_team: 'Ravens',
      bookmakers: []
    },
    {
      id: '3',
      sport_key: 'baseball_mlb',
      sport_title: 'MLB',
      commence_time: getGameTime(5),
      home_team: 'Yankees',
      away_team: 'Red Sox',
      bookmakers: []
    },
    {
      id: '4',
      sport_key: 'basketball_nba',
      sport_title: 'NBA',
      commence_time: getGameTime(8),
      home_team: 'Celtics',
      away_team: 'Heat',
      bookmakers: []
    },
    {
      id: '5',
      sport_key: 'icehockey_nhl',
      sport_title: 'NHL',
      commence_time: getGameTime(12),
      home_team: 'Maple Leafs',
      away_team: 'Canadiens',
      bookmakers: []
    },
    {
      id: '6',
      sport_key: 'americanfootball_nfl',
      sport_title: 'NFL',
      commence_time: getGameTime(36),
      home_team: '49ers',
      away_team: 'Seahawks',
      bookmakers: []
    },
    {
      id: '7',
      sport_key: 'baseball_mlb',
      sport_title: 'MLB',
      commence_time: getGameTime(6),
      home_team: 'Dodgers',
      away_team: 'Giants',
      bookmakers: []
    },
    {
      id: '8',
      sport_key: 'basketball_nba',
      sport_title: 'NBA',
      commence_time: getGameTime(15),
      home_team: 'Nuggets',
      away_team: 'Suns',
      bookmakers: []
    },
    {
      id: '9',
      sport_key: 'icehockey_nhl',
      sport_title: 'NHL',
      commence_time: getGameTime(20),
      home_team: 'Rangers',
      away_team: 'Islanders',
      bookmakers: []
    },
    {
      id: '10',
      sport_key: 'baseball_mlb',
      sport_title: 'MLB',
      commence_time: getGameTime(9),
      home_team: 'Astros',
      away_team: 'Rangers',
      bookmakers: []
    }
  ];

  // Add bookmaker data based on market type
  games.forEach(game => {
    let outcomes: Outcome[] = [];

    if (marketType === 'h2h') {
      outcomes = [
        { name: game.home_team, price: 1.85 + basePrice + Math.random() * 0.1 },
        { name: game.away_team, price: 1.95 + basePrice + Math.random() * 0.1 }
      ];
    } else if (marketType === 'spreads') {
      outcomes = [
        { name: game.home_team, price: 1.90 + basePrice, point: -3.5 },
        { name: game.away_team, price: 1.90 + basePrice, point: 3.5 }
      ];
    } else if (marketType === 'totals') {
      const total = game.sport_key.includes('basketball') ? 220 : 
                    game.sport_key.includes('football') ? 47 :
                    game.sport_key.includes('baseball') ? 8.5 : 6.5;
      outcomes = [
        { name: 'Over', price: 1.90 + basePrice, point: total },
        { name: 'Under', price: 1.90 + basePrice, point: total }
      ];
    }

    game.bookmakers = [{
      key: bookmakerKey,
      title: bookmakerTitle,
      markets: [{ key: marketType, outcomes }]
    }];
  });

  return games;
};
