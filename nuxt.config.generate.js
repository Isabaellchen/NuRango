module.exports = Object.assign(
  require('./nuxt.config.js'),
  {
    build: {
        publicPath: 'static/',
    }
  }
);