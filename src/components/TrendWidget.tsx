import React, { useState, useEffect, useCallback } from 'react';
import { getTags, getTrendingEvents } from '../services/polymarket';
import type { Tag, Event } from '../services/polymarket';
import { CategorySelect } from './CategorySelect';
import { MarketCard } from './MarketCard';
import { Loader2, RefreshCw, TrendingUp, Clock } from 'lucide-react';

export const TrendWidget: React.FC = () => {
  const [categories, setCategories] = useState<Tag[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('trending');
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [timeToNextRefresh, setTimeToNextRefresh] = useState<number>(300); // 5 minutes in seconds

  useEffect(() => {
    const fetchTags = async () => {
      const tags = await getTags();
      setCategories(tags);
    };
    fetchTags();
  }, []);

  const fetchEvents = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    else setIsRefreshing(true);
    
    try {
      const data = await getTrendingEvents(selectedCategory);
      setEvents(data);
      setTimeToNextRefresh(300); // Reset countdown
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Countdown and Auto-refresh logic
  useEffect(() => {
    const timerId = setInterval(() => {
      setTimeToNextRefresh((prev) => {
        if (prev <= 1) {
            fetchEvents(false);
            return 300;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [fetchEvents]);

  // Format seconds to MM:SS
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleCategorySelect = (slug: string | null) => {
    if (!slug) {
        setSelectedCategory('trending');
    } else {
        setSelectedCategory(slug);
    }
  };

  return (
    <div className="max-w-[1400px] w-full mx-auto p-4 h-fit bg-white text-gray-900 font-sans border border-gray-200 rounded-lg shadow-sm flex flex-col relative">
      <header className="mb-2 shrink-0 relative z-10 bg-white pb-2 border-b border-gray-100">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Title */}
          <div className="flex items-center gap-2 shrink-0">
            <TrendingUp className="w-4 h-4 text-black" />
            <h1 className="text-sm font-bold tracking-tight text-black whitespace-nowrap">Polymarket Widget</h1>
          </div>
          
          {/* Center: Category Select */}
          <div className="flex-1 max-w-[300px]">
            <CategorySelect 
              categories={categories}
              selectedCategory={selectedCategory}
              onSelect={handleCategorySelect}
            />
          </div>
          
          {/* Right: Timer & Refresh */}
          <div className="flex items-center gap-2 text-[10px] text-gray-500 font-medium shrink-0">
            {isRefreshing ? (
              <span className="flex items-center gap-1 text-blue-600">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span className="hidden sm:inline">Updating...</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 tabular-nums" title="Next update in">
                <Clock className="w-3 h-3" />
                {formatTime(timeToNextRefresh)}
              </span>
            )}
            
            <button 
              onClick={() => fetchEvents(false)}
              className="p-1 hover:bg-gray-100 rounded-md transition-colors"
              title="Refresh now"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 min-h-0 relative">
        {loading ? (
          <div className="flex gap-4 h-full">
            <div className="flex-1 flex flex-col gap-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-full bg-gray-50 rounded-md animate-pulse" />
              ))}
            </div>
            <div className="flex-1 flex flex-col gap-1">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-50 rounded-md animate-pulse" />
              ))}
            </div>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12 px-4">
            <p className="text-gray-500 text-sm font-medium mb-1">No active markets found</p>
            <p className="text-gray-400 text-xs">
                Try selecting a different category or check back later.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Top row: 3 items side by side */}
            <div className="grid grid-cols-3 gap-4">
              {events.slice(0, 3).map((event) => (
                <MarketCard key={event.id} event={event} isTopItem={true} />
              ))}
            </div>
            
            {/* Bottom: Remaining 7 items (4-10) in compact list */}
            <div className="flex flex-col gap-0 border-t border-gray-100 pt-3">
              {events.slice(3).map((event) => (
                <MarketCard key={event.id} event={event} isTopItem={false} />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
