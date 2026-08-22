import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-2xl bg-surface-white shadow-sm transition-shadow hover:shadow-md',
        className,
      )}
      {...props}
    />
  );
}
