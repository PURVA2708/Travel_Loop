import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  pill?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  pill = true,
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5 min-h-[36px]',
    md: 'text-sm px-5 py-2.5 gap-2 min-h-[44px]',
    lg: 'text-base px-7 py-3.5 gap-2.5 min-h-[50px]',
  };

  const variantStyles = {
    primary:
      'bg-brand text-ink hover:bg-brand-dark shadow-sm hover:shadow active:bg-brand-dark',
    secondary:
      'bg-ink text-surface-white hover:bg-ink-light active:bg-black',
    outline:
      'border-2 border-ink text-ink bg-transparent hover:bg-ink/5 active:bg-ink/10',
    ghost:
      'text-ink bg-transparent hover:bg-black/5 active:bg-black/10',
    danger:
      'bg-danger text-surface-white hover:bg-red-700 active:bg-red-800',
  };

  const radiusStyles = pill ? 'rounded-full' : 'rounded-xl';

  return (
    <button
      className={twMerge(
        clsx(
          baseStyles,
          sizeStyles[size],
          variantStyles[variant],
          radiusStyles,
          className
        )
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      ) : (
        leftIcon
      )}
      {children}
      {!isLoading && rightIcon}
    </button>
  );
};
