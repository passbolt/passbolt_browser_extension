const path = require('path');

const config = {
  entry: {
    'index': path.resolve(__dirname, './src/benchmark/background_page/index.js'),
  },
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /(node_modules[\\/]((?!(passbolt\-styleguide))))/,
        loader: "babel-loader",
        options: {
          presets: ["@babel/react"],
        }
      }
    ]
  },
  resolve: {
    alias: {
      'openpgp': path.resolve('./node_modules/openpgp/dist/openpgp.mjs')
    },
    extensions: ["*", ".js"],
    fallback: {crypto: false}
  },
  output: {
    // Set a unique name to ensure the cohabitation of multiple webpack loader on the same page.
    chunkLoadingGlobal: 'backgroundPageIndexChunkLoadingGlobal',
    path: path.resolve(__dirname, './build/all'),
    pathinfo: true,
    filename: '[name].min.js'
  }
};

exports.default = function (env) {
  env = env || {};
  // Enable debug mode.
  if (env.debug) {
    config.mode = "development";
    config.devtool = "inline-source-map";
  }
  return config;
};
