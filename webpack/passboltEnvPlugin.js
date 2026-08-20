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
const webpack = require("webpack");

// Defaults applied when the corresponding process.env entry is unset.
// We use 'no debug' values by default and only enable them when we are in development mode.
const DEBUG_DEFAULTS = {
  PASSBOLT_DEBUG: "false",
  PASSBOLT_LOG_LEVEL: "0",
  PASSBOLT_LOG_CONSOLE: "false",
};

const PASSBOLT_ENV_KEYS = Object.keys(DEBUG_DEFAULTS);

module.exports = function buildPassboltEnvPlugin() {
  const isDevelopment = process.env.NODE_ENV === "development";

  if (isDevelopment) {
    require("dotenv").config({ path: path.resolve(__dirname, "..", ".env") });
  } else {
    // Strip any inherited shell value so EnvironmentPlugin falls back to defaults.
    for (const key of PASSBOLT_ENV_KEYS) {
      delete process.env[key];
    }
  }

  return new webpack.EnvironmentPlugin(DEBUG_DEFAULTS);
};
