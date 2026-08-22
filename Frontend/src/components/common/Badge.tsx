import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Plane, Hotel, Waves, Utensils, Landmark, Martini, Tag, type LucideIcon } from 'lucide-react';
import { ExpenseCategory } from '../../types';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'brand' | 'ink' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className,
  variant = 'neutral',
  size = 'sm',
  ...props
}) => {
  const variantStyles = {
    brand: 'bg-brand/20 text-ink border border-brand/40 font-semibold',
    ink: 'bg-ink text-surface-white',
    success: 'bg-success/15 text-success font-medium',
    warning: 'bg-warning/15 text-warning font-medium',
    danger: 'bg-danger/15 text-danger font-medium',
    info: 'bg-info/15 text-info font-medium',
    neutral: 'bg-surface text-ink-muted border border-ink-border/40 font-medium',
  };

  const sizeStyles = {
    sm: 'text-xs px-2.5 py-0.5 rounded-full',
    md: 'text-sm px-3.5 py-1 rounded-full',
  };

  return (
    <span
      className={twMerge(
        clsx('inline-flex items-center gap-1 select-none', sizeStyles[size], variantStyles[variant], className)
      )}
      {...props}
    >
      {children}
    </span>
  );
};

interface CategoryBadgeProps {
  category: ExpenseCategory | string;
  size?: 'sm' | 'md';
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category, size = 'md' }) => {
  const cat = String(category).toLowerCase();

  let styles = 'bg-surface-subtle text-ink-muted border-gray-200';
  let label = String(category);
  let Icon: LucideIcon = Tag;

  switch (cat) {
    case 'transport':
      styles = 'bg-blue-50 text-blue-700 border-blue-200';
      label = 'Transport';
      Icon = Plane;
      break;
    case 'stay':
      styles = 'bg-purple-50 text-purple-700 border-purple-200';
      label = 'Stay';
      Icon = Hotel;
      break;
    case 'activities':
    case 'adventure':
    case 'sightseeing':
      styles = 'bg-emerald-50 text-emerald-800 border-emerald-200';
      label = 'Activities';
      Icon = Waves;
      break;
    case 'meals':
    case 'food':
      styles = 'bg-amber-50 text-amber-800 border-amber-200';
      label = 'Meals & Food';
      Icon = Utensils;
      break;
    case 'culture':
      styles = 'bg-indigo-50 text-indigo-800 border-indigo-200';
      label = 'Culture';
      Icon = Landmark;
      break;
    case 'nightlife':
      styles = 'bg-rose-50 text-rose-800 border-rose-200';
      label = 'Nightlife';
      Icon = Martini;
      break;
    case 'misc':
    default:
      styles = 'bg-gray-100 text-gray-700 border-gray-200';
      label = 'Misc';
      Icon = Tag;
      break;
  }

  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-xs font-semibold';
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5';

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border ${styles} ${sizeClass}`}>
      <Icon className={iconSize} />
      {label}
    </span>
  );
};

export default Badge;
