module.exports = {
  style: {
    postcss: {
      plugins: [
        require('tailwindcss'),
        require('autoprefixer')
      ]
    }
  },
  webpack: {
    alias: {},
    plugins: [],
    configure: (webpackConfig) => {
      return webpackConfig;
    }
  }
} 