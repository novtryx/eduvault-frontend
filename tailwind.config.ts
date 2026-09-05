import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: '1.5rem',
    },
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        // ── Novtryx School design system ────────────────────────────
        navy: {
          DEFAULT: '#172033',
          50: '#f4f5f7',
          100: '#e6e8ec',
          200: '#c7ccd6',
          300: '#9aa3b5',
          400: '#67728c',
          500: '#4a5470',
          600: '#38415a',
          700: '#293148',
          800: '#1e2537',
          900: '#172033',
          950: '#0e1220',
        },
        slate: {
          DEFAULT: '#5F6B7A',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          muted: '#F7F7F5',
        },
        border: {
          DEFAULT: '#E5E7EB',
        },
        success: {
          DEFAULT: '#1E7A4C',
          bg: '#EAF6EF',
        },
        warning: {
          DEFAULT: '#9A6B14',
          bg: '#FBF3E1',
        },
        danger: {
          DEFAULT: '#B4232C',
          bg: '#FBEAEA',
        },
        info: {
          DEFAULT: '#25588F',
          bg: '#EAF1FA',
        },
        // shadcn-style semantic tokens, mapped onto the palette above via CSS vars
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
      },
      borderRadius: {
        lg: '10px',
        md: '8px',
        sm: '6px',
        xl: '14px',
      },
      boxShadow: {
        subtle: '0 1px 2px 0 rgb(23 32 51 / 0.04)',
        card: '0 1px 3px 0 rgb(23 32 51 / 0.06), 0 1px 2px -1px rgb(23 32 51 / 0.04)',
        popover: '0 4px 24px -4px rgb(23 32 51 / 0.12), 0 2px 8px -2px rgb(23 32 51 / 0.08)',
      },
      keyframes: {
        'accordion-down': { from: { height: '0' }, to: { height: 'var(--radix-accordion-content-height)' } },
        'accordion-up': { from: { height: 'var(--radix-accordion-content-height)' }, to: { height: '0' } },
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'fade-in-up': { from: { opacity: '0', transform: 'translateY(4px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.15s ease-out',
        'fade-in-up': 'fade-in-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;