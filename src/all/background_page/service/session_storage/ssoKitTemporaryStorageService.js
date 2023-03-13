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
 * @since         3.9.0
 */
import browser from "../../sdk/polyfill/browserPolyfill";
import Log from "../../model/log";
import Lock from "../../utils/lock";
import SsoKitServerPartEntity from "../../model/entity/sso/ssoKitServerPartEntity";
const lock = new Lock();

const SSO_KIT_STORAGE_KEY = "temp_server_part_sso_kit";

class SsoKitTemporaryStorageService {
  /**
   * Stores the server part SSO kit temporarly in session memory.
   * @param {string} serverPartSsoKit
   * @return {Promise<void>}
   */
  static async set(serverPartSsoKit) {
    await lock.acquire();
    try {
      await browser.storage.session.set({[SSO_KIT_STORAGE_KEY]: serverPartSsoKit});
    } catch (e) {
      lock.release();
      throw e;
    }
    lock.release();
  }

  /**
   * Retrieve the server part SSO kit if any and immediatly flush it from the session memory.
   * @return {Promise<SsoKitServerPartEntity|null>}
   */
  static async getAndFlush() {
    await lock.acquire();
    try {
      // Get the data if any
      const storedData = await browser.storage.session.get(SSO_KIT_STORAGE_KEY);
      const ssoKitServerPartDto = storedData?.[SSO_KIT_STORAGE_KEY] || null;
      if (!ssoKitServerPartDto) {
        lock.release();
        return null;
      }
      const entity = new SsoKitServerPartEntity(ssoKitServerPartDto);

      // Flush the data in any case
      Log.write({level: 'debug', message: 'SsoKitTemporaryStorageService flushed'});
      await browser.storage.session.remove(SSO_KIT_STORAGE_KEY);
      lock.release();
      return entity;
    } catch (e) {
      lock.release();
      throw e;
    }
  }

  /**
   * Flushes the stored SSO kit data if any from the session memory.
   * @return {Promise<void>}
   */
  static async flush() {
    await lock.acquire();
    try {
      Log.write({level: 'debug', message: 'SsoKitTemporaryStorageService flushed'});
      await browser.storage.session.remove(SSO_KIT_STORAGE_KEY);
    } catch (e) {
      lock.release();
      throw e;
    }
    lock.release();
  }
}

export default SsoKitTemporaryStorageService;
