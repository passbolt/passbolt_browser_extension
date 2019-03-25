const path = require('path');

module.exports = {
  entry: {
    popup: './src/all/data/js/quickaccess/popup/Popup.js'
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
  externals: {
    react: 'React',
    'react-dom': 'ReactDOM'
  },
  resolve: { extensions: ["*", ".js", ".jsx"] },
  output: {
    path: path.resolve(__dirname, 'build/all/data/js/quickaccess'),
    pathinfo: true,
    filename: '[name].js'
  }
};
