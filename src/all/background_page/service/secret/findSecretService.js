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
import {assertUuid} from "../../utils/assertions";
import SecretService from "../api/secret/secretService";
import SecretEntity from "../../model/entity/secret/secretEntity";


class FindSecretService {
  /**
   *
   * @param {AccountEntity} account The user account
   * @param {ApiClientOptions} apiClientOptions The api client options
   */
  constructor(account, apiClientOptions) {
    this.account = account;
    this.secretService = new SecretService(apiClientOptions);
  }

  /**
   * Find all permissions for a resource.
   *
   * @param {string} resourceId The resource id
   * @throws {Error} if API call fails, service unreachable, etc.
   * @throws {TypeError} if resource id is not an uuid
   * @return {Promise<SecretEntity>} permissionsCollection
   */
  async findByResourceId(resourceId) {
    assertUuid(resourceId);
    const secretDto = await this.secretService.findByResourceId(resourceId);
    return new SecretEntity(secretDto);
  }
}

export default FindSecretService;
