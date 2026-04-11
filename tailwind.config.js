/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./public/**/*.{html,js}"],
  theme: {
    extend: {
      colors: {
        "inverse-primary": "#fdb4b2",
        "surface-container-highest": "#fbdeb8",
        "on-surface-variant": "#524343",
        "outline": "#847372",
        "tertiary": "#3b3434",
        "on-primary": "#ffffff",
        "on-secondary-container": "#79583f",
        "surface-container-low": "#fff1e3",
        "surface-container-high": "#ffe4c2",
        "background": "#fff8f3",
        "on-secondary": "#ffffff",
        "secondary-fixed": "#ffdcc4",
        "inverse-surface": "#3e2d13",
        "tertiary-fixed": "#ebe0df",
        "on-tertiary": "#ffffff",
        "secondary": "#79573e",
        "surface-tint": "#874f4e",
        "primary-container": "#723d3d",
        "surface-variant": "#fbdeb8",
        "surface-dim": "#f3d6b0",
        "surface-container-lowest": "#ffffff",
        "secondary-fixed-dim": "#eabe9f",
        "surface": "#fff8f3",
        "outline-variant": "#d7c2c1",
        "surface-container": "#ffebd3",
        "on-background": "#271903",
        "on-primary-container": "#f2aba9",
        "primary": "#572728",
        "secondary-container": "#ffd1b1",
        "on-surface": "#271903",
        "surface-bright": "#fff8f3",
        "inverse-on-surface": "#ffeedb",
        "tertiary-container": "#524b4b",
        "primary-fixed": "#ffdad8",
        "on-tertiary-container": "#c5bbbb",
        "error": "#ba1a1a"
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
        "full": "9999px"
      },
      fontFamily: {
        "headline": ["Newsreader", "serif"],
        "body": ["Plus Jakarta Sans", "sans-serif"],
        "label": ["Plus Jakarta Sans", "sans-serif"]
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries')
  ],
}