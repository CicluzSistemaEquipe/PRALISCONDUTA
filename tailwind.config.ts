import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // tema oficial Pralís — preto base, marrom surface
        pralis: {
          // marrom agora é SURFACE (cards/painéis); fundo do app é preto
          marrom: '#5e3731',
          'marrom-dk': '#000000',
          'marrom-lk': '#7a4840',
          surface: '#5e3731',
          // acentos da marca
          ouro: '#b8860b',
          'ouro-lt': '#d4a017',
          laranja: '#f37435',
          'laranja-lt': '#ff8f5a',
          branco: '#ffffff',
          creme: '#e8cfa0',
          verde: '#4ade80',
          vermelho: '#c0392b',
          roxo: '#8e44ad',
        },
      },
      fontFamily: {
        display: ['MadeByDillan', 'Georgia', 'serif'],
        body: ['Montserrat', 'system-ui', 'sans-serif'],
        hand: ['TR Freehand', 'cursive'],
      },
      borderRadius: {
        card: '20px',
        pill: '999px',
      },
      boxShadow: {
        'pralis-glow': '0 0 40px rgba(243, 116, 53, 0.25)',
        'pralis-card': '0 8px 30px rgba(0, 0, 0, 0.3)',
        'play': '0 8px 24px rgba(243, 116, 53, 0.45)',
      },
      backgroundImage: {
        'pralis-radial': 'radial-gradient(ellipse 110% 60% at 50% 0%, rgba(184,134,11,0.40) 0%, transparent 65%)',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'pulse-soft': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'cursor-blink': {
          '0%, 49%': { opacity: '1' },
          '50%, 100%': { opacity: '0' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.8s linear infinite',
        'pulse-soft': 'pulse-soft 2.4s ease-in-out infinite',
        float: 'float 4s ease-in-out infinite',
        'cursor-blink': 'cursor-blink 1s step-end infinite',
      },
    },
  },
  plugins: [],
} satisfies Config
