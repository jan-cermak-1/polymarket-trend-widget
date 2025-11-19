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
    <div className="max-w-[400px] mx-auto p-3 h-fit bg-white text-gray-900 font-sans border-x border-gray-100 shadow-sm">
      <header className="mb-4 space-y-3">
        <div className="flex justify-between items-center pb-2 border-b border-gray-100">
            <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-black" />
                <h1 className="text-lg font-bold tracking-tight text-black">Markets</h1>
            </div>
          
          <div className="flex items-center gap-3 text-[11px] text-gray-500 font-medium">
            {isRefreshing ? (
                <span className="flex items-center gap-1 text-blue-600">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Updating...
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
        
        <CategorySelect 
          categories={categories}
          selectedCategory={selectedCategory}
          onSelect={handleCategorySelect}
        />
      </header>

      <main className="space-y-1">
        {loading ? (
          <div className="flex flex-col gap-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-50 rounded-md animate-pulse" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12 px-4">
            <p className="text-gray-500 text-sm font-medium mb-1">No active markets found</p>
            <p className="text-gray-400 text-xs">
                Try selecting a different category or check back later.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-0">
            {events.map((event) => (
              <MarketCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
