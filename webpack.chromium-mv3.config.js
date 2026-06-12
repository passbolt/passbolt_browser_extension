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
const path = require("path");
const { buildMv3Configs } = require("./webpack.mv3.config.js");
const WebExtPlugin = require("./webpack/webExtPlugin");
const applyOutputClean = require("./webpack/applyOutputClean");
const { COMMON_EXPECTED_FILES, MV3_EXPECTED_FILES } = require("./webpack/expectedBuildArtifacts");
const pkg = require("./package.json");

const isDevelopment = process.env.NODE_ENV === "development";
const configs = buildMv3Configs({
  manifestPath: path.resolve(__dirname, "./src/chrome-mv3/manifest.json"),
});

applyOutputClean(configs);

const webExtPlugin = new WebExtPlugin({
  sourceDir: path.resolve(__dirname, "./build/all"),
  artifactsDir: path.resolve(__dirname, "./dist/chromium-mv3"),
  filename: `passbolt-${pkg.version}${isDevelopment ? "-debug" : ""}.zip`,
  expectedCount: configs.length,
  expectedFiles: [...COMMON_EXPECTED_FILES, ...MV3_EXPECTED_FILES],
});

configs.forEach((config) => {
  config.plugins = [...(config.plugins || []), webExtPlugin];
});

module.exports = configs;
