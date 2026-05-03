/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          primary: '#0f0f1a',
          card: '#1a1a2e',
          elevated: '#16213e',
        },
        accent: {
          primary: '#e94560',
          secondary: '#0f3460',
        },
        text: {
          primary: '#eaeaea',
          muted: '#8892b0',
        },
        citizen: '#4ade80',
        imposter: '#f87171',
        ready: '#4ade80',
        notReady: '#64748b'
      },
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
