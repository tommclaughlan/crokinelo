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
      'primary': "#7e70ca",
      'secondary': "#e99df5",
      'tertiary': "#a85fb4",
      'accent-red': "#fb3640",
      'accent-yellow': "#fde74c",
      'accent-green': "#69fc96",
      'white': "#fff",
      'grey': "#999999",
      'black': "#110111",
      'background': "#fdebfe",
      'border-lilac': "#e4cae6"
    }
  },
  plugins: [],
}

