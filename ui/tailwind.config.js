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
      'primary': "#38023b",
      'secondary': "#a288e3",
      'tertiary': "#bbd5ed",
      'accent-red': "#fb3640",
      'accent-yellow': "#fde74c",
      'accent-green': "#69fc96",
      'white': "#fff",
      'grey': "#666",
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

