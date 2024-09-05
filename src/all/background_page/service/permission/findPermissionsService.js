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
 * @since         4.10.0
 */
import PermissionService from "../api/permission/permissionService";
import {assertUuid} from "../../utils/assertions";


class FindPermissionsService {
  /**
   *
   * @param {AccountEntity} account The user account
   * @param {ApiClientOptions} apiClientOptions The api client options
   */
  constructor(account, apiClientOptions) {
    this.account = account;
    this.permissionService = new PermissionService(apiClientOptions);
  }

  /**
   * Find all permissions for a resource.
   *
   * @param {string} resourceId The resource id
   * @throws {Error} if API call fails, service unreachable, etc.
   * @throws {TypeError} if resource id is not an uuid
   * @return {Promise<PermissionsCollection>} permissionsCollection
   */
  async findAllByAcoForeignKeyForDisplay(resourceId) {
    assertUuid(resourceId, `Service error. The id '${resourceId}' is not a valid uuid.`);
    return this.permissionService.findAllByAcoForeignKey(resourceId, FindPermissionsService.DEFAULT_CONTAIN);
  }

  /**
   * FindPermissionsService.DEFAULT_CONTAIN
   * @private
   * @returns {Object}
   */
  static get DEFAULT_CONTAIN() {
    return {"user": true, "user.profile": true, "group": true};
  }
}

export default FindPermissionsService;
