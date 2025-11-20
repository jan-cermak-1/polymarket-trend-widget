import React, { useState, useEffect, useCallback } from 'react';
import { getGames, getApiKey, setApiKey, clearCache } from '../services/apiSports';
import type { APISportsGame, APIUsage } from '../services/apiSports';
import { Trophy, Settings, X, RefreshCw, AlertCircle } from 'lucide-react';

export const APISportsWidget: React.FC = () => {
  const [games, setGames] = useState<APISportsGame[]>([]);
  const [usage, setUsage] = useState<APIUsage | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [hasApiKey, setHasApiKey] = useState(false);

  useEffect(() => {
    const key = getApiKey();
    setHasApiKey(!!key);
    if (key) {
      setApiKeyInput(key);
    }
  }, []);

  const fetchData = useCallback(async () => {
    if (!hasApiKey) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { games: gamesData, usage: usageData } = await getGames();
      setGames(gamesData);
      if (usageData) {
        setUsage(usageData);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data');
      if (err.message === 'Invalid API key') {
        setHasApiKey(false);
      }
    } finally {
      setLoading(false);
    }
  }, [hasApiKey]);

  useEffect(() => {
    if (hasApiKey) {
      fetchData();
    }
  }, [hasApiKey, fetchData]);

  const handleSaveApiKey = () => {
    if (apiKeyInput.trim()) {
      setApiKey(apiKeyInput.trim());
      setHasApiKey(true);
      setShowSettings(false);
      setError(null);
    }
  };

  const handleRefresh = () => {
    clearCache();
    fetchData();
  };

  const getGameStatus = (game: APISportsGame) => {
    const status = game.game.status.short;
    
    if (status === 'NS') {
      const gameDate = new Date(game.game.date.timestamp * 1000);
      return gameDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    }
    
    if (status === 'LIVE' || status === '1' || status === '2' || status === '3' || status === '4') {
      return (
        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
          <div className="w-2 h-2 rounded-full bg-amber-600 dark:bg-amber-400 animate-pulse"></div>
          <span>LIVE</span>
          {game.game.status.timer && (
            <span className="text-gray-600 dark:text-gray-400 font-normal">
              {game.game.status.timer}
            </span>
          )}
        </div>
      );
    }
    
    if (status === 'FT' || status === 'AOT' || status === 'AET') {
      return <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">FINAL</span>;
    }
    
    return <span className="text-xs text-gray-600 dark:text-gray-400">{game.game.status.long}</span>;
  };

  if (showSettings) {
    return (
      <div className="max-w-[1600px] w-full mx-auto p-3 h-fit bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-sans border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold">API-SPORTS Settings</h2>
          <button
            onClick={() => setShowSettings(false)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              API Key
            </label>
            <input
              type="text"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="Enter your API-SPORTS key"
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>
          
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
            <p className="text-xs text-amber-800 dark:text-amber-200 mb-2">
              <strong>How to get an API key:</strong>
            </p>
            <ol className="text-xs text-amber-700 dark:text-amber-300 space-y-1 list-decimal list-inside">
              <li>Visit <a href="https://api-sports.io" target="_blank" rel="noopener noreferrer" className="underline">api-sports.io</a></li>
              <li>Register for a free account</li>
              <li>Get your API key from the dashboard</li>
              <li>Free tier: 100 requests/day</li>
            </ol>
          </div>
          
          <button
            onClick={handleSaveApiKey}
            disabled={!apiKeyInput.trim()}
            className="w-full px-4 py-2 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 disabled:bg-gray-400 rounded-lg transition-colors"
          >
            Save API Key
          </button>
        </div>
      </div>
    );
  }

  if (!hasApiKey) {
    return (
      <div className="max-w-[1600px] w-full mx-auto p-3 h-fit bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-sans border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm">
        <div className="text-center py-12 px-4">
          <Trophy className="w-12 h-12 text-amber-600 dark:text-amber-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">API-SPORTS NFL Widget</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Configure your API key to view NFL games with advanced statistics
          </p>
          <button
            onClick={() => setShowSettings(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors"
          >
            <Settings className="w-4 h-4" />
            Configure API Key
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] w-full mx-auto p-3 h-fit bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-sans border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm flex flex-col relative transition-colors">
      <header className="mb-4 shrink-0 relative z-10 bg-white dark:bg-gray-900 pb-3 border-b border-gray-100 dark:border-gray-800 transition-colors">
        <div className="flex items-center justify-between gap-3">
          {/* Left: Title */}
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <h1 className="text-sm font-bold tracking-tight text-black dark:text-white">
              API-SPORTS NFL
            </h1>
            {usage && (
              <span className="text-[10px] text-gray-500 dark:text-gray-400">
                {usage.requests.current}/{usage.requests.limit_day} requests
              </span>
            )}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors disabled:opacity-50"
              title="Refresh (clears cache)"
            >
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
              title="Settings"
            >
              <Settings className="w-3 h-3" />
            </button>
          </div>
        </div>
      </header>

      <main className="relative">
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800 dark:text-red-200">{error}</p>
              {error === 'Invalid API key' && (
                <button
                  onClick={() => setShowSettings(true)}
                  className="text-xs text-red-600 dark:text-red-400 underline mt-1"
                >
                  Update API key
                </button>
              )}
            </div>
          </div>
        )}

        {loading && games.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-50 dark:bg-gray-800 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : games.length === 0 && !error ? (
          <div className="text-center py-12 px-4">
            <p className="text-gray-500 dark:text-gray-400 text-sm">No games available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {games.slice(0, 12).map((game) => (
              <div key={game.game.id} className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-all">
                {/* Status */}
                <div className="flex justify-between items-center mb-3">
                  {getGameStatus(game)}
                  <span className="text-[10px] text-gray-500 dark:text-gray-400">
                    Week {game.game.week}
                  </span>
                </div>

                {/* Away Team */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {game.teams.away.logo && (
                      <img 
                        src={game.teams.away.logo} 
                        alt={game.teams.away.name}
                        className="w-6 h-6 object-contain"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    )}
                    <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {game.teams.away.name}
                    </span>
                  </div>
                  {game.scores.away.total !== null && (
                    <div className="text-xl font-bold text-gray-900 dark:text-white">
                      {game.scores.away.total}
                    </div>
                  )}
                </div>

                {/* Home Team */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {game.teams.home.logo && (
                      <img 
                        src={game.teams.home.logo} 
                        alt={game.teams.home.name}
                        className="w-6 h-6 object-contain"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    )}
                    <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {game.teams.home.name}
                    </span>
                  </div>
                  {game.scores.home.total !== null && (
                    <div className="text-xl font-bold text-gray-900 dark:text-white">
                      {game.scores.home.total}
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

