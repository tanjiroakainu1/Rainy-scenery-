/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        horror: ['Cinzel', 'serif'],
        body: ['Crimson Text', 'serif'],
      },
      colors: {
        abyss: '#050508',
        blood: '#8b0000',
        ember: '#c45c26',
        fog: '#1a1a24',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        flicker: 'flicker 3s ease-in-out infinite',
      },
      keyframes: {
        flicker: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
          '75%': { opacity: '0.9' },
        },
      },
    },
  },
  plugins: [],
}
