/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      spacing: {
        'content': '64rem'
      }
    },
    colors: {
      transparent: "transparent",
      'primary': "#38023b",
      'secondary': "#a288e3",
      'tertiary': "#bbd5ed",
      'accent-red': "#fb3640",
      'accent-yellow': "#fde74c",
      'accent-green': "#69fc96",
      'white': "#fdeefd",
      'grey': "#999999",
      'black': "#110111",
      'background': "#fdebfe"
    }
  },
  plugins: [],
}

