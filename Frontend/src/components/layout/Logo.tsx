import React from 'react';

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
