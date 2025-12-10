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
 * @since         5.8.0
 */
import RolesCollection from "passbolt-styleguide/src/shared/models/entity/role/rolesCollection";
import RoleApiService from "passbolt-styleguide/src/shared/services/api/role/roleApiService";

/**
 * The service aims to find roles from the API.
 */
export default class FindRolesService {
  /**
   * @constructor
   * @param {AccountEntity} account The user account
   * @param {ApiClientOptions} apiClientOptions The api client options
   */
  constructor(account, apiClientOptions) {
    this.account = account;
    this.roleApiService = new RoleApiService(apiClientOptions);
  }

  /**
   * Find all
   * @param {object} [options] Additionnal options to pass to the collection constructor.
   * @param {boolean?} [options.ignoreInvalidEntity] Should invalid entities be ignored.
   * @returns {Promise<RolesCollection>}
   */
  async findAll(options = {ignoreInvalidEntity: false}) {
    const rolesDto = await this.roleApiService.findAll();
    const ignoreInvalidEntity = Boolean(options.ignoreInvalidEntity);
    const rolesCollection = new RolesCollection(rolesDto.body, {clone: false, ignoreInvalidEntity: ignoreInvalidEntity});
    rolesCollection.filterOutGuestRole();

    return rolesCollection;
  }
}
