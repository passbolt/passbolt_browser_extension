const path = require('path');

const config = {
  entry: {
    'app': path.resolve(__dirname, './src/all/contentScripts/js/app/App.js'),
    'setup': path.resolve(__dirname, './src/all/contentScripts/js/app/Setup.js'),
    'recover': path.resolve(__dirname, './src/all/contentScripts/js/app/Recover.js'),
    'login': path.resolve(__dirname, './src/all/contentScripts/js/app/Login.js'),
    'account-recovery': path.resolve(__dirname, './src/all/contentScripts/js/app/AccountRecovery.js'),
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
    chunkLoadingGlobal: 'contentScriptChunkLoadingGlobal',
    path: path.resolve(__dirname, './build/all/contentScripts/js/dist'),
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
