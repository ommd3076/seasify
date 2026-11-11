/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#DBE2DB',
        surface: {
          DEFAULT: '#F7F9F6',
          muted: '#EAEFEC',
          card: '#F2F5F1',
        },
        charcoal: {
          DEFAULT: '#242424',
          surface: '#1E1E1E',
          card: '#2A2A2A',
          border: '#383838',
          muted: '#404040',
        },
        primary: {
          text: '#171A18',
        },
        secondary: {
          text: '#737A75',
        },
        mint: {
          light: '#E2FBE3',
          DEFAULT: '#A5F5A6',
          strong: '#68DD79',
          dark: '#359D45',
        },
        lavender: {
          light: '#F3EEFD',
          DEFAULT: '#C5A8F8',
          dark: '#8B64DF',
        },
        border: {
          DEFAULT: '#D9DEDA',
          dark: '#3A3A3A',
        },
        danger: {
          DEFAULT: '#F87171',
          bg: '#FEE2E2',
        },
        warning: {
          DEFAULT: '#FBBF24',
          bg: '#FEF3C7',
        }
      },
      borderRadius: {
        '28': '28px',
        '24': '24px',
        '20': '20px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'subtle': '0 2px 10px rgba(0, 0, 0, 0.04)',
        'panel': '0 4px 20px rgba(0, 0, 0, 0.06)',
      }
    },
  },
  plugins: [],
}
