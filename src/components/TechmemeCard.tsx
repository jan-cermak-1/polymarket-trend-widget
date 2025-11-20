import React, { memo } from 'react';
import type { TechmemeStory } from '../services/techmeme';
import { ExternalLink, Clock } from 'lucide-react';

interface TechmemeCardProps {
  item: TechmemeStory;
  index: number;
}

const TechmemeCardComponent: React.FC<TechmemeCardProps> = ({ item, index }) => {
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
      className="group block p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md hover:border-green-300 dark:hover:border-green-700 transition-all duration-200 h-full flex flex-col"
    >
      <div className="flex justify-between items-start gap-3 mb-2">
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 dark:bg-green-900 text-xs font-bold text-green-700 dark:text-green-300 shrink-0">
          {index + 1}
        </span>
        <div className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400">
          <Clock className="w-3 h-3" />
          {getTimeAgo(item.pubDate)}
        </div>
      </div>

      <h3 className="text-sm font-bold text-gray-900 dark:text-white leading-snug mb-2 line-clamp-3 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
        {item.title}
      </h3>

      {item.description && (
        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mb-auto line-clamp-2">
          {item.description}
        </p>
      )}

      <div className="flex items-center justify-end mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
        <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-green-500 transition-colors" />
      </div>
    </a>
  );
};

export const TechmemeCard = memo(TechmemeCardComponent);

