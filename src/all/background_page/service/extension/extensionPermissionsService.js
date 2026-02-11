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
 * @since         5.10.0
 */

export default class ExtensionPermissionsService {
  /**
   * Checks if the extension is allowed to run on every website.
   * @returns {Promise<boolean>} true if the extension has permissions for all origins
   */
  static async isAllowedOnEveryWebsite() {
    const permissions = await browser.permissions.getAll();
    return permissions.origins.some((origin) => origin === "*://*/*" || origin === "<all_urls>");
  }
}
