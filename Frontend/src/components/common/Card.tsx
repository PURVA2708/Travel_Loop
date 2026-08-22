import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  padded?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  hoverable = false,
  padded = true,
  ...props
}) => {
  return (
    <div
      className={twMerge(
        clsx(
          'bg-surface-white rounded-2xl border border-ink-border/30 shadow-card-rest transition-all duration-300 overflow-hidden',
          hoverable && 'hover:shadow-card-hover hover:-translate-y-1 cursor-pointer',
          padded && 'p-5 sm:p-6',
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
};
