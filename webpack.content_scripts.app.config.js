const path = require('path');

const config = {
  entry: {
    'app': path.resolve(__dirname, './src/all/content_scripts/js/app/App.js')
  },
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /(node_modules|bower_components)/,
        loader: "babel-loader",
        options: {
          presets: ["@babel/react"],
        }
      }
    ]
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
      filename: 'vendors/vendors-app.js'
    },
  },
  resolve: {extensions: ["*", ".js", ".jsx"]},
  output: {
    path: path.resolve(__dirname, './build/all/content_scripts/js/dist'),
    pathinfo: true,
    filename: '[name].js'
  }
};

exports.default = function (env) {
  // Enable debug mode.
  if (env.debug) {
    config.mode = "development";
    config.devtool = "inline-source-map";
  }
  return config;
};
