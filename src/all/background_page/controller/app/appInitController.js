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
 * @since         3.0.0
 */
import User from "../../model/user";
import SsoKitTemporaryStorageService from "../../service/session_storage/ssoKitTemporaryStorageService";
import SsoDataStorage from "../../service/indexedDB_storage/ssoDataStorage";
import SsoKitServerPartModel from "../../model/sso/ssoKitServerPartModel";

/**
 * React application bootstrap.
 *
 * @deprecated The application should load what required. The background page shouldn't bootstrap
 *   what the application needs.
 */
class AppInitController {
  /**
   *
   * @returns {Promise<void>}
   */
  async main() {
    const user = User.getInstance();
    await this._syncUserSettings(user);
    await this._syncSsoKit(user);
  }

  /**
   * Synchronize the user settings
   * @param {User} user the user singleton to sync
   * @returns {Promise<void>}
   * @private
   */
  async _syncUserSettings(user) {
    try {
      await user.settings.sync();
    } catch (error) {
      // @deprecated with v4. The /account/settings entry point exist since v3.0 in CE.
      user.settings.setDefaults();
    }
  }

  /**
   * Synchronize the SSO kit to the server
   * @param {User} user the user to get information from
   * @returns {Promise<void>}
   * @private
   */
  async _syncSsoKit(user) {
    try {
      const serverPartSsoKit = await SsoKitTemporaryStorageService.getAndFlush();
      if (!serverPartSsoKit) {
        return;
      }

      const sssoKitServerPartModel = new SsoKitServerPartModel(await user.getApiClientOptions());
      const ssoKit = await sssoKitServerPartModel.setupSsoKit(serverPartSsoKit);
      await SsoDataStorage.updateLocalKitIdWith(ssoKit.id);
    } catch (e) {
      console.error(e);
      await SsoDataStorage.flush();
      await SsoKitTemporaryStorageService.flush();
    }
  }
}

export default AppInitController;
