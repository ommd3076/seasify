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
        background: '#DBE2DB',
        canvas: '#DBE2DB',
        
        surface: {
          DEFAULT: '#F7F9F6',
          muted: '#EAEFEC',
          card: '#F2F5F1',
        },
        'surface-muted': '#EAEFEC',

        charcoal: {
          DEFAULT: '#242424',
          dark: '#1A1A1A',
          light: '#2E2E2E',
          surface: '#1E1E1E',
          card: '#2A2A2A',
          border: '#383838',
          muted: '#404040',
        },

        'text-primary': '#171A18',
        'text-secondary': '#737A75',
        primary: {
          DEFAULT: '#171A18',
          text: '#171A18',
        },
        secondary: {
          DEFAULT: '#737A75',
          text: '#737A75',
        },

        mint: {
          DEFAULT: '#A5F5A6',
          strong: '#68DD79',
          light: '#E2FBE3',
          dark: '#359D45',
        },
        'mint-strong': '#68DD79',

        lavender: {
          DEFAULT: '#C5A8F8',
          light: '#EDE2FD',
          dark: '#9F72ED',
        },

        border: {
          DEFAULT: '#D9DEDA',
          subtle: '#EAEFEC',
          strong: '#BCC5BD',
          dark: '#3A3A3A',
        },

        // Status indicator semantic colors
        status: {
          normal: '#68DD79',
          elevated: '#C5A8F8',
          low: '#8BA5F8',
          warning: '#F5A623',
          danger: '#E55353',
          maintenance: '#737A75',
        },

        // Backward compatibility
        danger: {
          DEFAULT: '#F87171',
          bg: '#FEE2E2',
        },
        warning: {
          DEFAULT: '#FBBF24',
          bg: '#FEF3C7',
        },

        // Semantic coastal namespace aliases
        coastal: {
          bg: '#DBE2DB',
          surface: '#F7F9F6',
          muted: '#EAEFEC',
          charcoal: '#242424',
          border: '#D9DEDA',
          mint: '#A5F5A6',
          'mint-strong': '#68DD79',
          lavender: '#C5A8F8',
          primary: '#171A18',
          secondary: '#737A75',
        },
      },
      borderRadius: {
        'panel': '28px',
        'card': '20px',
        'subpanel': '16px',
        'pill': '9999px',
        '28': '28px',
        '24': '24px',
        '20': '20px',
        '28px': '28px',
        '24px': '24px',
        '20px': '20px',
        '14px': '14px',
      },
      boxShadow: {
        'panel': '0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 6px -1px rgba(0, 0, 0, 0.02)',
        'card': '0 2px 8px -1px rgba(0, 0, 0, 0.04), 0 1px 4px -1px rgba(0, 0, 0, 0.02)',
        'card-hover': '0 6px 16px -2px rgba(0, 0, 0, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.03)',
        'charcoal': '0 8px 24px -4px rgba(36, 36, 36, 0.25), 0 4px 8px -2px rgba(36, 36, 36, 0.10)',
        'subtle': '0 2px 10px rgba(0, 0, 0, 0.04)',
        'float': '0 12px 32px -4px rgba(0, 0, 0, 0.12), 0 4px 12px -2px rgba(0, 0, 0, 0.06)',
        'glow-mint': '0 0 16px rgba(104, 221, 121, 0.35)',
        'glow-lavender': '0 0 16px rgba(197, 168, 248, 0.35)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '0.875rem' }],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
    },
  },
  plugins: [],
};
