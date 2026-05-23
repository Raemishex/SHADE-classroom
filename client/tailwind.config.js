/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'neon-red':    '#ff2d55',
        'neon-green':  '#39ff8f',
        'neon-blue':   '#4d9fff',
        'neon-purple': '#bf5fff',
        'bg-void':     '#07060f',
        'bg-surface':  '#0e0c1a',
        'bg-elevated': '#16132a',
        background: {
          primary: '#07060f',
          card:    '#0e0c1a',
          elevated:'#16132a',
        },
        accent: {
          primary:   '#ff2d55',
          secondary: '#16132a',
        },
        text: {
          primary: '#f0eeff',
          muted:   '#9b96c4',
        },
        citizen:  '#39ff8f',
        imposter: '#ff2d55',
        ready:    '#39ff8f',
        notReady: '#64748b',
      },
      fontFamily: {
        rajdhani: ['Rajdhani', 'sans-serif'],
        syne:     ['Syne', 'sans-serif'],
        mono:     ['Space Mono', 'monospace'],
        inter:    ['Syne', 'sans-serif'],
        orbitron: ['Rajdhani', 'sans-serif'],
      },
      boxShadow: {
        'neon-red':    '0 0 20px rgba(255,45,85,0.4), 0 0 60px rgba(255,45,85,0.1)',
        'neon-green':  '0 0 20px rgba(57,255,143,0.4), 0 0 60px rgba(57,255,143,0.1)',
        'neon-purple': '0 0 20px rgba(191,95,255,0.4), 0 0 60px rgba(191,95,255,0.1)',
      },
      animation: {
        'pulse-slow':  'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float':       'float 6s ease-in-out infinite',
        'scan':        'scan 2s linear infinite',
        'glow-pulse':  'glowPulse 2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        scan: {
          '0%':   { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.6' },
          '50%':      { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
