/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         3.8.0
 */

/**
 * This code provides polyfills for the need of Passbolt.
 */
import browser from "webextension-polyfill";
import "./scriptingPolyfill"; //mv3 scripting API for mv2
import "./sessionStoragePolyfill"; //mv3 session storage API polyfill
import "./actionPolyfill"; //mv3 action API polyfill for mv2

export default browser;
