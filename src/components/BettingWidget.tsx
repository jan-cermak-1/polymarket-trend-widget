import React, { useState, useEffect } from 'react';
import { getUpcomingOdds } from '../services/theOddsApi';
import type { Game, Bookmaker } from '../services/theOddsApi';
import { Loader2, RefreshCw, Trophy, Clock, AlertTriangle } from 'lucide-react';
import { clsx } from 'clsx';

export const BettingWidget: React.FC = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch data on mount
  const fetchData = async (forceRefresh = false) => {
    if (forceRefresh) {
        setIsRefreshing(true);
        // Clear cache to force new fetch
        localStorage.removeItem('odds_api_cache');
    } else {
        setLoading(true);
    }

    try {
      const data = await getUpcomingOdds();
      setGames(data);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Helper to format time
  const formatGameTime = (isoDate: string) => {
    const date = new Date(isoDate);
    return date.toLocaleString('en-US', { weekday: 'short', hour: 'numeric', minute: '2-digit' });
  };

  // Helper to find odds for a specific team from a bookmaker
  const getOdds = (game: Game, bookieKey: string, teamName: string): string => {
    const bookie = game.bookmakers.find(b => b.key === bookieKey);
    if (!bookie) return '-';
    
    const market = bookie.markets.find(m => m.key === 'h2h');
    if (!market) return '-';
    
    const outcome = market.outcomes.find(o => o.name === teamName);
    return outcome ? outcome.price.toFixed(2) : '-';
  };

  return (
    <div className="max-w-[1600px] w-full mx-auto p-3 h-fit bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-sans border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm flex flex-col relative transition-colors">
      <header className="mb-4 shrink-0 relative z-10 bg-white dark:bg-gray-900 pb-2 border-b border-gray-100 dark:border-gray-800 transition-colors">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Title */}
          <div className="flex items-center gap-2 shrink-0">
            <Trophy className="w-4 h-4 text-black dark:text-white" />
            <h1 className="text-sm font-bold tracking-tight text-black dark:text-white whitespace-nowrap">US Betting Odds (Upcoming)</h1>
          </div>
          
          {/* Center: Disclaimer */}
           <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded">
                <AlertTriangle className="w-3 h-3" />
                <span>Cached data (6h) to save API limits</span>
           </div>
          
          {/* Right: Refresh */}
          <div className="flex items-center gap-2 text-[10px] text-gray-500 dark:text-gray-400 font-medium shrink-0">
            {isRefreshing && (
              <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span className="hidden sm:inline">Updating...</span>
              </span>
            )}
            
            <button 
              onClick={() => fetchData(true)}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
              title="Force Refresh (Uses API Quota)"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>
        </div>
      </header>

      <main className="relative">
        {loading ? (
          <div className="flex flex-col gap-2">
             {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-50 dark:bg-gray-800 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : games.length === 0 ? (
          <div className="text-center py-12 px-4">
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">No upcoming games found</p>
          </div>
        ) : (
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="text-[11px] text-gray-500 dark:text-gray-400 uppercase border-b border-gray-100 dark:border-gray-800">
                            <th className="py-2 px-3 font-semibold w-[40%]">Matchup</th>
                            <th className="py-2 px-3 font-semibold text-center">FanDuel</th>
                            <th className="py-2 px-3 font-semibold text-center">DraftKings</th>
                            <th className="py-2 px-3 font-semibold text-center">BetMGM</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                        {games.map((game) => (
                            <tr key={game.id} className="group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                <td className="py-3 px-3 align-middle">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-medium">
                                                {game.sport_title}
                                            </span>
                                            <span className="text-[10px] text-gray-400 flex items-center gap-1">
                                                <Clock className="w-2.5 h-2.5" />
                                                {formatGameTime(game.commence_time)}
                                            </span>
                                        </div>
                                        <div className="font-bold text-sm text-gray-900 dark:text-white">
                                            {game.home_team} <span className="text-gray-400 font-normal mx-1">vs</span> {game.away_team}
                                        </div>
                                    </div>
                                </td>
                                {/* FanDuel */}
                                <td className="py-3 px-3 align-middle text-center">
                                    <div className="flex flex-col items-center justify-center gap-1 text-xs font-medium text-gray-700 dark:text-gray-300">
                                        <div className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 rounded min-w-[60px]">
                                            {getOdds(game, 'fan_duel', game.home_team)}
                                        </div>
                                        <div className="px-2 py-1 bg-gray-50 dark:bg-gray-800 rounded min-w-[60px] text-gray-500">
                                            {getOdds(game, 'fan_duel', game.away_team)}
                                        </div>
                                    </div>
                                </td>
                                {/* DraftKings */}
                                <td className="py-3 px-3 align-middle text-center">
                                    <div className="flex flex-col items-center justify-center gap-1 text-xs font-medium text-gray-700 dark:text-gray-300">
                                        <div className="px-2 py-1 bg-green-50 dark:bg-green-900/20 rounded min-w-[60px]">
                                            {getOdds(game, 'draftkings', game.home_team)}
                                        </div>
                                        <div className="px-2 py-1 bg-gray-50 dark:bg-gray-800 rounded min-w-[60px] text-gray-500">
                                            {getOdds(game, 'draftkings', game.away_team)}
                                        </div>
                                    </div>
                                </td>
                                {/* BetMGM */}
                                <td className="py-3 px-3 align-middle text-center">
                                    <div className="flex flex-col items-center justify-center gap-1 text-xs font-medium text-gray-700 dark:text-gray-300">
                                        <div className="px-2 py-1 bg-amber-50 dark:bg-amber-900/20 rounded min-w-[60px]">
                                            {getOdds(game, 'betmgm', game.home_team)}
                                        </div>
                                        <div className="px-2 py-1 bg-gray-50 dark:bg-gray-800 rounded min-w-[60px] text-gray-500">
                                            {getOdds(game, 'betmgm', game.away_team)}
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
      </main>
    </div>
  );
};

