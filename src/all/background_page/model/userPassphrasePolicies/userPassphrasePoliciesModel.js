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
 * @since         4.3.0
 */

import UserPassphrasePoliciesService from "../../service/api/userPassphrasePolicies/userPassphrasePoliciesService";
import {assertType} from "../../utils/assertions";
import UserPassphrasePoliciesEntity from "passbolt-styleguide/src/shared/models/entity/userPassphrasePolicies/userPassphrasePoliciesEntity";

class UserPassphrasePoliciesModel {
  /**
   * Constructor
   *
   * @param {ApiClientOptions} apiClientOptions
   * @public
   */
  constructor(apiClientOptions) {
    this.userPassphrasePoliciesService = new UserPassphrasePoliciesService(apiClientOptions);
  }

  /**
   * Find the current user passphrase policies from the API.
   * @returns {Promise<UserPassphrasePoliciesEntity>}
   */
  async findOrDefault() {
    let userPassphrasePoliciesDto = null;
    try {
      userPassphrasePoliciesDto = await this.userPassphrasePoliciesService.find();
      return UserPassphrasePoliciesEntity.createFromDefault(userPassphrasePoliciesDto);
    } catch (error) {
      console.error(error);
    }
    return UserPassphrasePoliciesEntity.createFromDefault();
  }

  /**
   * Saves a user passphrase policies on the API.
   * @param {UserPassphrasePoliciesEntity} userPassphrasePoliciesEntity the entity to register
   * @returns {Promise<UserPassphrasePoliciesEntity>}
   */
  async save(userPassphrasePoliciesEntity) {
    assertType(userPassphrasePoliciesEntity, UserPassphrasePoliciesEntity, 'The given entity is not a UserPassphrasePoliciesEntity');
    const userPassphrasePoliciesDto = await this.userPassphrasePoliciesService.create(userPassphrasePoliciesEntity);
    return UserPassphrasePoliciesEntity.createFromDefault(userPassphrasePoliciesDto);
  }
}

export default UserPassphrasePoliciesModel;
