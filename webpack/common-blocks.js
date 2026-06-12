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

const browserPolyfillPlugin = new webpack.ProvidePlugin({
  // Inject browser polyfill as a global API, and adapt it depending on the environment (MV2/MV3/Windows app).
  browser: path.resolve(__dirname, '../src/all/common/polyfill/browserPolyfill.js'),
});

const babelRule = {
  test: /\.(js|jsx)$/,
  exclude: /(node_modules[\\/]((?!(passbolt\-styleguide))))/,
  loader: "babel-loader",
  options: {
    presets: ["@babel/react"],
  },
};

const svgRule = {
  test: /\.svg$/i,
  issuer: /\.[jt]sx?$/,
  use: [
    {
      loader: "@svgr/webpack",
      options: {
        svgoConfig: {
          plugins: [
            {
              name: 'preset-default',
              params: {
                overrides: {
                  removeViewBox: false,
                  cleanupIds: false,
                  removeTitle: false,
                  removeDesc: false,
                },
              },
            },
            {
              name: 'prefixIds',
              params: {
                prefixIds: false,
                prefixClassNames: false,
              },
            },
          ],
        },
      },
    },
  ],
};

const splitChunksConfig = {
  minSize: 0,
  cacheGroups: {
    commons: {
      test: /[\\/]node_modules[\\/]((?!(passbolt\-styleguide)).*)[\\/]/,
      name: 'vendors',
      chunks: 'all',
    },
  },
};

const reactAlias = {
  'react': path.resolve('./node_modules/react'),
  'react-dom': path.resolve('./node_modules/react-dom'),
};

// Absolute path consumed by `extends` in child webpack configs.
const baseConfigPath = path.resolve(__dirname, './base.config.js');

module.exports = {
  browserPolyfillPlugin,
  babelRule,
  svgRule,
  splitChunksConfig,
  reactAlias,
  baseConfigPath,
};
