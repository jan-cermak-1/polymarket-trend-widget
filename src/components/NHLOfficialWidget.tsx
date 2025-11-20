import React, { useState, useEffect, useCallback } from 'react';
import { getSchedule, getStandings } from '../services/nhlOfficial';
import type { NHLGame, NHLStanding } from '../services/nhlOfficial';
import { Disc3, RefreshCw } from 'lucide-react';

export const NHLOfficialWidget: React.FC = () => {
  const [games, setGames] = useState<NHLGame[]>([]);
  const [standings, setStandings] = useState<NHLStanding[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchData = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    
    try {
      const [gamesData, standingsData] = await Promise.all([
        getSchedule(),
        getStandings()
      ]);
      
      setGames(gamesData);
      setStandings(standingsData);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to fetch NHL data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    
    // Auto-refresh every 60 seconds
    const interval = setInterval(() => {
      fetchData(false);
    }, 60000);

    return () => clearInterval(interval);
  }, [fetchData]);

  const getGameStatus = (game: NHLGame) => {
    if (game.gameState === 'LIVE' || game.gameState === 'CRIT') {
      return (
        <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400">
          <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse"></div>
          <span>LIVE</span>
          {game.clock?.timeRemaining && (
            <span className="text-gray-600 dark:text-gray-400 font-normal">
              {game.clock.timeRemaining}
            </span>
          )}
        </div>
      );
    }
    
    if (game.gameState === 'FUT' || game.gameState === 'PRE') {
      const gameDate = new Date(game.gameDate);
      return (
        <div className="text-xs text-gray-600 dark:text-gray-400">
          {gameDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
        </div>
      );
    }
    
    return (
      <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">
        FINAL{game.period && game.period > 3 ? ' (OT)' : ''}
      </div>
    );
  };

  return (
    <div className="max-w-[1600px] w-full mx-auto p-3 h-fit bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-sans border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm flex flex-col relative transition-colors">
      <header className="mb-4 shrink-0 relative z-10 bg-white dark:bg-gray-900 pb-3 border-b border-gray-100 dark:border-gray-800 transition-colors">
        <div className="flex items-center justify-between gap-3">
          {/* Left: Title */}
          <div className="flex items-center gap-2">
            <Disc3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h1 className="text-sm font-bold tracking-tight text-black dark:text-white">
              NHL Official
            </h1>
            <span className="text-[10px] text-gray-500 dark:text-gray-400">
              Official NHL API
            </span>
          </div>

          {/* Right: Last Update & Refresh */}
          <div className="flex items-center gap-2 text-[10px] text-gray-500 dark:text-gray-400">
            <span className="hidden sm:inline">
              {lastUpdate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
            </span>
            <button
              onClick={() => fetchData()}
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
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Games Grid */}
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-3">
              {games.length === 0 ? (
                <div className="col-span-2 text-center py-12 px-4">
                  <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">No games today</p>
                </div>
              ) : (
                games.slice(0, 12).map((game) => (
                  <div key={game.id} className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-all">
                    {/* Status */}
                    <div className="flex justify-between items-center mb-3">
                      {getGameStatus(game)}
                      {game.periodDescriptor && (
                        <span className="text-[10px] text-gray-500 dark:text-gray-400">
                          Period {game.periodDescriptor.number}
                        </span>
                      )}
                    </div>

                    {/* Away Team */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {game.awayTeam.logo && (
                          <img 
                            src={game.awayTeam.logo} 
                            alt={game.awayTeam.abbreviation}
                            className="w-6 h-6 object-contain"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                        )}
                        <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {game.awayTeam.name}
                        </span>
                      </div>
                      {game.awayTeam.score !== undefined && (
                        <div className="text-xl font-bold text-gray-900 dark:text-white">
                          {game.awayTeam.score}
                        </div>
                      )}
                    </div>

                    {/* Home Team */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {game.homeTeam.logo && (
                          <img 
                            src={game.homeTeam.logo} 
                            alt={game.homeTeam.abbreviation}
                            className="w-6 h-6 object-contain"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                        )}
                        <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {game.homeTeam.name}
                        </span>
                      </div>
                      {game.homeTeam.score !== undefined && (
                        <div className="text-xl font-bold text-gray-900 dark:text-white">
                          {game.homeTeam.score}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Standings Sidebar */}
            <div className="hidden lg:block">
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Standings</h3>
                {standings.slice(0, 12).map((team, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-sm transition-all"
                  >
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 dark:bg-blue-500 text-white text-xs font-bold">
                      {index + 1}
                    </div>
                    {team.teamLogo && (
                      <img 
                        src={team.teamLogo} 
                        alt={team.teamAbbrev.default}
                        className="w-5 h-5 object-contain"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                        {team.teamAbbrev.default}
                      </div>
                      <div className="text-[10px] text-gray-500 dark:text-gray-400">
                        {team.wins}-{team.losses}-{team.otLosses}
                      </div>
                    </div>
                    <div className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      {team.points} pts
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

