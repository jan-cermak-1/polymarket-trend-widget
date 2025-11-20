import axios from 'axios';

const API_KEY = 'YOUR_API_KEY'; // Placeholder, user needs to provide this
const BASE_URL = 'https://api.the-odds-api.com/v4/sports';

export interface Outcome {
  name: string;
  price: number;
}

export interface Market {
  key: string; // 'h2h'
  outcomes: Outcome[];
}

export interface Bookmaker {
  key: string; // 'fan_duel', 'draftkings', 'betmgm'
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

// Cache key
const CACHE_KEY = 'odds_api_cache';
const CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 hours in milliseconds

interface CacheData {
  timestamp: number;
  data: Game[];
}

export const getUpcomingOdds = async (): Promise<Game[]> => {
  // 1. Check Cache
  const cached = localStorage.getItem(CACHE_KEY);
  if (cached) {
    try {
      const parsed: CacheData = JSON.parse(cached);
      const now = Date.now();
      if (now - parsed.timestamp < CACHE_DURATION) {
        console.log('Using cached betting data');
        return parsed.data;
      }
    } catch (e) {
      console.warn('Invalid cache data', e);
    }
  }

  // 2. If no cache or expired, fetch (ONLY if API key is set)
  if (API_KEY === 'YOUR_API_KEY') {
    // Return mock data if no key to prevent errors and show UI
    return getMockData();
  }

  try {
    // Fetch odds for 'upcoming' sports, US region, h2h market, top 3 bookies
    const response = await axios.get(`${BASE_URL}/upcoming/odds`, {
      params: {
        apiKey: API_KEY,
        regions: 'us',
        markets: 'h2h',
        bookmakers: 'fan_duel,draftkings,betmgm',
        limit: 10, // Limit to 10 games
      }
    });

    const data = response.data;

    // 3. Save to Cache
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      timestamp: Date.now(),
      data: data
    }));

    return data;
  } catch (error) {
    console.error('Error fetching betting odds:', error);
    return [];
  }
};

// Mock Data for when no API key is present
const getMockData = (): Game[] => {
  const now = new Date();
  const getGameTime = (hoursToAdd: number) => new Date(now.getTime() + hoursToAdd * 60 * 60 * 1000).toISOString();

  return [
    {
      id: '1',
      sport_key: 'basketball_nba',
      sport_title: 'NBA',
      commence_time: getGameTime(2),
      home_team: 'Lakers',
      away_team: 'Warriors',
      bookmakers: [
        {
          key: 'fan_duel',
          title: 'FanDuel',
          markets: [{ key: 'h2h', outcomes: [{ name: 'Lakers', price: 1.87 }, { name: 'Warriors', price: 1.95 }] }]
        },
        {
          key: 'draftkings',
          title: 'DraftKings',
          markets: [{ key: 'h2h', outcomes: [{ name: 'Lakers', price: 1.90 }, { name: 'Warriors', price: 1.90 }] }]
        },
        {
          key: 'betmgm',
          title: 'BetMGM',
          markets: [{ key: 'h2h', outcomes: [{ name: 'Lakers', price: 1.85 }, { name: 'Warriors', price: 1.96 }] }]
        }
      ]
    },
    {
      id: '2',
      sport_key: 'americanfootball_nfl',
      sport_title: 'NFL',
      commence_time: getGameTime(24),
      home_team: 'Chiefs',
      away_team: 'Ravens',
      bookmakers: [
        {
          key: 'fan_duel',
          title: 'FanDuel',
          markets: [{ key: 'h2h', outcomes: [{ name: 'Chiefs', price: 1.75 }, { name: 'Ravens', price: 2.10 }] }]
        },
        {
          key: 'draftkings',
          title: 'DraftKings',
          markets: [{ key: 'h2h', outcomes: [{ name: 'Chiefs', price: 1.72 }, { name: 'Ravens', price: 2.15 }] }]
        }
      ]
    },
    {
      id: '3',
      sport_key: 'baseball_mlb',
      sport_title: 'MLB',
      commence_time: getGameTime(5),
      home_team: 'Yankees',
      away_team: 'Red Sox',
      bookmakers: [
        {
          key: 'fan_duel',
          title: 'FanDuel',
          markets: [{ key: 'h2h', outcomes: [{ name: 'Yankees', price: 1.65 }, { name: 'Red Sox', price: 2.30 }] }]
        }
      ]
    }
  ];
};

