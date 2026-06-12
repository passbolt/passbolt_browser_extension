const webpack = require('webpack');
const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const TerserPlugin = require("terser-webpack-plugin");
const buildPassboltEnvPlugin = require('./webpack/passboltEnvPlugin');

const buildSafariBackgroundConfig = ({ manifestPath } = {}) => {
  const isDevelopment = process.env.NODE_ENV === "development";
  return {
    entry: {
      'index': path.resolve(__dirname, './src/safari/background_page/index.js'),
    },
    mode: isDevelopment ? 'development' : 'production',
    devtool: isDevelopment ? 'inline-source-map' : false,
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
      minimize: !isDevelopment,
      minimizer: isDevelopment ? [] : [new TerserPlugin()],
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
      chunkLoadingGlobal: 'backgroundPageIndexChunkLoadingGlobal',
      path: path.resolve(__dirname, './build/all'),
      pathinfo: true,
      filename: '[name].min.js'
    },
    plugins: [
      buildPassboltEnvPlugin(),
      new webpack.ProvidePlugin({
        // Inject browser polyfill as a global API, and adapt it depending on the environment (MV2/MV3/Windows app).
        browser: path.resolve(__dirname, './src/safari/common/polyfill/safariBrowserPolyfill.js'),
        customApiClientFetch: path.resolve(__dirname, './src/safari/common/polyfill/fetchPolyfill.js'),
        customFileService: path.resolve(__dirname, './src/safari/background_page/service/file/fileService.js'),
      }),
      new webpack.NormalModuleReplacementPlugin(/service\/file\/fileService$/, "../../../../safari/background_page/service/file/fileService"),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: path.resolve(__dirname, './src/all/background_page/index.html'),
            to: path.resolve(__dirname, './build/all/index.html'),
          },
          ...(manifestPath ? [{
            from: manifestPath,
            to: path.resolve(__dirname, './build/all/manifest.json'),
          }] : []),
        ],
      }),
    ],
  };
};

module.exports = { buildSafariBackgroundConfig };
