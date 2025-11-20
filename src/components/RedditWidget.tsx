import React, { useState, useEffect, useCallback } from 'react';
import { getRedditCategories, getRedditPosts } from '../services/reddit';
import type { RedditPost } from '../services/reddit';
import { RedditCard } from './RedditCard';
import { Loader2 } from 'lucide-react';

export const RedditWidget: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('popular');
  const [posts, setPosts] = useState<RedditPost[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    
    try {
      const categories = getRedditCategories();
      const category = categories.find(c => c.id === selectedCategory) || categories[0];
      const data = await getRedditPosts(category);
      setPosts(data.slice(0, 12)); // Limit to 12 items
    } catch (error) {
      console.error('Failed to fetch Reddit posts:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return (
    <div className="max-w-[1600px] w-full mx-auto p-3 h-fit bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-sans border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm flex flex-col relative transition-colors">
      <header className="mb-4 shrink-0 relative z-10 bg-white dark:bg-gray-900 pb-2 border-b border-gray-100 dark:border-gray-800 transition-colors">
        <div className="flex flex-wrap lg:flex-nowrap items-center justify-between gap-3 lg:gap-4">
          {/* Left: Title */}
          <div className="flex items-center gap-2 shrink-0">
            <svg className="w-4 h-4 text-orange-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
            </svg>
            <h1 className="text-sm font-bold tracking-tight text-black dark:text-white whitespace-nowrap">Reddit Trends</h1>
          </div>
          
          {/* Center: Category Tabs */}
          <div className="flex flex-wrap gap-2 items-center justify-center flex-1">
            {getRedditCategories().map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Right: Loading indicator */}
          {loading && (
            <div className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400 shrink-0">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span className="hidden sm:inline">Loading...</span>
            </div>
          )}
        </div>
      </header>

      <main className="relative">
        {loading && posts.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 h-auto">
            {[...Array(8)].map((_, i) => (
                <div key={i} className="h-48 bg-gray-50 dark:bg-gray-800 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 px-4">
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">No posts found</p>
            <p className="text-gray-400 dark:text-gray-500 text-xs">
                Try selecting a different category or check back later.
            </p>
          </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {posts.map((post) => (
                    <RedditCard key={post.id} post={post} />
                ))}
            </div>
        )}
      </main>
    </div>
  );
};

