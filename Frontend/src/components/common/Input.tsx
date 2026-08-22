import React, { forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  pill?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      pill = false,
      className,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-semibold text-ink mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 text-ink-muted pointer-events-none flex items-center">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={twMerge(
              clsx(
                'w-full bg-surface-white text-ink text-sm border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand disabled:bg-surface disabled:text-ink-muted min-h-[44px]',
                leftIcon ? 'pl-11' : 'pl-4',
                rightIcon ? 'pr-11' : 'pr-4',
                pill ? 'rounded-full py-2.5' : 'rounded-xl py-2.5',
                error
                  ? 'border-danger focus:ring-danger focus:border-danger'
                  : 'border-ink-border hover:border-ink-muted/60',
                className
              )
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3.5 text-ink-muted flex items-center">
              {rightIcon}
            </div>
          )}
        </div>
        {error ? (
          <p className="mt-1.5 text-xs font-medium text-danger">{error}</p>
        ) : helperText ? (
          <p className="mt-1.5 text-xs text-ink-muted">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
