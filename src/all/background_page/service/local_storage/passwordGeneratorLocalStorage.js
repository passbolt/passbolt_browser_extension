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
import Lock from "../../utils/lock";
const lock = new Lock();

const PASSWORD_GENERATOR_LOCAL_STORAGE_KEY = 'passwordGenerator';

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

  /**
   * Set the password generator local storage.
   *
   * @throws {Error} if operation failed
   * @return {Promise} results object, containing every object in keys that was found in the storage area.
   * If storage is not set, undefined will be returned.
   */
  static async get() {
    const {passwordGenerator} = await browser.storage.local.get([PASSWORD_GENERATOR_LOCAL_STORAGE_KEY]);
    return passwordGenerator;
  }

  /**
   * Set the password generator in local storage.
   * @param {PasswordGeneratorEntity }passwordGenerator The password generator
   * @return {void}
   */
  static async set(passwordGenerator) {
    await lock.acquire();
    await browser.storage.local.set({passwordGenerator: passwordGenerator});
    lock.release();
  }
}

export default PasswordGeneratorLocalStorage;
