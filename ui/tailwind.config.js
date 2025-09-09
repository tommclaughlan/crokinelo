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
        colors: {
            'primary': "var(--primary-color)",
            'secondary': "var(--secondary-color)",
            'tertiary': "var(--tertiary-color)",
            'primary-light': "var(--primary-light-color)",
            'secondary-light': "var(--secondary-light-color)",
            'tertiary-light': "var(--tertiary-light-color)",
            'primary-dark': "var(--primary-dark-color)",
            'secondary-dark': "var(--secondary-dark-color)",
            'tertiary-dark': "var(--tertiary-dark-color)",
            'accent-red': "var(--accent-red)",
            'accent-yellow': "var(--accent-yellow)",
            'accent-green': "var(--accent-green)",
            'white': "var(--white-color)",
            'grey': "var(--grey-color)",
            'black': "var(--black-color)",
            'background': "var(--background-color)",
            'border-lilac': "var(--border-lilac)",
        }
    }
  },
  variants: {
    extend: {
      animation: ['hover', 'focus'],
    }
  },
  plugins: [],
}

