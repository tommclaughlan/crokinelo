/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      spacing: {
        'content': '64rem'
      },
      animation: {
        marquee: 'marquee 35s linear infinite',
        marquee2: 'marquee 35s linear infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        marquee2: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0%)' },
        },
      },
    },
    colors: {
      transparent: "transparent",
      'primary': "#7e70ca",
      'secondary': "#e99df5",
      'tertiary': "#a85fb4",
      'accent-red': "#fb3640",
      'accent-yellow': "#fde74c",
      'accent-green': "#33dc67",
      'white': "#fff",
      'grey': "#999999",
      'black': "#110111",
      'background': "#fdebfe",
      'border-lilac': "#e4cae6"
    }
  },
  variants: {
    extend: {
      animation: ['hover', 'focus'],
    }
  },
  plugins: [],
}

