/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#eef4ed',
          100: '#d4e3d1',
          200: '#a8c7a3',
          300: '#7bab74',
          400: '#5a8f54',
          500: '#3d6b30',
          600: '#2f5625',
          700: '#24401c',
          800: '#1b3a2b',
          900: '#0f2818',
          950: '#08160e',
        },
        olive: {
          50: '#f5f6ee',
          100: '#e8ebd4',
          200: '#d1d7a8',
          300: '#b4c07c',
          400: '#97a857',
          500: '#7a8e3e',
          600: '#5c6b3f',
          700: '#4a5532',
          800: '#394229',
          900: '#2a3020',
        },
        earth: {
          50: '#faf7f1',
          100: '#f2ebdc',
          200: '#e4d4b5',
          300: '#d4bb8a',
          400: '#c4a268',
          500: '#a8916b',
          600: '#8a7556',
          700: '#6c5b42',
          800: '#4e412f',
          900: '#30281f',
        },
        warmwhite: '#f7f4ec',
        charcoal: '#2a2a2a',
        risk: {
          low: '#4a7c3a',
          moderate: '#d4a72c',
          elevated: '#e07a3c',
          high: '#c0392b',
          unavailable: '#6b6b6b',
        },
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', 'Times New Roman', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'fade-in-up': 'fadeInUp 0.7s ease-out',
        'slide-in-right': 'slideInRight 0.4s ease-out',
        'slow-rotate': 'slowRotate 60s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slowRotate: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
    },
  },
  plugins: [],
};
