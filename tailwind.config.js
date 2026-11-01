/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Lighter neutral slate-graphite tone (NOT blue, NOT black)
        navy: {
          950: '#1a2232', // Elevated dark slate base (clean, soft, noticeably lighter than pitch black/abyss)
          900: '#242f44', // Surface card tone (soft graphite-slate)
          800: '#2b3850', // Elevated inner panel tone
          700: '#3d4d6b', // Clean visible border
          600: '#4e6185', // Divider / hover border
        },
        emerald: {
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
        },
        cyan: {
          400: '#38bdf8',
          500: '#06b6d4',
        },
        mint: '#a7f3d0',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 8s linear infinite',
        'fade-in': 'fadeIn 0.25s ease-in-out',
        'slide-in': 'slideIn 0.25s ease-out',
        'plume': 'plume 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-16px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        plume: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.7' },
          '50%': { transform: 'scale(1.08)', opacity: '0.9' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
