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
 * Default entry point picked up by `webpack` (no `--config`). Concatenates the
 * 4 per-browser configurations so a single `npm run build` (or
 * `npm run build -- --watch`) produces every package.
 *
 * Sequential execution is mandatory: every browser writes to the shared
 * `build/all/` directory and zips it via WebExtPlugin after its last config
 * emits. Parallel execution would race on `build/all/manifest.json`,
 * `index.html`, etc. We chain every config via `dependencies`; webpack-cli
 * does not propagate the `parallelism` array property, so this dependency
 * chain is the reliable way to enforce ordering.
 */
const firefox = require('./webpack.firefox.config.js');
const chromiumMv2 = require('./webpack.chromium-mv2.config.js');
const chromiumMv3 = require('./webpack.chromium-mv3.config.js');
const safari = require('./webpack.safari.config.js');

const configs = [...firefox, ...chromiumMv2, ...chromiumMv3, ...safari];
configs.forEach((config, index) => {
  config.name = `pkg-${index}`;
  if (index > 0) {
    config.dependencies = [`pkg-${index - 1}`];
  }
});

module.exports = configs;
