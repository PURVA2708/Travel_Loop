import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

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
