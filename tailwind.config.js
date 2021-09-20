module.exports = {
  purge: [
    './src/**/*.ts',
    './src/**/*.tsx',
  ],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        yellow: {
          '100': '#FFFFF0',
          '200': '#FEFCBF',
          '300': '#FAF089',
          '400': '#FCD535',
          '500': '#F0B909',
          '600': '#C99400',
          '700': '#B7791F',
          '800': '#975A16',
          '900': '#744210',
        },
        black: '#212833',
      }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
