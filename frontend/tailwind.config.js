/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: '#315C46',
          deep: '#203A2E',
          dark: '#1B3127',
          light: '#3E7358',
          surface: '#EBF2EE',
          subtle: '#F2F6F4',
        },
        charcoal: {
          DEFAULT: '#20231F',
          deep: '#171A17',
          pure: '#0F120F',
          light: '#2D312C',
        },
        ivory: {
          DEFAULT: '#F8F7F3',
          warm: '#F2EFE8',
          card: '#FFFFFF',
          dark: '#EAE6DC',
        },
        neutral: {
          border: '#E6E4DD',
          'border-dark': '#D8D5CB',
          muted: '#74776F',
          subtle: '#9A9C96',
        },
        saffron: {
          DEFAULT: '#C58A43',
          deep: '#A77030',
          light: '#DCA25D',
          subtle: '#FAF4EB',
        },
        status: {
          success: '#2D6A4F',
          'success-bg': '#EAF3ED',
          warning: '#B5651D',
          'warning-bg': '#FCF4EA',
          error: '#A33316',
          'error-bg': '#FDF2F0',
          info: '#26547C',
          'info-bg': '#EDF4FA',
        }
      },
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        devanagari: ['"Noto Sans Devanagari"', 'sans-serif'],
        mono: ['"Space Grotesk"', 'monospace'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(32, 35, 31, 0.04), 0 1px 2px -1px rgba(32, 35, 31, 0.04)',
        'card': '0 4px 12px -2px rgba(32, 35, 31, 0.05), 0 2px 6px -2px rgba(32, 35, 31, 0.03)',
        'elevated': '0 12px 32px -4px rgba(32, 35, 31, 0.08), 0 4px 12px -2px rgba(32, 35, 31, 0.04)',
        'cinematic': '0 20px 48px -8px rgba(23, 26, 23, 0.45)',
      }
    },
  },
  plugins: [],
}
