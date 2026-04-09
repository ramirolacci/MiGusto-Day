/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        migusto: {
          rojo: '#C60018',       // Rojo Mi Gusto oficial
          'rojo-oscuro': '#8B0000',
          'rojo-claro': '#E31C1C',
          dorado: '#C5A059',     // Dorado elegante
          'dorado-bright': '#E5C185',
          'dorado-oscuro': '#8E6F3E',
          crema: '#FDFCF0',      // Crema más premium
          'crema-oscuro': '#F2EBD3',
          tierra: '#1A1211',     // Tierra más profundo
          'tierra-oscuro': '#0D0807',
          'tierra-claro': '#2D1F1D',
          bronce: '#CD7F32',
          plata: '#C0C0C0',
          oro: '#FFD700',
        },
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
      backgroundImage: {
        'grain': "url(\"https://www.transparenttextures.com/patterns/carbon-fibre.png\")",
      },
      boxShadow: {
        'premium': '0 10px 30px -10px rgba(0, 0, 0, 0.5)',
        'premium-gold': '0 10px 30px -10px rgba(197, 160, 89, 0.3)',
      },
      keyframes: {
        shimmer: {
          '0%, 100%': { backgroundPosition: '0% center' },
          '50%': { backgroundPosition: '200% center' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.5', filter: 'blur(20px)' },
          '50%': { opacity: '0.8', filter: 'blur(25px)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
      animation: {
        shimmer: 'shimmer 3s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
        'float': 'float 4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
