import React, { memo } from 'react';
import type { Game } from '../services/theOddsApi';
import { Clock } from 'lucide-react';

interface BookmakerBoxProps {
  bookmakerName: string;
  bookmakerColor: string;
  games: Game[];
  loading: boolean;
}

const BookmakerBoxComponent: React.FC<BookmakerBoxProps> = ({ 
  bookmakerName, 
  bookmakerColor,
  games, 
  loading 
}) => {
  const formatGameTime = (isoDate: string) => {
    const date = new Date(isoDate);
    return date.toLocaleString('en-US', { 
      weekday: 'short', 
      month: 'short',
      day: 'numeric',
      hour: 'numeric', 
      minute: '2-digit' 
    });
  };

  const getOdds = (game: Game): { home: string; away: string; homePoint?: number; awayPoint?: number } => {
    const bookie = game.bookmakers[0];
    if (!bookie) return { home: '-', away: '-' };
    
    const market = bookie.markets[0];
    if (!market || !market.outcomes || market.outcomes.length < 2) {
      return { home: '-', away: '-' };
    }

    const [outcome1, outcome2] = market.outcomes;
    
    return {
      home: outcome1.price.toFixed(2),
      away: outcome2.price.toFixed(2),
      homePoint: outcome1.point,
      awayPoint: outcome2.point
    };
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      {/* Header */}
      <div className={`${bookmakerColor} p-3 text-white`}>
        <h3 className="text-base font-bold text-center">{bookmakerName}</h3>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {loading ? (
          <div className="p-2 space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-50 dark:bg-gray-800 rounded-md animate-pulse" />
            ))}
          </div>
        ) : games.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
            No games available
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {games.map((game) => {
              const odds = getOdds(game);
              return (
                <div key={game.id} className="p-2.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  {/* Sport & Time */}
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-medium">
                      {game.sport_title}
                    </span>
                    <span className="text-[9px] text-gray-400 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      {formatGameTime(game.commence_time)}
                    </span>
                  </div>

                  {/* Teams */}
                  <div className="text-xs font-medium text-gray-900 dark:text-white mb-2">
                    <div className="flex items-center justify-between">
                      <span className="truncate flex-1">{game.home_team}</span>
                      <span className="ml-2 px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 rounded text-blue-700 dark:text-blue-300 font-bold">
                        {odds.home}
                        {odds.homePoint !== undefined && (
                          <span className="ml-1 text-[10px]">({odds.homePoint > 0 ? '+' : ''}{odds.homePoint})</span>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="truncate flex-1">{game.away_team}</span>
                      <span className="ml-2 px-2 py-0.5 bg-gray-50 dark:bg-gray-800 rounded text-gray-600 dark:text-gray-400 font-bold">
                        {odds.away}
                        {odds.awayPoint !== undefined && (
                          <span className="ml-1 text-[10px]">({odds.awayPoint > 0 ? '+' : ''}{odds.awayPoint})</span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export const BookmakerBox = memo(BookmakerBoxComponent);

