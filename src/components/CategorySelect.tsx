import React from 'react';
import type { Tag } from '../services/polymarket';
import { ChevronDown } from 'lucide-react';

interface CategorySelectProps {
  categories: Tag[];
  selectedCategory: string | null;
  onSelect: (categorySlug: string | null) => void;
}

export const CategorySelect: React.FC<CategorySelectProps> = ({
  categories,
  selectedCategory,
  onSelect,
}) => {
  // Group categories by groupId/groupLabel
  const groupedCategories = categories.reduce((acc, category) => {
    const group = category.groupLabel || 'Other';
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(category);
    return acc;
  }, {} as Record<string, Tag[]>);

  // Order of groups
  const groupOrder = ['Featured', 'Politics', 'Crypto', 'Sports', 'Business', 'Pop Culture', 'Other'];

  return (
    <div className="relative">
      <div className="relative">
        <select
          value={selectedCategory || 'trending'}
          onChange={(e) => onSelect(e.target.value)}
          className="appearance-none w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 pr-10 cursor-pointer font-medium transition-colors hover:bg-gray-100"
        >
          {groupOrder.map((groupLabel) => {
            const groupCats = groupedCategories[groupLabel];
            if (!groupCats) return null;
            
            return (
              <optgroup key={groupLabel} label={groupLabel} className="font-semibold text-gray-900">
                {groupCats.map((category) => (
                  <option key={category.id} value={category.slug} className="text-gray-700 font-normal">
                    {category.label}
                  </option>
                ))}
              </optgroup>
            );
          })}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};
