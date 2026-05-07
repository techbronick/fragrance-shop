import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '1.5rem',
        md: '2rem',
        lg: '3rem',
        xl: '4rem',
      },
      screens: {
        '2xl': '1280px',
      },
    },
    extend: {
      // All tokens are EXTEND-only so Tailwind defaults stay intact.
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'caption':  ['13px', { lineHeight: '1.5',  letterSpacing: '0' }],
        'body':     ['16px', { lineHeight: '1.5',  letterSpacing: '0' }],
        'body-lg':  ['18px', { lineHeight: '1.5',  letterSpacing: '0' }],
        'h3':       ['18px', { lineHeight: '1.3',  letterSpacing: '0' }],
        'h2':       ['22px', { lineHeight: '1.3',  letterSpacing: '0' }],
        'h1':       ['28px', { lineHeight: '1.2',  letterSpacing: '-0.02em' }],
        'display':  ['36px', { lineHeight: '1.1',  letterSpacing: '-0.02em' }],
        'h3-md':       ['20px', { lineHeight: '1.3',  letterSpacing: '0' }],
        'h2-md':       ['24px', { lineHeight: '1.3',  letterSpacing: '0' }],
        'h1-md':       ['36px', { lineHeight: '1.2',  letterSpacing: '-0.02em' }],
        'display-md':  ['56px', { lineHeight: '1.1',  letterSpacing: '-0.02em' }],
      },
      borderRadius: {
        sm:   '4px',
        md:   '8px',
        lg:   '16px',
        pill: '9999px',
      },
      transitionDuration: {
        'instant':  '100ms',
        'quick':    '200ms',
        'standard': '350ms',
        'slow':     '600ms',
      },
      transitionTimingFunction: {
        'default': 'cubic-bezier(0.2, 0, 0, 1)',
      },
      colors: {
        paper:        'hsl(var(--paper))',
        surface:      'hsl(var(--surface))',
        'surface-2':  'hsl(var(--surface-2))',
        border:       'hsl(var(--border))',
        'text-faint':  'hsl(var(--text-faint))',
        'text-muted':  'hsl(var(--text-muted))',
        text:          'hsl(var(--text))',
        'text-strong': 'hsl(var(--text-strong))',
        mocha:         'hsl(var(--mocha))',
        'mocha-hover': 'hsl(var(--mocha-hover))',
        'mocha-soft':  'hsl(var(--mocha-soft))',
        success:       'hsl(var(--success))',
        error:         'hsl(var(--error))',
        // shadcn legacy aliases — pointed at new tokens so existing components compile.
        background:           'hsl(var(--paper))',
        foreground:           'hsl(var(--text))',
        primary: {
          DEFAULT:    'hsl(var(--mocha))',
          foreground: 'hsl(var(--paper))',
        },
        secondary: {
          DEFAULT:    'hsl(var(--surface-2))',
          foreground: 'hsl(var(--text))',
        },
        destructive: {
          DEFAULT:    'hsl(var(--error))',
          foreground: 'hsl(var(--paper))',
        },
        muted: {
          DEFAULT:    'hsl(var(--surface-2))',
          foreground: 'hsl(var(--text-muted))',
        },
        accent: {
          DEFAULT:    'hsl(var(--mocha-soft))',
          foreground: 'hsl(var(--text-strong))',
        },
        popover: {
          DEFAULT:    'hsl(var(--surface))',
          foreground: 'hsl(var(--text))',
        },
        card: {
          DEFAULT:    'hsl(var(--surface))',
          foreground: 'hsl(var(--text))',
        },
        input:        'hsl(var(--border))',
        ring:         'hsl(var(--mocha))',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to:   { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to:   { height: '0' },
        },
        'shimmer': {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'marquee': {
          from: { transform: 'translateX(0)' },
          to:   { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up':   'accordion-up 0.2s ease-out',
        'shimmer':        'shimmer 1.5s linear infinite',
        'marquee':        'marquee 120s linear infinite',
      },
    },
  },
  plugins: [
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require("tailwindcss-animate"),
  ],
} satisfies Config;
