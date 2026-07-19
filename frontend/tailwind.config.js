/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-poppins)', 'system-ui', 'sans-serif']
      },
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a'
        },
        'ia-navy': '#0B1F3A',
        'ia-navy-2': '#122B4E',
        'ia-navy-3': '#0A1830',
        'ia-blue': '#C9972E',
        'ia-blue-soft': '#DDAE4E',
        'ia-gold-tint': '#F4E4C1',
        'ia-green': '#16A34A',
        'ia-green-soft': '#22C55E',
        'ia-teal': '#2E6B6B',
        'ia-teal-dark': '#1F4F4F'
      },
      keyframes: {
        iaDrift: {
          from: { transform: 'translate(0,0) scale(1)' },
          to: { transform: 'translate(60px,40px) scale(1.15)' }
        },
        iaFloat1: { '0%,100%': { marginTop: '0' }, '50%': { marginTop: '-16px' } },
        iaFloat2: { '0%,100%': { marginTop: '0' }, '50%': { marginTop: '-22px' } },
        iaFloat3: { '0%,100%': { marginTop: '0' }, '50%': { marginTop: '-12px' } },
        iaPop: {
          from: { transform: 'translateY(30px) scale(.96)', opacity: 0 },
          to: { transform: 'none', opacity: 1 }
        },
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' }
        },
        fadeIn: {
          from: { opacity: 0, transform: 'translateY(10px)' },
          to: { opacity: 1, transform: 'translateY(0)' }
        }
      },
      animation: {
        marquee: 'marquee 22s linear infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
        'ia-drift1': 'iaDrift 18s ease-in-out infinite alternate',
        'ia-drift2': 'iaDrift 22s ease-in-out infinite alternate-reverse',
        'ia-drift3': 'iaDrift 26s ease-in-out infinite alternate',
        'ia-float1': 'iaFloat1 7s ease-in-out infinite',
        'ia-float2': 'iaFloat2 8s ease-in-out infinite',
        'ia-float3': 'iaFloat3 9s ease-in-out infinite',
        'ia-pop': 'iaPop .35s cubic-bezier(.2,.8,.2,1)'
      }
    },
  },
  plugins: [],
}

