const path = require('path');

const config = {
  entry: {
    'worker': path.resolve(__dirname, './src/benchmark/webAccessibleResources/js/app/BenchmarkWorker.js')
  },
  mode: 'production',
  resolve: {
    alias: {
      'react': path.resolve('./node_modules/react'),
      'react-dom': path.resolve('./node_modules/react-dom')
    },
    extensions: ["*", ".js", ".jsx"]
  },
  output: {
    // Set a unique name to ensure the cohabitation of multiple webpack loader on the same page.
    chunkLoadingGlobal: 'dataChunkLoadingGlobal',
    path: path.resolve(__dirname, './build/all/webAccessibleResources/js/dist'),
    pathinfo: true,
    filename: '[name].js'
  }
};

exports.default = function (env) {
  env = env || {};
  // Enable debug mode.
  if (env && env.debug) {
    config.mode = "development";
    config.devtool = "inline-source-map";
  }
  return config;
};
