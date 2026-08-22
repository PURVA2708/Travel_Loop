import React from 'react';
import { ExpenseCategory } from '../../types/index.ts';

interface CategoryBadgeProps {
  category: ExpenseCategory | string;
  size?: 'sm' | 'md';
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category, size = 'md' }) => {
  const cat = category.toLowerCase();
  
  let styles = 'bg-surface-subtle text-ink-muted border-gray-200';
  let label = category;

  switch (cat) {
    case 'transport':
      styles = 'bg-blue-50 text-blue-700 border-blue-200';
      label = '✈️ Transport';
      break;
    case 'stay':
      styles = 'bg-purple-50 text-purple-700 border-purple-200';
      label = '🏨 Stay';
      break;
    case 'activities':
    case 'adventure':
    case 'sightseeing':
      styles = 'bg-emerald-50 text-emerald-800 border-emerald-200';
      label = '🏄 Activities';
      break;
    case 'meals':
    case 'food':
      styles = 'bg-amber-50 text-amber-800 border-amber-200';
      label = '🍽️ Meals & Food';
      break;
    case 'culture':
      styles = 'bg-indigo-50 text-indigo-800 border-indigo-200';
      label = '🏛️ Culture';
      break;
    case 'nightlife':
      styles = 'bg-rose-50 text-rose-800 border-rose-200';
      label = '🍸 Nightlife';
      break;
    case 'misc':
    default:
      styles = 'bg-gray-100 text-gray-700 border-gray-200';
      label = '🏷️ Misc';
      break;
  }

  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-xs font-semibold';

  return (
    <span className={`inline-flex items-center rounded-full border ${styles} ${sizeClass}`}>
      {label}
    </span>
  );
};
