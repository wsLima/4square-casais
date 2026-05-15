/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        wine: {
          DEFAULT: '#6B1E2E',
          light: '#8B2E42',
          pale: '#F5E8EC',
        },
        gold: {
          DEFAULT: '#C9933A',
          light: '#E8B560',
        },
        cream: '#FAF6F0',
        prose: '#3D2030',
        muted: '#8A6A76',
        fire: '#E85D2A',
        silence: '#4A6B8A',
        mature: '#2E7D4F',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease',
      },
    },
  },
  plugins: [],
}
