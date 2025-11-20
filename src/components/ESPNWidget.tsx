import React, { useState, useEffect, useCallback } from 'react';
import { getScoreboard, getStandings, SPORT_CONFIGS } from '../services/espn';
import type { SportType, ESPNGame, StandingsTeam } from '../services/espn';
import { ESPNGameCard } from './ESPNGameCard';
import { ESPNStandings } from './ESPNStandings';
import { Trophy, RefreshCw } from 'lucide-react';

export const ESPNWidget: React.FC = () => {
  const [selectedSport, setSelectedSport] = useState<SportType>('nfl');
  const [games, setGames] = useState<ESPNGame[]>([]);
  const [standings, setStandings] = useState<StandingsTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchData = useCallback(async (sport: SportType, showLoader = true) => {
    if (showLoader) setLoading(true);
    
    try {
      const [gamesData, standingsData] = await Promise.all([
        getScoreboard(sport),
        getStandings(sport)
      ]);
      
      setGames(gamesData);
      setStandings(standingsData);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to fetch ESPN data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(selectedSport);
    
    // Auto-refresh every 60 seconds
    const interval = setInterval(() => {
      fetchData(selectedSport, false);
    }, 60000);

    return () => clearInterval(interval);
  }, [selectedSport, fetchData]);

  const handleSportChange = (sport: SportType) => {
    setSelectedSport(sport);
  };

  const handleRefresh = () => {
    fetchData(selectedSport);
  };

  const config = SPORT_CONFIGS[selectedSport];

  return (
    <div className="max-w-[1600px] w-full mx-auto p-3 h-fit bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-sans border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm flex flex-col relative transition-colors">
      <header className="mb-4 shrink-0 relative z-10 bg-white dark:bg-gray-900 pb-3 border-b border-gray-100 dark:border-gray-800 transition-colors">
        <div className="flex flex-wrap lg:flex-nowrap items-center justify-between gap-3 lg:gap-4">
          {/* Left: Title */}
          <div className="flex items-center gap-2 shrink-0">
            <Trophy className="w-4 h-4 text-gray-700 dark:text-gray-300" />
            <h1 className="text-sm font-bold tracking-tight text-black dark:text-white whitespace-nowrap">
              US Sports Live
            </h1>
          </div>
          
          {/* Center: Sport Tabs */}
          <div className="flex gap-2 items-center justify-center flex-1">
            {(Object.keys(SPORT_CONFIGS) as SportType[]).map((sport) => {
              const sportConfig = SPORT_CONFIGS[sport];
              const isSelected = selectedSport === sport;
              
              return (
                <button
                  key={sport}
                  onClick={() => handleSportChange(sport)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                    isSelected
                      ? `bg-${sportConfig.color} dark:bg-${sportConfig.darkColor} text-white shadow-md`
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {sportConfig.name}
                </button>
              );
            })}
          </div>

          {/* Right: Last Update & Refresh */}
          <div className="flex items-center gap-2 text-[10px] text-gray-500 dark:text-gray-400 shrink-0">
            <span className="hidden sm:inline">
              {lastUpdate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
            </span>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      <main className="relative">
        {loading && games.length === 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-50 dark:bg-gray-800 rounded-lg animate-pulse" />
              ))}
            </div>
            <div className="hidden lg:block">
              <div className="h-96 bg-gray-50 dark:bg-gray-800 rounded-lg animate-pulse" />
            </div>
          </div>
        ) : games.length === 0 ? (
          <div className="text-center py-12 px-4">
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">No games found</p>
            <p className="text-gray-400 dark:text-gray-500 text-xs">
              Check back later for upcoming {config.name} games.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Games Grid - 2/3 width on desktop */}
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-3">
              {games.slice(0, 12).map((game) => (
                <ESPNGameCard key={game.id} game={game} sport={selectedSport} />
              ))}
            </div>

            {/* Standings Sidebar - 1/3 width on desktop, hidden on mobile */}
            <div className="hidden lg:block">
              <ESPNStandings 
                standings={standings} 
                sport={selectedSport}
                loading={loading}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

