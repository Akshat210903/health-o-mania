import type {Config} from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        body: ['Inter', 'sans-serif'],
        headline: ['Inter', 'sans-serif'],
        pixel: ['"Press Start 2P"', 'monospace'],
        code: ['monospace'],
      },
      colors: {
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
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
        'clash-player': {
          '0%': { transform: 'translateX(0) rotate(0)' },
          '25%': { transform: 'translateX(50%) rotate(-5deg) scale(1.02)' },
          '50%': { transform: 'translateX(45%) rotate(5deg) scale(1.05)' },
          '75%': { transform: 'translateX(50%) rotate(-2deg) scale(1.02)' },
          '100%': { transform: 'translateX(0) rotate(0)' },
        },
        'clash-rival': {
          '0%': { transform: 'translateX(0) rotate(0)' },
          '25%': { transform: 'translateX(-50%) rotate(5deg) scale(1.02)' },
          '50%': { transform: 'translateX(-45%) rotate(-5deg) scale(1.05)' },
          '75%': { transform: 'translateX(-50%) rotate(2deg) scale(1.02)' },
          '100%': { transform: 'translateX(0) rotate(0)' },
        },
        'fly-from-left': {
          '0%': { left: '10%', opacity: '1', transform: 'scale(0.5) rotate(0deg)' },
          '100%': { left: '90%', opacity: '0', transform: 'scale(1.2) rotate(var(--tw-rotate))' },
        },
        'fly-from-right': {
          '0%': { right: '10%', opacity: '1', transform: 'scale(0.5) rotate(0deg)' },
          '100%': { right: '90%', opacity: '0', transform: 'scale(1.2) rotate(var(--tw-rotate))' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'clash-player': 'clash-player 1.5s ease-in-out 1',
        'clash-rival': 'clash-rival 1.5s ease-in-out 1',
        'fly-from-left': 'fly-from-left 1s ease-out forwards',
        'fly-from-right': 'fly-from-right 1s ease-out forwards',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;
