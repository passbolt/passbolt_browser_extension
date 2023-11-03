const path = require('path');
const TerserPlugin = require("terser-webpack-plugin");

const config = {
  entry: {
    'index': path.resolve(__dirname, './src/all/background_page/index.js'),
  },
  mode: 'production',
  module: {
    noParse: /\.wasm$/,
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /(node_modules[\\/]((?!(passbolt\-styleguide))))/,
        loader: "babel-loader",
        options: {
          presets: ["@babel/react"],
        }
      },
      {
        test: /\.wasm$/,
        loader: 'base64-loader',
        type: 'javascript/auto',
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
  resolve: {
    extensions: ["*", ".js"],
    fallback: {
      crypto: false,
      path: false,
      fs: false,
    }
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
    config.optimization.minimize = false;
    config.optimization.minimizer = [];
  }
  return config;
};
