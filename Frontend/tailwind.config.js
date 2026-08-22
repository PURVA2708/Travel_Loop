/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#00EB5B',
          dark: '#00C94D',
          light: '#E6FDF0',
          hover: '#00D150',
        },
        ink: {
          DEFAULT: '#002B11',
          light: '#2D4B38',
          muted: '#5B7565',
          border: '#D8E2DC',
        },
        surface: {
          DEFAULT: '#F7F7F7',
          white: '#FFFFFF',
          card: '#FFFFFF',
          alt: '#EFF2F0',
          dark: '#0E1512',
          subtle: '#EEF2EF',
        },
        night: '#000000',
        success: '#1FAE5C',
        warning: '#F5A623',
        danger: '#E5484D',
        info: '#2F80ED',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Sora', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '16px',
        '2xl': '20px',
        full: '9999px',
      },
      boxShadow: {
        subtle: '0 2px 8px rgba(0, 43, 17, 0.04)',
        card: '0 4px 20px rgba(0, 43, 17, 0.06)',
        hover: '0 10px 30px rgba(0, 43, 17, 0.12)',
        'card-rest': '0 2px 8px -2px rgba(0, 43, 17, 0.06)',
        'card-hover': '0 12px 24px -6px rgba(0, 43, 17, 0.12)',
        modal: '0 20px 40px -10px rgba(0, 43, 17, 0.25)',
      },
    },
  },
  plugins: [],
};
