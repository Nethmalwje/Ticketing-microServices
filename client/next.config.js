module.exports = {
  webpackDevMiddleware: (config) => {
    // Set the polling interval for file watching to 3000 milliseconds (3 seconds)
    config.watchOptions.poll = 3000;
    return config; // Return the modified config object
  },
};
