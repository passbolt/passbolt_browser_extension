const path = require('path');

const config = {
  entry: {
    'browser-integration': path.resolve(__dirname, './src/all/contentScripts/js/app/BrowserIntegration.js'),
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
  optimization: {
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
  resolve: {extensions: ["*", ".js", ".jsx"]},
  output: {
    // Set a unique name to ensure the cohabitation of multiple webpack loader on the same page.
    chunkLoadingGlobal: 'contentScriptBrowserIntegrationChunkLoadingGlobal',
    path: path.resolve(__dirname, './build/all/contentScripts/js/dist/browser-integration'),
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
  }
  return config;
};
