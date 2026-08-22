/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#00EB5B',
          dark: '#00C94D',
          light: '#E6FDF0',
        },
        ink: {
          DEFAULT: '#002B11',
          light: '#1B4A2D',
          muted: '#4A6B56',
        },
        surface: {
          DEFAULT: '#F7F7F7',
          white: '#FFFFFF',
          card: '#FFFFFF',
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
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Sora', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'sm': '6px',
        'md': '10px',
        'lg': '16px',
        '2xl': '20px',
        'full': '9999px',
      },
      boxShadow: {
        'subtle': '0 2px 8px rgba(0, 43, 17, 0.04)',
        'card': '0 4px 20px rgba(0, 43, 17, 0.06)',
        'hover': '0 10px 30px rgba(0, 43, 17, 0.12)',
        'modal': '0 20px 50px rgba(0, 43, 17, 0.25)',
      },
    },
  },
  plugins: [],
}
