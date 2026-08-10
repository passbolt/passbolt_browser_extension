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
 * @since         6.0.0
 */
import { assertUuid } from "../../utils/assertions";
import GetOrFindResourceTypesService from "./getOrFindResourceTypesService";

/**
 * The service aims to get users from the local storage if it is set, or retrieve them from the API and
 * set the local storage.
 */
class GetSecretSchemaResourceTypeService {
  /**
   * Constructor.
   * @param {AccountEntity} account The user account.
   * @param {ApiClientOptions} apiClientOptions The api client options.
   */
  constructor(account, apiClientOptions) {
    this.getOrFindResourceTypesService = new GetOrFindResourceTypesService(account, apiClientOptions);
  }

  /**
   * Get secret schema by resource type id.
   * @returns {Promise<object>}
   */
  async getByResourceTypeId(resourceTypeId) {
    assertUuid(resourceTypeId, "The resource type id should be a valid UUID");

    const resourceTypes = await this.getOrFindResourceTypesService.getOrFindAll();
    const type = resourceTypes.getFirst("id", resourceTypeId);
    return type?.definition?.secret;
  }
}

export default GetSecretSchemaResourceTypeService;
