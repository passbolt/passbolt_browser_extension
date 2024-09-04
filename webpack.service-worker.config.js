const webpack = require('webpack');
const path = require('path');
const TerserPlugin = require("terser-webpack-plugin");

const config = {
  entry: {
    'index': path.resolve(__dirname, './src/chrome/index.js'),
  },
  mode: 'production',
  plugins: [
    new webpack.ProvidePlugin({
      // Inject browser polyfill as a global API, and adapt it depending on the environment (MV2/MV3/Windows app).
      browser: path.resolve(__dirname, './src/all/common/polyfill/browserPolyfill.js'),
      // Inject custom api client fetch to MV3 extension as workaround of the invalid certificate issue.
      customApiClientFetch: path.resolve(__dirname, './src/chrome/polyfill/fetchOffscreenPolyfill.js'),
    })
  ],
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
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()],
    splitChunks: {
      minSize: 0,
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/]((?!(passbolt\-styleguide)).*)[\\/]/,
          name: 'vendors',
          chunks: 'all'
        },
      }
    },
  },
  resolve: {extensions: ["*", ".js"], fallback: {crypto: false}},
  output: {
    // Set a unique name to ensure the cohabitation of multiple webpack loader on the same page.
    chunkLoadingGlobal: 'serviceWorkerIndexChunkLoadingGlobal',
    path: path.resolve(__dirname, './build/all/serviceWorker'),
    pathinfo: true,
    filename: '[name].js'
  }
};

exports.default = function (env) {
  env = env || {};
  // Enable debug mode.
  if (env.debug) {
    config.mode = "development";
    config.devtool = "inline-source-map";
    config.optimization.minimize = false;
    config.optimization.minimizer = [];
  }
  return config;
};
