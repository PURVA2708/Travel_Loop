import type { Config } from 'tailwindcss';

// Tokens sourced from GlobeTrotter_Architecture_Roadmap.md Section 5.4-5.6
// (TripAdvisor-inspired palette). Keep this file the single source of
// truth for color/spacing/radius decisions — nobody should hardcode hex
// values in components.
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: ['class'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#00EB5B',
          dark: '#00C94D',
        },
        ink: '#002B11',
        surface: {
          DEFAULT: '#F7F7F7',
          white: '#FFFFFF',
          dark: '#0E1512',
          darkAlt: '#151D19',
        },
        night: '#000000',
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
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Sora', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        sm: '0 1px 2px rgba(0, 43, 17, 0.06)',
        md: '0 4px 16px rgba(0, 43, 17, 0.10)',
        lg: '0 12px 32px rgba(0, 43, 17, 0.16)',
      },
    },
  },
  plugins: [],
} satisfies Config;
