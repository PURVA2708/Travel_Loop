import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Skeleton: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => {
  return (
    <div
      className={twMerge(
        clsx('animate-pulse bg-ink-border/40 rounded-xl', className)
      )}
      {...props}
    />
  );
};
