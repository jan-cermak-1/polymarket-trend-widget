import axios from 'axios';

const BASE_URL = 'https://api-web.nhle.com/v1';

export interface NHLTeam {
  id: number;
  name: string;
  abbreviation: string;
  logo: string;
  teamName?: {
    default: string;
  };
}

export interface NHLGame {
  id: number;
  gameDate: string;
  gameState: string;
  gameType: number;
  season: number;
  homeTeam: NHLTeam & {
    score?: number;
    logo?: string;
  };
  awayTeam: NHLTeam & {
    score?: number;
    logo?: string;
  };
  period?: number;
  periodDescriptor?: {
    number: number;
    periodType: string;
  };
  clock?: {
    timeRemaining: string;
    running: boolean;
  };
  venue?: {
    default: string;
  };
}

export interface NHLStanding {
  teamName: {
    default: string;
  };
  teamAbbrev: {
    default: string;
  };
  teamLogo: string;
  wins: number;
  losses: number;
  otLosses: number;
  points: number;
  gamesPlayed: number;
  goalDifferential: number;
  goalsFor: number;
  goalsAgainst: number;
  winPct: number;
}

export interface NHLTeamStats {
  teamName: string;
  wins: number;
  losses: number;
  otLosses: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  shotsForPerGame: number;
  shotsAgainstPerGame: number;
  powerPlayPct: number;
  penaltyKillPct: number;
}

export const getSchedule = async (): Promise<NHLGame[]> => {
  try {
    const response = await axios.get(`${BASE_URL}/schedule/now`, {
      timeout: 10000
    });

    const games: NHLGame[] = [];
    const gameWeek = response.data.gameWeek || [];

    gameWeek.forEach((week: any) => {
      const weekGames = week.games || [];
      weekGames.forEach((game: any) => {
        games.push({
          id: game.id,
          gameDate: game.startTimeUTC,
          gameState: game.gameState,
          gameType: game.gameType,
          season: game.season,
          homeTeam: {
            id: game.homeTeam.id,
            name: game.homeTeam.name?.default || game.homeTeam.placeName?.default || '',
            abbreviation: game.homeTeam.abbrev,
            logo: `https://assets.nhle.com/logos/nhl/svg/${game.homeTeam.abbrev}_light.svg`,
            score: game.homeTeam.score
          },
          awayTeam: {
            id: game.awayTeam.id,
            name: game.awayTeam.name?.default || game.awayTeam.placeName?.default || '',
            abbreviation: game.awayTeam.abbrev,
            logo: `https://assets.nhle.com/logos/nhl/svg/${game.awayTeam.abbrev}_light.svg`,
            score: game.awayTeam.score
          },
          period: game.period,
          periodDescriptor: game.periodDescriptor,
          clock: game.clock,
          venue: game.venue
        });
      });
    });

    return games;
  } catch (error) {
    console.error('Error fetching NHL schedule:', error);
    return [];
  }
};

export const getStandings = async (): Promise<NHLStanding[]> => {
  try {
    const response = await axios.get(`${BASE_URL}/standings/now`, {
      timeout: 10000
    });

    const standings = response.data.standings || [];
    
    return standings.slice(0, 16).map((team: any): NHLStanding => ({
      teamName: team.teamName || { default: '' },
      teamAbbrev: team.teamAbbrev || { default: '' },
      teamLogo: `https://assets.nhle.com/logos/nhl/svg/${team.teamAbbrev.default}_light.svg`,
      wins: team.wins || 0,
      losses: team.losses || 0,
      otLosses: team.otLosses || 0,
      points: team.points || 0,
      gamesPlayed: team.gamesPlayed || 0,
      goalDifferential: team.goalDifferential || 0,
      goalsFor: team.goalFor || 0,
      goalsAgainst: team.goalAgainst || 0,
      winPct: team.winPct || 0
    }));
  } catch (error) {
    console.error('Error fetching NHL standings:', error);
    return [];
  }
};

