/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        midnight: '#050510',
        'neon-cyan': '#00f3ff',
        'electric-purple': '#bc13fe',
      },
    },
  },
  plugins: [],
}