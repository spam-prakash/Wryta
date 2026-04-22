/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          dark: '#0f172a',
          light: '#ebf2fa'
        },
        card: {
          // light: '#CCC5B9',
          // light: '#f0faae',
          light: '#E5E5E5',
          dark: '#0a1122'
        },
        minCard: {
          light: '#CCC5B9',
          dark: '#1E3E62'
        },
        text: {
          light: '#252422',
          dark: '#f1f5f9'
        },
        small: {
          light: '#403D39',
          dark: '#cbd5e1'
        },
        model: {
          light: '#403D39',
          dark: '#1E293B'
        },
        tag: {
          light: '#EB5E28',
          dark: '#FDC116'
        }
      }
    }
  },
  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/line-clamp')]
}
