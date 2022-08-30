const path = require('path');

const config = {
  entry: {
    'account-recovery': path.resolve(__dirname, './src/all/webAccessibleResources/js/app/AccountRecovery.js'),
    'app': path.resolve(__dirname, './src/all/webAccessibleResources/js/app/App.js'),
    'setup': path.resolve(__dirname, './src/all/webAccessibleResources/js/app/Setup.js'),
    'recover': path.resolve(__dirname, './src/all/webAccessibleResources/js/app/Recover.js'),
    'login': path.resolve(__dirname, './src/all/webAccessibleResources/js/app/Login.js'),
    'quickaccess': path.resolve(__dirname, './src/all/webAccessibleResources/js/app/QuickAccess.js')
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
