import React from 'react';
import type { NewsItem } from '../services/googleNews';
import { ExternalLink, Clock } from 'lucide-react';
import { clsx } from 'clsx';

interface NewsCardProps {
  item: NewsItem;
  index: number;
}

export const NewsCard: React.FC<NewsCardProps> = ({ item, index }) => {
  // Helper to format relative time
  const getTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  return (
    <a 
      href={item.link} 
      target="_blank" 
      rel="noopener noreferrer"
      className="group block p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200 h-full flex flex-col"
    >
      <div className="flex justify-between items-start gap-3 mb-2">
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 text-xs font-bold text-gray-500 dark:text-gray-400 shrink-0">
            {index + 1}
        </span>
        <div className="flex-1 flex flex-wrap gap-2 justify-end">
            <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-[10px] font-medium text-gray-600 dark:text-gray-300">
                {item.source}
            </span>
        </div>
      </div>

      <h3 className="text-sm font-bold text-gray-900 dark:text-white leading-snug mb-auto line-clamp-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
        {item.title}
      </h3>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400">
            <Clock className="w-3 h-3" />
            {getTimeAgo(item.pubDate)}
        </div>
        <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-blue-500 transition-colors" />
      </div>
    </a>
  );
};

