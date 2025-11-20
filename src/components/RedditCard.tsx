import React, { memo } from 'react';
import type { RedditPost } from '../services/reddit';
import { ArrowUp, MessageCircle } from 'lucide-react';

interface RedditCardProps {
  post: RedditPost;
}

const getTimeAgo = (dateString: string): string => {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const formatNumber = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

const RedditCardComponent: React.FC<RedditCardProps> = ({ post }) => {
  return (
    <a
      href={post.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-white dark:bg-gray-800 rounded-lg overflow-hidden hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700"
    >
      {/* Image */}
      {post.image && (
        <div className="w-full h-40 bg-gray-100 dark:bg-gray-700 overflow-hidden">
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      )}

      {/* Content */}
      <div className="p-3">
        {/* Subreddit badge */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 font-medium">
            r/{post.subreddit}
          </span>
          <span className="text-[10px] text-gray-500 dark:text-gray-400">
            {getTimeAgo(post.publishedAt)}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
          {post.title}
        </h3>

        {/* Stats */}
        <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <ArrowUp className="w-3 h-3" />
            <span className="font-medium">{formatNumber(post.score)}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle className="w-3 h-3" />
            <span>{formatNumber(post.comments)}</span>
          </div>
          <span className="text-[10px]">u/{post.author}</span>
        </div>
      </div>
    </a>
  );
};

export const RedditCard = memo(RedditCardComponent);

