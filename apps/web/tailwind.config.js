/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // iOS/macOS system colors (consumed via CSS vars; listed here for Tailwind JIT)
        ios: {
          blue: '#007AFF',
          green: '#34C759',
          red: '#FF3B30',
          orange: '#FF9500',
          purple: '#AF52DE',
          teal: '#30B0C7',
          indigo: '#5856D6',
          pink: '#FF2D55',
          yellow: '#FFCC00',
          mint: '#00C7BE',
        },
        // Kept for backward-compat references inside pages
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'SF Pro Display',
          'SF Pro Text',
          'Helvetica Neue',
          'Inter',
          'system-ui',
          'sans-serif',
        ],
        mono: ['SF Mono', 'JetBrains Mono', 'Fira Code', 'monospace'],
      },
      borderRadius: {
        'ios-xs': '4px',
        'ios-sm': '6px',
        ios: '10px',
        'ios-lg': '14px',
        'ios-xl': '20px',
        '2xl': '16px',
        '3xl': '24px',
      },
      boxShadow: {
        'ios-xs': '0 1px 2px rgba(0,0,0,0.04)',
        'ios-sm': '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'ios-md': '0 4px 6px rgba(0,0,0,0.05), 0 2px 4px rgba(0,0,0,0.04)',
        'ios-lg': '0 10px 20px rgba(0,0,0,0.08), 0 4px 8px rgba(0,0,0,0.04)',
        'ios-xl': '0 20px 40px rgba(0,0,0,0.10), 0 8px 16px rgba(0,0,0,0.06)',
      },
      transitionTimingFunction: {
        ios: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'ios-spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      transitionDuration: {
        120: '120ms',
        350: '350ms',
        400: '400ms',
      },
      animation: {
        'fade-in': 'fadeIn 200ms cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
        'slide-up': 'slideUp 300ms cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
        'scale-in': 'scaleIn 350ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'spin-ios': 'spin 0.8s linear infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: { from: { opacity: '0', transform: 'scale(0.94)' }, to: { opacity: '1', transform: 'scale(1)' } },
        spin: { to: { transform: 'rotate(360deg)' } },
      },
      backdropBlur: {
        ios: '20px',
        thin: '8px',
      },
    },
  },
  plugins: [],
};
