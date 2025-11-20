import axios from 'axios';

const BASE_URL = 'https://v1.american-football.api-sports.io';
const API_KEY_STORAGE_KEY = 'api-sports-key';
const CACHE_KEY = 'api-sports-cache';
const CACHE_TIMESTAMP_KEY = 'api-sports-cache-timestamp';
const CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 hours

export const getApiKey = (): string | null => {
  return localStorage.getItem(API_KEY_STORAGE_KEY);
};

export const setApiKey = (key: string): void => {
  localStorage.setItem(API_KEY_STORAGE_KEY, key);
  // Clear cache when API key changes
  clearCache();
};

export const clearCache = (): void => {
  localStorage.removeItem(CACHE_KEY);
  localStorage.removeItem(CACHE_TIMESTAMP_KEY);
};

export interface APISportsGame {
  game: {
    id: number;
    stage: string;
    week: string;
    date: {
      timezone: string;
      date: string;
      time: string;
      timestamp: number;
    };
    venue: {
      name: string;
      city: string;
    };
    status: {
      short: string;
      long: string;
      timer: string | null;
    };
  };
  league: {
    name: string;
    season: string;
  };
  teams: {
    home: {
      id: number;
      name: string;
      logo: string;
    };
    away: {
      id: number;
      name: string;
      logo: string;
    };
  };
  scores: {
    home: {
      total: number;
    };
    away: {
      total: number;
    };
  };
}

export interface APIUsage {
  requests: {
    current: number;
    limit_day: number;
  };
}

export const getGames = async (): Promise<{ games: APISportsGame[]; usage?: APIUsage }> => {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    throw new Error('API key not configured');
  }

  // Check cache first
  const cachedData = localStorage.getItem(CACHE_KEY);
  const cacheTimestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
  
  if (cachedData && cacheTimestamp) {
    const age = Date.now() - parseInt(cacheTimestamp, 10);
    if (age < CACHE_DURATION) {
      console.log('API-SPORTS: Using cached data');
      return JSON.parse(cachedData);
    }
  }

  try {
    const response = await axios.get(`${BASE_URL}/games`, {
      headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': 'v1.american-football.api-sports.io'
      },
      params: {
        league: '1', // NFL
        season: new Date().getFullYear().toString()
      },
      timeout: 10000
    });

    const result = {
      games: response.data.response || [],
      usage: {
        requests: {
          current: parseInt(response.headers['x-ratelimit-requests-remaining'] || '0', 10),
          limit_day: parseInt(response.headers['x-ratelimit-requests-limit'] || '100', 10)
        }
      }
    };

    // Cache the result
    localStorage.setItem(CACHE_KEY, JSON.stringify(result));
    localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());

    return result;
  } catch (error: any) {
    if (error.response?.status === 401 || error.response?.status === 403) {
      throw new Error('Invalid API key');
    }
    if (error.response?.status === 429) {
      throw new Error('Rate limit exceeded');
    }
    console.error('Error fetching API-SPORTS data:', error);
    throw error;
  }
};

