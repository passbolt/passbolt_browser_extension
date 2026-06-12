/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         5.12.0
 */
const webpack = require('webpack');
const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const TerserPlugin = require("terser-webpack-plugin");
const buildPassboltEnvPlugin = require('./webpack/passboltEnvPlugin');
const { baseConfigPath } = require('./webpack/common-blocks');
const buildCommonConfigs = require('./webpack.common.config.js');

const isDevelopment = process.env.NODE_ENV === "development";

const sharedOptimization = {
  minimize: !isDevelopment,
  minimizer: isDevelopment ? [] : [new TerserPlugin()],
};

const sharedResolve = {
  extensions: [".js"],
  fallback: { crypto: false },
};

const buildServiceWorkerConfig = ({ manifestPath } = {}) => ({
  extends: baseConfigPath,
  entry: {
    'index': path.resolve(__dirname, './src/chrome-mv3/index.js'),
  },
  plugins: [
    buildPassboltEnvPlugin(),
    new webpack.ProvidePlugin({
      // Inject custom api client fetch to MV3 extension as workaround of the invalid certificate issue.
      customApiClientFetch: path.resolve(__dirname, './src/chrome-mv3/polyfill/fetchOffscreenPolyfill.js'),
      customNavigatorClipboard: path.resolve(__dirname, './src/chrome-mv3/polyfill/clipboardOffscreenPolyfill.js'),
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, './src/chrome-mv3/serviceWorker.js'),
          to: path.resolve(__dirname, './build/all/serviceWorker/serviceWorker.js'),
        },
        ...(manifestPath ? [{
          from: manifestPath,
          to: path.resolve(__dirname, './build/all/manifest.json'),
        }] : []),
      ],
    }),
  ],
  optimization: sharedOptimization,
  resolve: sharedResolve,
  output: {
    // Set a unique name to ensure the cohabitation of multiple webpack loader on the same page.
    chunkLoadingGlobal: 'serviceWorkerIndexChunkLoadingGlobal',
    path: path.resolve(__dirname, './build/all/serviceWorker'),
    pathinfo: true,
    filename: '[name].js',
  },
});

const offscreensConfig = {
  extends: baseConfigPath,
  entry: {
    'offscreen': path.resolve(__dirname, './src/chrome-mv3/offscreens/offscreen.js'),
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [{
        from: path.resolve(__dirname, './src/chrome-mv3/offscreens/offscreen.html'),
        to: path.resolve(__dirname, './build/all/offscreens/offscreen.html'),
      }],
    }),
  ],
  optimization: sharedOptimization,
  resolve: sharedResolve,
  output: {
    chunkLoadingGlobal: 'offscreensFetchChunkLoadingGlobal',
    path: path.resolve(__dirname, './build/all/offscreens'),
    pathinfo: true,
    filename: '[name].js',
  },
};

const buildMv3Configs = ({ manifestPath } = {}) => [
  ...buildCommonConfigs(),
  buildServiceWorkerConfig({ manifestPath }),
  offscreensConfig,
];

module.exports = { buildMv3Configs };
