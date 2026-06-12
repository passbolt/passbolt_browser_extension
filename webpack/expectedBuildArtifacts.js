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
 * Lists the artifacts every browser build is expected to emit under
 * `build/all/`. Consumed by WebExtPlugin to fail the build if any are
 * missing — a guard against output-cleanup regressions where parent
 * webpack configs would race-wipe nested child output directories.
 *
 * Paths are relative to `build/all/`.
 */

// Entries common to every browser target (chromium-mv2, chromium-mv3, firefox, safari).
const COMMON_EXPECTED_FILES = [
  "manifest.json",
  "contentScripts/js/dist/app.js",
  "contentScripts/js/dist/browser-integration/browser-integration.js",
  "contentScripts/js/dist/browser-integration/vendors.js",
  "contentScripts/js/dist/public-website-sign-in/public-website-sign-in.js",
  "contentScripts/js/dist/public-website-sign-in/vendors.js",
  "webAccessibleResources/js/dist/app.js",
  "webAccessibleResources/js/dist/quickaccess.js",
  "webAccessibleResources/js/dist/download/app.js",
  "webAccessibleResources/js/dist/download/vendors.js",
  "webAccessibleResources/js/dist/in-form-call-to-action/app.js",
  "webAccessibleResources/js/dist/in-form-call-to-action/vendors.js",
  "webAccessibleResources/js/dist/in-form-menu/app.js",
  "webAccessibleResources/js/dist/in-form-menu/vendors.js",
];

// MV3-only entries (service worker + offscreen document).
const MV3_EXPECTED_FILES = [
  "serviceWorker/index.js",
  "serviceWorker/serviceWorker.js",
  "offscreens/offscreen.js",
  "offscreens/offscreen.html",
];

module.exports = {
  COMMON_EXPECTED_FILES,
  MV3_EXPECTED_FILES,
};
