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
 *
 * Base webpack config inherited by webpack.common.config.js entries and
 * webpack.mv2.config.js via the `extends` field. webpack-cli merges this base
 * with each child via webpack-merge: arrays (plugins, module.rules) concat,
 * objects (optimization, resolve) deep-merge.
 */
const { browserPolyfillPlugin, babelRule, splitChunksConfig } = require('./common-blocks');

const isDevelopment = process.env.NODE_ENV === "development";

module.exports = {
  mode: isDevelopment ? 'development' : 'production',
  devtool: isDevelopment ? 'inline-source-map' : false,
  plugins: [browserPolyfillPlugin],
  module: {
    rules: [babelRule],
  },
  optimization: {
    splitChunks: splitChunksConfig,
  },
};
