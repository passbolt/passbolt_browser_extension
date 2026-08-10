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
 * @since         5.5.0
 */
const browserPolyfill = require("webextension-polyfill");
const ScriptingPolyfill = require("./../../../all/common/polyfill/scriptingPolyfill");
const SessionStoragePolyfill = require("./../../../all/common/polyfill/sessionStoragePolyfill");
const OnInstalledReasonPolyfill = require("./onInstalledReasonPolyfill");

// mv3 scripting API for mv2
if (!browserPolyfill.scripting) {
  browserPolyfill.scripting = new ScriptingPolyfill(browserPolyfill);
}
// mv3 session storage API polyfill
if (!browserPolyfill.storage.session) {
  browserPolyfill.storage.session = new SessionStoragePolyfill();
}
// mv3 action API polyfill for mv2
if (!browserPolyfill.action) {
  browserPolyfill.action = browserPolyfill.browserAction;
}

// OnInstaledReason polyfill for Safari
if (!browserPolyfill.runtime.OnInstalledReason) {
  OnInstalledReasonPolyfill(browserPolyfill.runtime);
}

module.exports = browserPolyfill;
