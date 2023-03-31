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
 * @since         hackaton
 */
import PasswordPoliciesEntity from '../entity/passwordPolicies/passwordPoliciesEntity';
import PasswordPoliciesService from '../../service/passwordPolicies/passwordPoliciesService';

class PasswordPoliciesModel {
  /**
   * Constructor
   *
   * @param {ApiClientOptions} apiClientOptions
   * @public
   */
  constructor(apiClientOptions) {
    this.passwordPoliciesServices = new PasswordPoliciesService(apiClientOptions);
  }

  async getPasswordPolicies() {
    const policies = await this.passwordPoliciesServices.find();
    return new PasswordPoliciesEntity(policies);
  }

  async create(passwordPoliciesEntity) {
    const passwordPoliciesDto = await this.passwordPoliciesServices.create(passwordPoliciesEntity);
    return new PasswordPoliciesEntity(passwordPoliciesDto);
  }
}

export default PasswordPoliciesModel;
