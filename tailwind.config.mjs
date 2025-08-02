/** @type {import('tailwindcss').Config} */

export default {
  content: ['./src/**/*.{mjs,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      animation: {
        'gradient-x': 'gradient-x 15s ease infinite',
        'bounce-slow': 'bounce 3s ease-in-out infinite'
      },
      keyframes: {
        'gradient-x': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          }
        }
      },
      perspective: {
        1000: '1000px'
      }
    }
  },
  plugins: [],
  // Enable RTL support
  corePlugins: {
    // Enable all plugins including direction-specific ones
  }
}
