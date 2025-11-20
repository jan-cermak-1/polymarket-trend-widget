import React, { useState, useEffect, useCallback } from 'react';
import { getTags, getTrendingEvents } from '../services/polymarket';
import type { Tag, Event } from '../services/polymarket';
import { CategorySelect } from './CategorySelect';
import { MarketCard } from './MarketCard';
import { Loader2, RefreshCw, TrendingUp, Clock, Moon, Sun, Monitor } from 'lucide-react';

export const TrendWidget: React.FC = () => {
  const [categories, setCategories] = useState<Tag[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('trending');
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [timeToNextRefresh, setTimeToNextRefresh] = useState<number>(300); // 5 minutes in seconds
  const [expandedId, setExpandedId] = useState<string | null>(null); // Track expanded item ID for mobile accordion

  // Theme State
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark' | 'system') || 'system';
  });

  // Mobile Detection
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Apply Theme
  useEffect(() => {
    const root = window.document.documentElement;
    const applyTheme = () => {
      if (
        theme === 'dark' || 
        (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
      ) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    applyTheme();
    localStorage.setItem('theme', theme);

    // Listener for system changes if in system mode
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = () => applyTheme();
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
  }, [theme]);

  // Cycle Theme: System -> Light -> Dark
  const cycleTheme = () => {
    setTheme(current => {
      if (current === 'system') return 'light';
      if (current === 'light') return 'dark';
      return 'system';
    });
  };

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
  
  const handleExpand = (id: string) => {
      setExpandedId(current => current === id ? null : id);
  };

  return (
    <div className="max-w-[1600px] w-full mx-auto p-3 h-fit bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-sans border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm flex flex-col relative transition-colors">
      <header className="mb-2 shrink-0 relative z-10 bg-white dark:bg-gray-900 pb-2 border-b border-gray-100 dark:border-gray-800 transition-colors">
        <div className="flex flex-wrap lg:flex-nowrap items-center justify-between gap-3 lg:gap-4">
          {/* Left: Title */}
          <div className="flex items-center gap-2 shrink-0">
            <TrendingUp className="w-4 h-4 text-black dark:text-white" />
            <h1 className="text-sm font-bold tracking-tight text-black dark:text-white whitespace-nowrap">Polymarket Widget</h1>
          </div>
          
          {/* Center: Category Select - full width on mobile */}
          <div className="order-3 lg:order-2 w-full lg:w-auto flex-1 lg:max-w-[300px]">
            <CategorySelect 
              categories={categories}
              selectedCategory={selectedCategory}
              onSelect={handleCategorySelect}
            />
          </div>
          
          {/* Right: Timer & Refresh & Theme */}
          <div className="order-2 lg:order-3 flex items-center gap-2 text-[10px] text-gray-500 dark:text-gray-400 font-medium shrink-0 ml-auto lg:ml-0">
            {isRefreshing ? (
              <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
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
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
              title="Refresh now"
            >
              <RefreshCw className="w-3 h-3" />
            </button>

            <div className="w-px h-3 bg-gray-200 dark:bg-gray-700 mx-0.5" />

            <button 
              onClick={cycleTheme}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors flex items-center gap-1"
              title={`Current theme: ${theme}`}
            >
              {theme === 'light' && <Sun className="w-3 h-3" />}
              {theme === 'dark' && <Moon className="w-3 h-3" />}
              {theme === 'system' && <Monitor className="w-3 h-3" />}
            </button>
          </div>
        </div>
      </header>

      <main className="relative">
        {loading ? (
          <div className="flex flex-col lg:flex-row gap-4 h-auto lg:h-[420px]">
            {/* Mobile Loading Skeleton */}
            <div className="lg:hidden flex-1 flex flex-col gap-1">
               {[...Array(10)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-50 dark:bg-gray-800 rounded-md animate-pulse" />
              ))}
            </div>

            {/* Desktop Loading Skeleton */}
            <div className="hidden lg:flex flex-1 flex-col gap-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-full bg-gray-50 dark:bg-gray-800 rounded-md animate-pulse" />
              ))}
            </div>
            <div className="hidden lg:flex flex-1 flex-col gap-1">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-50 dark:bg-gray-800 rounded-md animate-pulse" />
              ))}
            </div>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12 px-4">
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">No active markets found</p>
            <p className="text-gray-400 dark:text-gray-500 text-xs">
                Try selecting a different category or check back later.
            </p>
          </div>
        ) : (
          <>
             {/* Mobile View: Single List of 10 items (all compact) */}
             {isMobile ? (
               <div className="flex flex-col gap-1 h-fit">
                 {events.map((event) => (
                   <MarketCard 
                        key={event.id} 
                        event={event} 
                        isTopItem={false} 
                        isExpanded={expandedId === event.id}
                        onExpand={() => handleExpand(event.id)}
                    />
                 ))}
               </div>
             ) : (
                /* Desktop View: Grid layout (3 large + list) */
                <div className="grid grid-cols-4 gap-3 h-[420px]">
                    {/* First 3 boxes: Large items with graphs - fill height */}
                    {events.slice(0, 3).map((event) => (
                    <MarketCard key={event.id} event={event} isTopItem={true} />
                    ))}
                    
                    {/* 4th box: Compact list of remaining items - no scroll, fits exactly */}
                    <div className="flex flex-col justify-between border-l border-gray-100 dark:border-gray-800 pl-3 h-full">
                    {events.slice(3).map((event) => (
                        <MarketCard key={event.id} event={event} isTopItem={false} />
                    ))}
                    </div>
                </div>
             )}
          </>
        )}
      </main>
    </div>
  );
};
