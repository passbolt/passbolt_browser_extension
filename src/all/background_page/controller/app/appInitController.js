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
const User = require('../../model/user').User;

/**
 * React application bootstrap.
 *
 * @deprecated The application should load what required. The background page shouldn't bootstrap
 *   what the application needs.
 */
class AppInitController {
  /**
   *
   * @returns {Promise<>}
   */
  async main() {
    const syncUserSettingsPromise = this._syncUserSettings();
    return Promise.allSettled([syncUserSettingsPromise]);
  }

  /**
   * Sync the user settings
   * @returns {Promise<void>}
   * @private
   */
  async _syncUserSettings() {
    const user = User.getInstance();
    try {
      await user.settings.sync()
    } catch (error) {
      // fail silently for CE users
      user.settings.setDefaults();
    }
  }
}

exports.AppInitController = AppInitController;
