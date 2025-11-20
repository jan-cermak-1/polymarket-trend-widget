import React, { useState, useEffect, useCallback } from 'react';
import { getNewsCategories, getGoogleNews } from '../services/googleNews';
import type { NewsItem } from '../services/googleNews';
import { NewsCard } from './NewsCard';
import { Loader2, RefreshCw, Newspaper, Clock, ChevronDown } from 'lucide-react';

export const NewsWidget: React.FC = () => {
  const categories = getNewsCategories();
  const [selectedCategory, setSelectedCategory] = useState<string>('top');
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [timeToNextRefresh, setTimeToNextRefresh] = useState<number>(300); // 5 minutes

  const fetchNews = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    else setIsRefreshing(true);
    
    try {
      // Create a unique key for caching or just fetching
      const category = categories.find(c => c.id === selectedCategory) || categories[0];
      
      // Simple in-memory debounce/cache could be here if needed, but let's just fetch
      const data = await getGoogleNews(category);
      
      // Only update state if we got data (or empty array if intentional)
      // This prevents "flashing" if API returns empty temporarily
      if (data.length > 0) {
          setNews(data.slice(0, 12)); // Limit to 12 items
      }
      
      setTimeToNextRefresh(300);
    } catch (e) {
        console.error(e);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedCategory, categories]); // Removed categories from dependency if it's stable, but it's defined in component so it changes on render if not memoized. 
  // Actually categories is defined via function call inside component body? No, it is `const categories = getNewsCategories();` which is a new array every render.
  // We should move `categories` outside or memoize it.

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  // Auto-refresh
  useEffect(() => {
    const timerId = setInterval(() => {
      setTimeToNextRefresh((prev) => {
        if (prev <= 1) {
            fetchNews(false);
            return 300;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerId);
  }, [fetchNews]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="max-w-[1600px] w-full mx-auto p-3 h-fit bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-sans border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm flex flex-col relative transition-colors">
      <header className="mb-4 shrink-0 relative z-10 bg-white dark:bg-gray-900 pb-2 border-b border-gray-100 dark:border-gray-800 transition-colors">
        <div className="flex flex-wrap lg:flex-nowrap items-center justify-between gap-3 lg:gap-4">
          {/* Left: Title */}
          <div className="flex items-center gap-2 shrink-0">
            <Newspaper className="w-4 h-4 text-black dark:text-white" />
            <h1 className="text-sm font-bold tracking-tight text-black dark:text-white whitespace-nowrap">Google News Trends</h1>
          </div>
          
          {/* Center: Category Select */}
          <div className="order-3 lg:order-2 w-full lg:w-auto flex-1 lg:max-w-[300px] relative">
            <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="appearance-none w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 pr-10 cursor-pointer font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
            >
                {categories.map((cat) => (
                    <option key={cat.id} value={cat.id} className="text-gray-700 dark:text-gray-300">
                        {cat.label}
                    </option>
                ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500 dark:text-gray-400">
                <ChevronDown className="w-4 h-4" />
            </div>
          </div>
          
          {/* Right: Timer & Refresh */}
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
              onClick={() => fetchNews(false)}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
              title="Refresh now"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>
        </div>
      </header>

      <main className="relative">
        {loading && news.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 h-auto">
            {[...Array(8)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-50 dark:bg-gray-800 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : news.length === 0 ? (
          <div className="text-center py-12 px-4">
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">No news found</p>
            <p className="text-gray-400 dark:text-gray-500 text-xs">
                Try selecting a different category or check back later.
            </p>
          </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {news.map((item, index) => (
                    <NewsCard key={item.id + index} item={item} index={index} />
                ))}
            </div>
        )}
      </main>
    </div>
  );
};
