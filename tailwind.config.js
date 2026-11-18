/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    container: { center: true, padding: { DEFAULT: '1rem', sm: '1.5rem', lg: '2rem' }, screens: { '2xl': '1280px' } },
    extend: {
      colors: {
        // Vermelho institucional extraído do logotipo oficial (#BB2026) e do site (#90210B)
        brand: {
          50: '#FDF3F2',
          100: '#FBE4E2',
          200: '#F6C7C3',
          300: '#EE9D96',
          400: '#E2675F',
          500: '#CF3A35',
          600: '#BB2026',
          700: '#9A1A1F',
          800: '#7C161B',
          900: '#5F1316',
          950: '#33080A',
        },
        // Pêssego usado no banner do site institucional (#FFD5BF)
        peach: {
          50: '#FFF8F4',
          100: '#FFEFE6',
          200: '#FFD5BF',
          300: '#FDBB98',
          400: '#F99A6C',
        },
        ink: {
          DEFAULT: '#1C1514',
          50: '#F8F6F5',
          100: '#EFEBE9',
          200: '#E0D9D6',
          300: '#C6BCB8',
          400: '#9E928D',
          500: '#776B67',
          600: '#5B504D',
          700: '#433A38',
          800: '#2C2423',
          900: '#1C1514',
        },
        canvas: '#FBF8F6',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans Variable"', 'system-ui', 'sans-serif'],
        display: ['"Fraunces Variable"', 'Georgia', 'serif'],
      },
      boxShadow: {
        soft: '0 1px 2px rgba(28,21,20,.04), 0 4px 16px -4px rgba(28,21,20,.06)',
        card: '0 1px 2px rgba(28,21,20,.04), 0 12px 32px -12px rgba(28,21,20,.12)',
        lift: '0 2px 4px rgba(28,21,20,.04), 0 24px 48px -16px rgba(28,21,20,.20)',
        brand: '0 10px 30px -10px rgba(187,32,38,.55)',
        inset: 'inset 0 0 0 1px rgba(28,21,20,.06)',
      },
      borderRadius: { '4xl': '2rem' },
      keyframes: {
        'float-y': { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
        'pop': { '0%': { transform: 'scale(1)' }, '40%': { transform: 'scale(1.25)' }, '100%': { transform: 'scale(1)' } },
        'shimmer': { '100%': { transform: 'translateX(100%)' } },
        'marquee': { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
      },
      animation: {
        'float-y': 'float-y 6s ease-in-out infinite',
        'float-y-slow': 'float-y 9s ease-in-out infinite',
        pop: 'pop .45s cubic-bezier(.2,.8,.2,1)',
        marquee: 'marquee 40s linear infinite',
        shimmer: 'shimmer 1.4s infinite',
      },
    },
  },
  plugins: [],
}
