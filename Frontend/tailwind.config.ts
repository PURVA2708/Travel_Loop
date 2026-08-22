import type { Config } from 'tailwindcss';

// Design tokens — coffee/espresso palette.
// Keep this file the single source of truth for color/spacing/radius
// decisions — nobody should hardcode hex values in components.
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: ['class'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#A9784F',
          dark: '#6F4E37',
          light: '#E7D3BE',
          hover: '#8C623F',
        },
        ink: {
          DEFAULT: '#2E211B',
          light: '#4A362D',
          muted: '#7A6A5E',
          border: '#D9C7B8',
        },
        surface: {
          DEFAULT: '#FAF6F2',
          white: '#FFFFFF',
          card: '#FFFFFF',
          alt: '#F3EAE1',
          subtle: '#F1E7DC',
          dark: '#2E211B',
          darkAlt: '#3B2A21',
        },
        night: '#1A120D',
        success: '#1FAE5C',
        warning: '#F5A623',
        danger: '#E5484D',
        info: '#2F80ED',
      },
      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '16px',
        '2xl': '20px',
        full: '9999px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Sora', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        sm: '0 1px 2px rgba(46, 33, 27, 0.06)',
        md: '0 4px 16px rgba(46, 33, 27, 0.10)',
        lg: '0 12px 32px rgba(46, 33, 27, 0.16)',
        subtle: '0 2px 8px rgba(46, 33, 27, 0.04)',
        card: '0 4px 20px rgba(46, 33, 27, 0.06)',
        hover: '0 10px 30px rgba(46, 33, 27, 0.12)',
        'card-rest': '0 2px 8px -2px rgba(46, 33, 27, 0.06)',
        'card-hover': '0 12px 24px -6px rgba(46, 33, 27, 0.12)',
        modal: '0 20px 40px -10px rgba(46, 33, 27, 0.25)',
      },
    },
  },
  plugins: [],
} satisfies Config;
