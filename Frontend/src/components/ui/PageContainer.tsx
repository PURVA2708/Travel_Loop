import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export function PageContainer({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'mx-auto w-full max-w-[1280px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10',
        // leave room for the mobile bottom tab bar
        'pb-24 lg:pb-8',
        className,
      )}
      {...props}
    />
  );
}
