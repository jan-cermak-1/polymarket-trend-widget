import React, { useState, useEffect, useCallback } from 'react';
import { getNewsCategories, getGoogleNews } from '../services/googleNews';
import type { NewsItem } from '../services/googleNews';
import { NewsCard } from './NewsCard';
import { Loader2, Newspaper } from 'lucide-react';

export const NewsWidget: React.FC = () => {
  const categories = getNewsCategories();
  const [selectedCategory, setSelectedCategory] = useState<string>('top');
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNews = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    
    try {
      const category = categories.find(c => c.id === selectedCategory) || categories[0];
      const data = await getGoogleNews(category);
      setNews(data.slice(0, 12)); // Limit to 12 items
    } catch (error) {
      console.error('Failed to fetch news:', error);
      setNews([]);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, categories]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  return (
    <div className="max-w-[1600px] w-full mx-auto p-3 h-fit bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-sans border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm flex flex-col relative transition-colors">
      <header className="mb-4 shrink-0 relative z-10 bg-white dark:bg-gray-900 pb-2 border-b border-gray-100 dark:border-gray-800 transition-colors">
        <div className="flex flex-wrap lg:flex-nowrap items-center justify-between gap-3 lg:gap-4">
          {/* Left: Title */}
          <div className="flex items-center gap-2 shrink-0">
            <Newspaper className="w-4 h-4 text-black dark:text-white" />
            <h1 className="text-sm font-bold tracking-tight text-black dark:text-white whitespace-nowrap">Google News</h1>
          </div>
          
          {/* Center: Category Tabs */}
          <div className="flex flex-wrap gap-2 items-center justify-center flex-1">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="relative">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 h-auto">
            {[...Array(8)].map((_, i) => (
                <div key={i} className="h-48 bg-gray-50 dark:bg-gray-800 rounded-lg animate-pulse" />
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
                    <NewsCard key={item.id} item={item} index={index} />
                ))}
            </div>
        )}
      </main>
    </div>
  );
};
