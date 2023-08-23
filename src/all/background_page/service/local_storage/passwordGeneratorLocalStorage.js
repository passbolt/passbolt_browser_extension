/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) Passbolt SARL (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         3.3.0
 */
import browser from "../../sdk/polyfill/browserPolyfill";
import Log from "../../model/log";

const PASSWORD_GENERATOR_LOCAL_STORAGE_KEY = 'passwordGenerator';


/**
 * @deprecated since v4.2.0 unused anymore; to be remove on v4.3.0
 * Only flush is in used a the moment to ensure the data is cleaned before it's fully removed.
 */
class PasswordGeneratorLocalStorage {
  /**
   * Flush the password generator local storage
   *
   * @throws {Error} if operation failed
   * @return {Promise<void>}
   */
  static async flush() {
    Log.write({level: 'debug', message: 'PasswordGeneratorLocalStorage flushed'});
    return await browser.storage.local.remove(PASSWORD_GENERATOR_LOCAL_STORAGE_KEY);
  }
}

export default PasswordGeneratorLocalStorage;
