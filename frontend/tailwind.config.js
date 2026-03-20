/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'smoke-dark': '#0d0d1a',
        'smoke-mid': '#16213e',
        'smoke-card': '#1a1a2e',
        'accent-red': '#e94560',
        'accent-blue': '#0f3460',
        'accent-glow': '#533483',
        'organ-healthy': '#ff8fab',
        'organ-mild': '#e89a9a',
        'organ-moderate': '#a56060',
        'organ-severe': '#4a3030',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          'from': { textShadow: '0 0 10px #e94560, 0 0 20px #e94560' },
          'to': { textShadow: '0 0 20px #e94560, 0 0 40px #e94560, 0 0 80px #e94560' },
        },
      },
      backgroundImage: {
        'hero-gradient': 'radial-gradient(ellipse at center, #16213e 0%, #0d0d1a 80%)',
        'card-gradient': 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
      },
      boxShadow: {
        'glow-red': '0 0 30px rgba(233, 69, 96, 0.4)',
        'glow-blue': '0 0 30px rgba(15, 52, 96, 0.6)',
        'card': '0 8px 32px rgba(0,0,0,0.6)',
      },
    },
  },
  plugins: [],
}
