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
import AbstractService from "../abstract/abstractService";

const PERMISSION_SERVICE_RESOURCE_NAME = 'permissions/resource';

class PermissionService extends AbstractService {
  /**
   * Constructor
   *
   * @param {ApiClientOptions} apiClientOptions
   * @public
   */
  constructor(apiClientOptions) {
    super(apiClientOptions, PermissionService.RESOURCE_NAME);
  }

  /**
   * API Resource Name
   *
   * @returns {string}
   * @public
   */
  static get RESOURCE_NAME() {
    return PERMISSION_SERVICE_RESOURCE_NAME;
  }

  /**
   * Return the list of supported options for the contains option in API find operations
   *
   * @returns {Array<string>} list of supported option
   */
  static getSupportedContainOptions() {
    return [
      // find all
      'user',
      'user.profile',
      'group',
    ];
  }

  /**
   * Find all permissions for a given resource id
   *
   * @param {string} id resource uuid
   * @param {Object} [contains] optional example: {user: true}
   * @throws {Error} if API call fails, service unreachable, etc.
   * @throws {TypeError} if resource id is not a uuid
   * @returns {Object} permissionsCollectionDto
   */
  async findAllByAcoForeignKey(id, contains) {
    this.assertValidId(id);
    const options = contains ? this.formatContainOptions(contains, PermissionService.getSupportedContainOptions()) : null;
    const response = await this.apiClient.get(id, options);
    return response.body;
  }
}

export default PermissionService;
