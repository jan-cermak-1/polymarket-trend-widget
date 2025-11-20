import React from 'react';
import type { ESPNGame, SportType } from '../services/espn';
import { SPORT_CONFIGS } from '../services/espn';

interface ESPNGameCardProps {
  game: ESPNGame;
  sport: SportType;
}

export const ESPNGameCard: React.FC<ESPNGameCardProps> = ({ game, sport }) => {
  const config = SPORT_CONFIGS[sport];
  const isLive = game.status.type.state === 'in';
  const isFinal = game.status.type.completed;
  const isScheduled = game.status.type.state === 'pre';

  const getStatusDisplay = () => {
    if (isLive) {
      return (
        <div className={`flex items-center gap-1.5 text-xs font-bold text-${config.color} dark:text-${config.darkColor}`}>
          <div className={`w-2 h-2 rounded-full bg-${config.color} dark:bg-${config.darkColor} animate-pulse`}></div>
          <span>LIVE</span>
          {game.status.displayClock && (
            <span className="text-gray-600 dark:text-gray-400 font-normal">
              {game.status.displayClock}
            </span>
          )}
        </div>
      );
    }
    
    if (isFinal) {
      return (
        <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">
          FINAL
        </div>
      );
    }
    
    // Scheduled
    const gameDate = new Date(game.date);
    const today = new Date();
    const isToday = gameDate.toDateString() === today.toDateString();
    const isTomorrow = gameDate.toDateString() === new Date(today.getTime() + 86400000).toDateString();
    
    let datePrefix = '';
    if (isToday) datePrefix = 'Today ';
    else if (isTomorrow) datePrefix = 'Tomorrow ';
    
    return (
      <div className="text-xs text-gray-600 dark:text-gray-400">
        {datePrefix}{gameDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
      </div>
    );
  };

  return (
    <div className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-all duration-200">
      {/* Status */}
      <div className="flex justify-between items-center mb-3">
        {getStatusDisplay()}
        {game.status.type.detail && !isScheduled && (
          <span className="text-[10px] text-gray-500 dark:text-gray-400">
            {game.status.type.detail}
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
              className="w-6 h-6 object-contain shrink-0"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          )}
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">
              {game.awayTeam.displayName}
            </span>
            {game.awayTeam.record && (
              <span className="text-[10px] text-gray-500 dark:text-gray-400">
                {game.awayTeam.record}
              </span>
            )}
          </div>
        </div>
        {(!isScheduled || isLive || isFinal) && (
          <div className={`text-xl font-bold ${
            isLive || isFinal ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'
          }`}>
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
              className="w-6 h-6 object-contain shrink-0"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          )}
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">
              {game.homeTeam.displayName}
            </span>
            {game.homeTeam.record && (
              <span className="text-[10px] text-gray-500 dark:text-gray-400">
                {game.homeTeam.record}
              </span>
            )}
          </div>
        </div>
        {(!isScheduled || isLive || isFinal) && (
          <div className={`text-xl font-bold ${
            isLive || isFinal ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'
          }`}>
            {game.homeTeam.score}
          </div>
        )}
      </div>
    </div>
  );
};

