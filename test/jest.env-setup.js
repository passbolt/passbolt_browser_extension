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

/*
 * Provides PASSBOLT_* environment variables for Jest test runs.
 *
 * In a real build, webpack's EnvironmentPlugin (see webpack/passboltEnvPlugin.js)
 * substitutes `process.env.PASSBOLT_*` references with string literals at compile
 * time. Jest does not run webpack, so without this file `process.env.PASSBOLT_*`
 * would be undefined and `model/config.js` would compute a NaN log level and a
 * `false` debug flag, which is misleading for tests.
 *
 * Values mirror the EnvironmentPlugin defaults (former config.json.debug values)
 * so the test environment matches a debug build. The nullish coalescing keeps any
 * value already set by the developer's shell or by a specific test, allowing
 * targeted overrides without editing this file.
 */
process.env.PASSBOLT_DEBUG = process.env.PASSBOLT_DEBUG ?? "true";
process.env.PASSBOLT_LOG_LEVEL = process.env.PASSBOLT_LOG_LEVEL ?? "4";
process.env.PASSBOLT_LOG_CONSOLE = process.env.PASSBOLT_LOG_CONSOLE ?? "true";
