import React from 'react';
import type { StandingsTeam, SportType } from '../services/espn';
import { SPORT_CONFIGS } from '../services/espn';

interface ESPNStandingsProps {
  standings: StandingsTeam[];
  sport: SportType;
  loading: boolean;
}

export const ESPNStandings: React.FC<ESPNStandingsProps> = ({ standings, sport, loading }) => {
  const config = SPORT_CONFIGS[sport];

  if (loading) {
    return (
      <div className="space-y-2">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Standings</h3>
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (standings.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-gray-500 dark:text-gray-400">No standings available</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
        <span>Standings</span>
        <span className="text-xs font-normal text-gray-500 dark:text-gray-400">Top 8</span>
      </h3>
      
      <div className="space-y-1.5">
        {standings.map((item) => (
          <div 
            key={item.team.id}
            className="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-sm transition-all"
          >
            {/* Rank Badge */}
            <div className={`flex items-center justify-center w-6 h-6 rounded-full bg-${config.color} dark:bg-${config.darkColor} text-white text-xs font-bold shrink-0`}>
              {item.rank}
            </div>

            {/* Team Logo */}
            {item.team.logo && (
              <img 
                src={item.team.logo} 
                alt={item.team.abbreviation}
                className="w-5 h-5 object-contain shrink-0"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            )}

            {/* Team Info */}
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                {item.team.abbreviation}
              </div>
              <div className="text-[10px] text-gray-500 dark:text-gray-400">
                {item.stats.wins}-{item.stats.losses}
                {item.stats.ties ? `-${item.stats.ties}` : ''}
              </div>
            </div>

            {/* Win Percentage */}
            <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 shrink-0">
              {item.stats.winPercent.toFixed(3)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

