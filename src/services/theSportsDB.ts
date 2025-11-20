import axios from 'axios';

const BASE_URL = 'https://www.thesportsdb.com/api/v1/json/3';

export type LeagueType = 'nfl' | 'nhl' | 'nba' | 'mlb' | 'premier' | 'laliga' | 'bundesliga' | 'seriea';

export interface LeagueConfig {
  id: string;
  name: string;
  color: string;
  darkColor: string;
  type: 'us' | 'soccer';
}

export const LEAGUE_CONFIGS: Record<LeagueType, LeagueConfig> = {
  nfl: { id: '4391', name: 'NFL', color: 'red-600', darkColor: 'red-500', type: 'us' },
  nhl: { id: '4380', name: 'NHL', color: 'blue-600', darkColor: 'blue-500', type: 'us' },
  nba: { id: '4387', name: 'NBA', color: 'orange-600', darkColor: 'orange-500', type: 'us' },
  mlb: { id: '4424', name: 'MLB', color: 'green-600', darkColor: 'green-500', type: 'us' },
  premier: { id: '4328', name: 'Premier League', color: 'purple-600', darkColor: 'purple-400', type: 'soccer' },
  laliga: { id: '4335', name: 'La Liga', color: 'purple-600', darkColor: 'purple-400', type: 'soccer' },
  bundesliga: { id: '4331', name: 'Bundesliga', color: 'purple-600', darkColor: 'purple-400', type: 'soccer' },
  seriea: { id: '4332', name: 'Serie A', color: 'purple-600', darkColor: 'purple-400', type: 'soccer' }
};

export interface SportsDBTeam {
  idTeam: string;
  strTeam: string;
  strTeamBadge: string;
  strTeamLogo?: string;
}

export interface SportsDBEvent {
  idEvent: string;
  strEvent: string;
  strEventAlternate?: string;
  dateEvent: string;
  strTime?: string;
  strTimeLocal?: string;
  idHomeTeam: string;
  idAwayTeam: string;
  strHomeTeam: string;
  strAwayTeam: string;
  intHomeScore?: string;
  intAwayScore?: string;
  strStatus?: string;
  strProgress?: string;
  strHomeTeamBadge?: string;
  strAwayTeamBadge?: string;
}

export const getEvents = async (league: LeagueType): Promise<SportsDBEvent[]> => {
  try {
    const config = LEAGUE_CONFIGS[league];
    
    // Try to get recent past events
    const pastResponse = await axios.get(`${BASE_URL}/eventspastleague.php?id=${config.id}`, {
      timeout: 10000
    });
    
    // Try to get upcoming events
    const nextResponse = await axios.get(`${BASE_URL}/eventsnextleague.php?id=${config.id}`, {
      timeout: 10000
    }).catch(() => ({ data: { events: [] } }));

    const pastEvents = pastResponse.data.events || [];
    const nextEvents = nextResponse.data.events || [];
    
    // Combine and sort by date
    const allEvents = [...pastEvents.slice(0, 8), ...nextEvents.slice(0, 8)];
    
    return allEvents.map((event: any): SportsDBEvent => ({
      idEvent: event.idEvent,
      strEvent: event.strEvent,
      strEventAlternate: event.strEventAlternate,
      dateEvent: event.dateEvent,
      strTime: event.strTime,
      strTimeLocal: event.strTimeLocal,
      idHomeTeam: event.idHomeTeam,
      idAwayTeam: event.idAwayTeam,
      strHomeTeam: event.strHomeTeam,
      strAwayTeam: event.strAwayTeam,
      intHomeScore: event.intHomeScore,
      intAwayScore: event.intAwayScore,
      strStatus: event.strStatus,
      strProgress: event.strProgress,
      strHomeTeamBadge: event.strHomeTeamBadge,
      strAwayTeamBadge: event.strAwayTeamBadge
    }));
  } catch (error) {
    console.error(`Error fetching ${league} events:`, error);
    return [];
  }
};

