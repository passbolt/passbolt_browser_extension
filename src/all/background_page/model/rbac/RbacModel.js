/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2023 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2023 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         4.0.0
 */
import UserModel from "../user/userModel";
import RbacsCollection from "passbolt-styleguide/src/shared/models/entity/rbac/rbacsCollection";
import RbacService from "passbolt-styleguide/src/shared/services/api/rbac/rbacService";
import RbacMeService from "passbolt-styleguide/src/shared/services/api/rbac/rbacMeService";
import CanUse from "passbolt-styleguide/src/shared/services/rbacs/canUseService";

/**
 * Model related to the role based access control
 */
class RbacModel {
  /**
   * Constructor
   *
   * @param {ApiClientOptions} apiClientOptions
   * @param {AccountEntity} account the account associated to the worker
   * @public
   */
  constructor(apiClientOptions, account) {
    this.userModel = new UserModel(apiClientOptions, account);
    this.rbacService = new RbacService(apiClientOptions);
    this.rbacMeService = new RbacMeService(apiClientOptions);
  }

  /**
   * Find all the rbacs.
   * @param {Object} contains The list of contains.
   * @returns {Promise<RbacsCollection>}
   */
  async findAll(contains = {}) {
    const collectionDto = await this.rbacService.findAll(contains)
    return new RbacsCollection(collectionDto);
  }

  /**
   * Find current user rbcas.
   * @param {Object} contains The list of contains.
   * @returns {Promise<RbacsCollection>}
   */
  async getOrFindMe(contains = {}) {
    // @todo implement cache.
    const collectionDto = await this.rbacMeService.findMe(contains)
    return new RbacsCollection(collectionDto);
  }

  /**
   * Check if the given account can use a UI action.
   * @param {AccountEntity} account The user account.
   * @param {string} actionName The name of the ui action to check for.
   * @returns {Promise<boolean>}
   */
  async canIUseUiAction(account, actionName) {
    const user = await this.userModel.getOrFindMe();
    const rbacs = await this.getOrFindMe({ui_action: true});

    return CanUse.canRoleUseUiAction(user.role, rbacs, actionName);
  }
}

export default RbacModel;
