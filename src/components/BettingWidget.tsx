import React, { useState, useEffect } from 'react';
import { getOddsByBookmaker, clearCache } from '../services/theOddsApi';
import type { Game, MarketType } from '../services/theOddsApi';
import { BookmakerBox } from './BookmakerBox';
import { Loader2, RefreshCw, Trophy, ChevronDown } from 'lucide-react';

export const BettingWidget: React.FC = () => {
  const [marketType, setMarketType] = useState<MarketType>('h2h');
  const [fanduelGames, setFanduelGames] = useState<Game[]>([]);
  const [draftkingsGames, setDraftkingsGames] = useState<Game[]>([]);
  const [betmgmGames, setBetmgmGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch data for all bookmakers
  const fetchData = async (forceRefresh = false) => {
    if (forceRefresh) {
      setIsRefreshing(true);
      clearCache();
    } else {
      setLoading(true);
    }

    try {
      const [fanduel, draftkings, betmgm] = await Promise.all([
        getOddsByBookmaker('fanduel', marketType),
        getOddsByBookmaker('draftkings', marketType),
        getOddsByBookmaker('betmgm', marketType),
      ]);

      setFanduelGames(fanduel);
      setDraftkingsGames(draftkings);
      setBetmgmGames(betmgm);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [marketType]);

  const marketTypeLabels: Record<MarketType, string> = {
    h2h: 'Moneyline (Winner)',
    spreads: 'Point Spread',
    totals: 'Over/Under'
  };

  return (
    <div className="max-w-[1600px] w-full mx-auto p-3 h-fit bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-sans border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm flex flex-col relative transition-colors">
      <header className="mb-4 shrink-0 relative z-10 bg-white dark:bg-gray-900 pb-3 border-b border-gray-100 dark:border-gray-800 transition-colors">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Left: Title */}
          <div className="flex items-center gap-2 shrink-0">
            <Trophy className="w-4 h-4 text-black dark:text-white" />
            <h1 className="text-sm font-bold tracking-tight text-black dark:text-white whitespace-nowrap">
              US Betting Odds
            </h1>
          </div>

          {/* Center: Market Type Selector */}
          <div className="flex-1 max-w-[250px] relative">
            <select
              value={marketType}
              onChange={(e) => setMarketType(e.target.value as MarketType)}
              className="appearance-none w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 pr-8 cursor-pointer font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {(Object.keys(marketTypeLabels) as MarketType[]).map((type) => (
                <option key={type} value={type}>
                  {marketTypeLabels[type]}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500 dark:text-gray-400">
              <ChevronDown className="w-3 h-3" />
            </div>
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
              title="Force Refresh (Clears 6h Cache)"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>
        </div>
      </header>

      <main className="relative">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 h-[600px]">
          <BookmakerBox
            bookmakerName="FanDuel"
            bookmakerColor="bg-blue-600"
            games={fanduelGames}
            loading={loading}
          />
          <BookmakerBox
            bookmakerName="DraftKings"
            bookmakerColor="bg-green-600"
            games={draftkingsGames}
            loading={loading}
          />
          <BookmakerBox
            bookmakerName="BetMGM"
            bookmakerColor="bg-amber-600"
            games={betmgmGames}
            loading={loading}
          />
        </div>
      </main>
    </div>
  );
};
