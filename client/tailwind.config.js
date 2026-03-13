/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'f1-red': '#E10600',
        'f1-dark': '#0F0F13',
        'f1-panel': '#16161F',
        'f1-card': '#1C1C28',
        'f1-gold': '#F5C518',
        'f1-silver': '#BFC0C0',
        'f1-bronze': '#CD7F32',
        'f1-admin': '#FF8C00',
        // Team colors
        'team-mercedes': '#27F4D2',
        'team-ferrari': '#E8002D',
        'team-redbull': '#3671C6',
        'team-mclaren': '#FF8000',
        'team-astonmartin': '#229971',
        'team-alpine': '#FF87BC',
        'team-williams': '#1868DB',
        'team-rb': '#6692FF',
        'team-haas': '#B6BABD',
        'team-audi': '#FF0000',
        'team-cadillac': '#DAA520',
        'glass-border': 'rgba(255, 255, 255, 0.05)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'slide-up': 'slide-up 0.5s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
        'shimmer': 'shimmer 1.5s infinite',
        'live-pulse': 'live-pulse 1.5s ease-in-out infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(245, 197, 24, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(245, 197, 24, 0.6)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'live-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
      },
    },
  },
  plugins: [],
};
