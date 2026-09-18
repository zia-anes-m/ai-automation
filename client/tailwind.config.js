/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        agent: {
          planner: '#3b82f6',
          executor: '#10b981',
          critic: '#f43f5e',
          synthesizer: '#a855f7',
        },
        cyber: {
          950: '#07090e',
          900: '#0c1017',
          850: '#111722',
          800: '#17202f',
          700: '#233047',
          600: '#334464',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-flow': 'glowFlow 4s ease infinite',
        'shimmer': 'shimmer 2.5s infinite',
      },
      keyframes: {
        glowFlow: {
          '0%, 100%': { opacity: '0.4', filter: 'blur(20px)' },
          '50%': { opacity: '0.8', filter: 'blur(30px)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        }
      }
    },
  },
  plugins: [],
}
