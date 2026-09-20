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
        obsidian: {
          950: '#06070a',
          900: '#0b0d13',
          850: '#10131b',
          800: '#161a25',
          750: '#1d2231',
          700: '#252b3e',
          600: '#343c56',
        },
        surface: {
          base: '#090a0f',
          card: '#0f1219',
          elevated: '#151923',
          overlay: '#1c2230',
          border: 'rgba(255, 255, 255, 0.07)',
          'border-strong': 'rgba(255, 255, 255, 0.14)',
          'border-active': 'rgba(99, 102, 241, 0.4)',
        },
        agent: {
          planner: {
            DEFAULT: '#6366f1',
            light: '#818cf8',
            dark: '#4f46e5',
            surface: 'rgba(99, 102, 241, 0.08)',
            border: 'rgba(99, 102, 241, 0.25)',
          },
          executor: {
            DEFAULT: '#06b6d4',
            light: '#22d3ee',
            dark: '#0891b2',
            surface: 'rgba(6, 182, 212, 0.08)',
            border: 'rgba(6, 182, 212, 0.25)',
          },
          critic: {
            DEFAULT: '#f43f5e',
            light: '#fb7185',
            dark: '#e11d48',
            surface: 'rgba(244, 63, 94, 0.08)',
            border: 'rgba(244, 63, 94, 0.25)',
          },
          synthesizer: {
            DEFAULT: '#8b5cf6',
            light: '#a78bfa',
            dark: '#7c3aed',
            surface: 'rgba(139, 92, 246, 0.08)',
            border: 'rgba(139, 92, 246, 0.25)',
          },
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        'surface-subtle': '0 1px 3px rgba(0, 0, 0, 0.4), 0 1px 2px rgba(0, 0, 0, 0.24)',
        'surface-elevated': '0 10px 30px -10px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
        'glow-indigo': '0 0 25px -5px rgba(99, 102, 241, 0.25)',
        'glow-cyan': '0 0 25px -5px rgba(6, 182, 212, 0.25)',
        'glow-rose': '0 0 25px -5px rgba(244, 63, 94, 0.25)',
        'glow-violet': '0 0 25px -5px rgba(139, 92, 246, 0.25)',
      },
      animation: {
        'pulse-subtle': 'pulseSubtle 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.25s ease-out forwards',
        'stream-cursor': 'streamCursor 1s step-end infinite',
      },
      keyframes: {
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        streamCursor: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        }
      }
    },
  },
  plugins: [],
}
