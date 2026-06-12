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
const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const TerserPlugin = require("terser-webpack-plugin");
const buildPassboltEnvPlugin = require('./webpack/passboltEnvPlugin');
const { baseConfigPath } = require('./webpack/common-blocks');
const buildCommonConfigs = require('./webpack.common.config.js');

const isDevelopment = process.env.NODE_ENV === "development";

const buildBackgroundPageConfig = ({ manifestPath } = {}) => ({
  extends: baseConfigPath,
  entry: {
    'index': path.resolve(__dirname, './src/all/background_page/index.js'),
  },
  plugins: [
    buildPassboltEnvPlugin(),
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
  optimization: {
    minimize: !isDevelopment,
    minimizer: isDevelopment ? [] : [new TerserPlugin()],
  },
  resolve: {
    extensions: [".js"],
    fallback: { crypto: false },
  },
  output: {
    // Set a unique name to ensure the cohabitation of multiple webpack loader on the same page.
    chunkLoadingGlobal: 'backgroundPageIndexChunkLoadingGlobal',
    path: path.resolve(__dirname, './build/all'),
    pathinfo: true,
    filename: '[name].min.js',
  },
});

const buildMv2Configs = ({ manifestPath } = {}) => [
  ...buildCommonConfigs(),
  buildBackgroundPageConfig({ manifestPath }),
];

module.exports = { buildMv2Configs };
