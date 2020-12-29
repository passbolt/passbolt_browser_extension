const path = require('path');

const config = {
  entry: {
    'app': path.resolve(__dirname, './src/all/data/js/app/App.js'),
    'setup': path.resolve(__dirname, './src/all/data/js/app/Setup.js'),
    'recover': path.resolve(__dirname, './src/all/data/js/app/Recover.js'),
    'login': path.resolve(__dirname, './src/all/data/js/app/Login.js'),
    'quickaccess': path.resolve(__dirname, './src/all/data/js/quickaccess/popup/Popup.js')
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
    path: path.resolve(__dirname, './build/all/data/js/dist'),
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
