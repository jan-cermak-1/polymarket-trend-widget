import React, { useState, useEffect, useCallback } from 'react';
import { getEvents, LEAGUE_CONFIGS } from '../services/theSportsDB';
import type { LeagueType, SportsDBEvent } from '../services/theSportsDB';
import { Trophy, RefreshCw } from 'lucide-react';

const US_SPORTS: LeagueType[] = ['nfl', 'nhl', 'nba', 'mlb'];
const SOCCER_LEAGUES: LeagueType[] = ['premier', 'laliga', 'bundesliga', 'seriea'];

export const TheSportsDBWidget: React.FC = () => {
  const [selectedSport, setSelectedSport] = useState<'us' | 'soccer'>('us');
  const [selectedLeague, setSelectedLeague] = useState<LeagueType>('nfl');
  const [events, setEvents] = useState<SportsDBEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchData = useCallback(async (league: LeagueType, showLoader = true) => {
    if (showLoader) setLoading(true);
    
    try {
      const data = await getEvents(league);
      setEvents(data);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to fetch sports data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(selectedLeague);
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(() => {
      fetchData(selectedLeague, false);
    }, 300000);

    return () => clearInterval(interval);
  }, [selectedLeague, fetchData]);

  const handleLeagueChange = (league: LeagueType) => {
    const config = LEAGUE_CONFIGS[league];
    setSelectedSport(config.type);
    setSelectedLeague(league);
  };

  const getEventStatus = (event: SportsDBEvent) => {
    if (event.strStatus === 'Match Finished' || event.intHomeScore) {
      return 'FINAL';
    }
    if (event.strProgress) {
      return event.strProgress;
    }
    
    // Format date/time for scheduled matches
    const eventDate = new Date(event.dateEvent);
    if (event.strTime) {
      const [hours, minutes] = event.strTime.split(':');
      eventDate.setHours(parseInt(hours), parseInt(minutes));
    }
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const eventDay = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
    
    const dayDiff = Math.floor((eventDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (dayDiff === 0) return `Today ${eventDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    if (dayDiff === 1) return `Tomorrow ${eventDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    if (dayDiff > 1 && dayDiff < 7) return eventDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    
    return eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const config = LEAGUE_CONFIGS[selectedLeague];
  const currentLeagues = selectedSport === 'us' ? US_SPORTS : SOCCER_LEAGUES;

  return (
    <div className="max-w-[1600px] w-full mx-auto p-3 h-fit bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-sans border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm flex flex-col relative transition-colors">
      <header className="mb-4 shrink-0 relative z-10 bg-white dark:bg-gray-900 pb-3 border-b border-gray-100 dark:border-gray-800 transition-colors">
        <div className="flex flex-wrap lg:flex-nowrap items-center justify-between gap-3 lg:gap-4">
          {/* Left: Title */}
          <div className="flex items-center gap-2 shrink-0">
            <Trophy className="w-4 h-4 text-gray-700 dark:text-gray-300" />
            <h1 className="text-sm font-bold tracking-tight text-black dark:text-white whitespace-nowrap">
              TheSportsDB
            </h1>
          </div>
          
          {/* Center: Sport Type Tabs */}
          <div className="flex gap-2 items-center justify-center">
            <button
              onClick={() => {
                setSelectedSport('us');
                setSelectedLeague('nfl');
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                selectedSport === 'us'
                  ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 shadow-md'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              US Sports
            </button>
            <button
              onClick={() => {
                setSelectedSport('soccer');
                setSelectedLeague('premier');
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                selectedSport === 'soccer'
                  ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 shadow-md'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              Soccer
            </button>
          </div>

          {/* Right: Last Update & Refresh */}
          <div className="flex items-center gap-2 text-[10px] text-gray-500 dark:text-gray-400 shrink-0">
            <span className="hidden sm:inline">
              {lastUpdate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
            </span>
            <button
              onClick={() => fetchData(selectedLeague)}
              disabled={loading}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* League Tabs */}
        <div className="flex flex-wrap gap-2 mt-3">
          {currentLeagues.map((league) => {
            const leagueConfig = LEAGUE_CONFIGS[league];
            const isSelected = selectedLeague === league;
            
            return (
              <button
                key={league}
                onClick={() => handleLeagueChange(league)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  isSelected
                    ? `bg-${leagueConfig.color} dark:bg-${leagueConfig.darkColor} text-white shadow-md`
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {leagueConfig.name}
              </button>
            );
          })}
        </div>
      </header>

      <main className="relative">
        {loading && events.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="h-28 bg-gray-50 dark:bg-gray-800 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12 px-4">
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">No events found</p>
            <p className="text-gray-400 dark:text-gray-500 text-xs">
              Check back later for {config.name} matches.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {events.slice(0, 15).map((event) => (
              <div key={event.idEvent} className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-all">
                {/* Status/Date */}
                <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-3 text-center">
                  {getEventStatus(event)}
                </div>

                {/* Away Team */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {event.strAwayTeamBadge && (
                      <img 
                        src={event.strAwayTeamBadge} 
                        alt={event.strAwayTeam}
                        className="w-5 h-5 object-contain"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    )}
                    <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {event.strAwayTeam}
                    </span>
                  </div>
                  {event.intAwayScore && (
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {event.intAwayScore}
                    </div>
                  )}
                </div>

                {/* Home Team */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {event.strHomeTeamBadge && (
                      <img 
                        src={event.strHomeTeamBadge} 
                        alt={event.strHomeTeam}
                        className="w-5 h-5 object-contain"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    )}
                    <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {event.strHomeTeam}
                    </span>
                  </div>
                  {event.intHomeScore && (
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {event.intHomeScore}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

