import React, { useId } from 'react';

/**
 * Custom GlobeTrotter mark: a globe with a tilted, dashed orbit ring and a
 * single "current destination" dot riding it — reads as motion/travel
 * rather than a static globe. Pure stroke/fill primitives (no hand-drawn
 * bezier paths) so it stays crisp at 18-44px.
 */
export const LogoMark: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <circle cx="12" cy="12" r="5.6" stroke="currentColor" strokeWidth="1.4" />
    <ellipse cx="12" cy="12" rx="2.2" ry="5.6" stroke="currentColor" strokeWidth="1.4" />
    <line x1="6.4" y1="12" x2="17.6" y2="12" stroke="currentColor" strokeWidth="1.4" />
    <ellipse
      cx="12"
      cy="12"
      rx="10"
      ry="3.7"
      stroke="currentColor"
      strokeWidth="1.1"
      strokeDasharray="1.3 2.1"
      strokeLinecap="round"
      opacity="0.8"
      transform="rotate(-24 12 12)"
    />
    <circle cx="21" cy="8.15" r="1.5" fill="currentColor" />
  </svg>
);

/**
 * Gemini-style 4-point sparkle mark — a single pinched star with concave
 * sides. Filled with a light brand gradient by default (white -> tan) so it
 * pops against a dark/brand-colored background, instead of Google's
 * blue/purple, so it stays on-brand while matching that shape language.
 * Pass `gradientFrom`/`gradientTo` to use it on a light background instead.
 */
export const SparkleMark: React.FC<
  React.SVGProps<SVGSVGElement> & { gradientFrom?: string; gradientTo?: string }
> = ({ gradientFrom = '#FFFFFF', gradientTo = '#E7D3BE', ...props }) => {
  const gradientId = useId();
  return (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
      <defs>
        <linearGradient id={gradientId} x1="2" y1="2" x2="22" y2="22">
          <stop offset="0" stopColor={gradientFrom} />
          <stop offset="1" stopColor={gradientTo} />
        </linearGradient>
      </defs>
      <path
        d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"
        fill={`url(#${gradientId})`}
      />
    </svg>
  );
};

export const Logo: React.FC<{ wordmarkClassName?: string; markClassName?: string }> = ({
  wordmarkClassName = 'text-xl font-extrabold tracking-tight text-ink',
  markClassName = '',
}) => (
  <>
    <div
      className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-dark text-white shadow-sm ${markClassName}`}
    >
      <LogoMark className="h-6 w-6" />
    </div>
    <span className={wordmarkClassName}>
      Globe<span className="text-brand-dark">Trotter</span>
    </span>
  </>
);
