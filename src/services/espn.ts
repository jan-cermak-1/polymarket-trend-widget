import axios from 'axios';

const BASE_URL = 'https://site.api.espn.com/apis/site/v2/sports';

export type SportType = 'nfl' | 'nhl' | 'nba' | 'mlb';

export interface SportConfig {
  path: string;
  color: string;
  darkColor: string;
  icon: string;
  name: string;
}

export const SPORT_CONFIGS: Record<SportType, SportConfig> = {
  nfl: {
    path: 'football/nfl',
    color: 'red-600',
    darkColor: 'red-500',
    icon: 'Football',
    name: 'NFL'
  },
  nhl: {
    path: 'hockey/nhl',
    color: 'blue-600',
    darkColor: 'blue-500',
    icon: 'Disc3',
    name: 'NHL'
  },
  nba: {
    path: 'basketball/nba',
    color: 'orange-600',
    darkColor: 'orange-500',
    icon: 'Dribbble',
    name: 'NBA'
  },
  mlb: {
    path: 'baseball/mlb',
    color: 'green-600',
    darkColor: 'green-500',
    icon: 'Target',
    name: 'MLB'
  }
};

export interface Team {
  id: string;
  displayName: string;
  abbreviation: string;
  logo: string;
  color?: string;
  score?: string;
  record?: string;
}

export interface GameStatus {
  type: {
    name: string;
    state: string;
    completed: boolean;
    description: string;
    detail: string;
    shortDetail: string;
  };
  displayClock?: string;
  period?: number;
}

export interface ESPNGame {
  id: string;
  name: string;
  shortName: string;
  date: string;
  status: GameStatus;
  homeTeam: Team;
  awayTeam: Team;
  venue?: string;
}

export interface StandingsTeam {
  team: Team;
  stats: {
    wins: number;
    losses: number;
    ties?: number;
    winPercent: number;
    gamesPlayed: number;
  };
  rank: number;
}

export const getScoreboard = async (sport: SportType): Promise<ESPNGame[]> => {
  try {
    const config = SPORT_CONFIGS[sport];
    const response = await axios.get(`${BASE_URL}/${config.path}/scoreboard`, {
      timeout: 10000
    });

    const events = response.data.events || [];
    
    return events.map((event: any): ESPNGame => {
      const competition = event.competitions?.[0];
      const homeCompetitor = competition?.competitors?.find((c: any) => c.homeAway === 'home');
      const awayCompetitor = competition?.competitors?.find((c: any) => c.homeAway === 'away');

      return {
        id: event.id,
        name: event.name,
        shortName: event.shortName,
        date: event.date,
        status: event.status,
        homeTeam: {
          id: homeCompetitor?.team?.id || '',
          displayName: homeCompetitor?.team?.displayName || '',
          abbreviation: homeCompetitor?.team?.abbreviation || '',
          logo: homeCompetitor?.team?.logo || '',
          score: homeCompetitor?.score || '0',
          record: homeCompetitor?.records?.[0]?.summary || ''
        },
        awayTeam: {
          id: awayCompetitor?.team?.id || '',
          displayName: awayCompetitor?.team?.displayName || '',
          abbreviation: awayCompetitor?.team?.abbreviation || '',
          logo: awayCompetitor?.team?.logo || '',
          score: awayCompetitor?.score || '0',
          record: awayCompetitor?.records?.[0]?.summary || ''
        },
        venue: competition?.venue?.fullName
      };
    });
  } catch (error) {
    console.error(`Error fetching ${sport} scoreboard:`, error);
    return [];
  }
};

export const getStandings = async (sport: SportType): Promise<StandingsTeam[]> => {
  try {
    const config = SPORT_CONFIGS[sport];
    const response = await axios.get(`${BASE_URL}/${config.path}/standings`, {
      timeout: 10000
    });

    const standings = response.data.children?.[0]?.standings?.entries || [];
    
    return standings.slice(0, 8).map((entry: any, index: number): StandingsTeam => {
      const stats = entry.stats || [];
      const getStatValue = (name: string) => {
        const stat = stats.find((s: any) => s.name === name);
        return stat ? parseFloat(stat.value) : 0;
      };

      return {
        team: {
          id: entry.team?.id || '',
          displayName: entry.team?.displayName || '',
          abbreviation: entry.team?.abbreviation || '',
          logo: entry.team?.logos?.[0]?.href || '',
        },
        stats: {
          wins: getStatValue('wins'),
          losses: getStatValue('losses'),
          ties: getStatValue('ties'),
          winPercent: getStatValue('winPercent'),
          gamesPlayed: getStatValue('gamesPlayed')
        },
        rank: index + 1
      };
    });
  } catch (error) {
    console.error(`Error fetching ${sport} standings:`, error);
    return [];
  }
};

