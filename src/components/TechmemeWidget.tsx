import React, { useState, useEffect, useCallback } from 'react';
import { getTechmemeStories } from '../services/techmeme';
import type { TechmemeStory } from '../services/techmeme';
import { TechmemeCard } from './TechmemeCard';
import { Cpu } from 'lucide-react';

export const TechmemeWidget: React.FC = () => {
  const [stories, setStories] = useState<TechmemeStory[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStories = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    
    try {
      const data = await getTechmemeStories();
      setStories(data.slice(0, 12));
    } catch (error) {
      console.error('Failed to fetch Techmeme stories:', error);
      setStories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStories();
    
    // Refresh every 15 minutes (Techmeme updates frequently)
    const interval = setInterval(() => {
      fetchStories(false);
    }, 15 * 60 * 1000);

    return () => clearInterval(interval);
  }, [fetchStories]);

  return (
    <div className="max-w-[1600px] w-full mx-auto p-3 h-fit bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-sans border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm flex flex-col relative transition-colors">
      <header className="mb-4 shrink-0 relative z-10 bg-white dark:bg-gray-900 pb-2 border-b border-gray-100 dark:border-gray-800 transition-colors">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-green-600 dark:text-green-400" />
          <h1 className="text-sm font-bold tracking-tight text-black dark:text-white">Techmeme Trends</h1>
          <span className="ml-auto text-[10px] text-gray-500 dark:text-gray-400">Tech News</span>
        </div>
      </header>

      <main className="relative">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 h-auto">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-40 bg-gray-50 dark:bg-gray-800 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : stories.length === 0 ? (
          <div className="text-center py-12 px-4">
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">No stories found</p>
            <p className="text-gray-400 dark:text-gray-500 text-xs">
              Check back later for the latest tech news.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {stories.map((item, index) => (
              <TechmemeCard key={item.id} item={item} index={index} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

