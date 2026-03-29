/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        violet: { 50:'#f5f3ff', 100:'#ede9fe', 500:'#8b5cf6', 600:'#7c3aed', 700:'#6d28d9', 900:'#4c1d95' },
        pink:   { 100:'#fce7f3', 300:'#f9a8d4', 500:'#ec4899' },
        nude:   { 50:'#fdf8f0', 100:'#faf0e6', 200:'#f5e6d3' }
      },
      backgroundImage: {
        'grad-main': 'linear-gradient(135deg, #1a0a2e 0%, #0f0f0f 50%, #1a0a1a 100%)',
        'grad-card': 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(236,72,153,0.06))',
        'grad-btn':  'linear-gradient(135deg, #7c3aed, #ec4899)'
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] }
    }
  },
  plugins: []
};
