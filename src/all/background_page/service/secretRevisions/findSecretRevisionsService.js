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
 * @since         5.7.0
 */

import ResourceSecretRevisionApiService from "../api/secretRevision/resourceSecretRevisionApiService";
import ResourceSecretRevisionsCollection from "passbolt-styleguide/src/shared/models/entity/secretRevision/resourceSecretRevisionsCollection";
import {assertType, assertUuid} from "../../utils/assertions";

export default class FindSecretRevisionsService {
  /**
   * @constructor
   * @param {ApiClientOptions} apiClientOptions The api client options
   */
  constructor(apiClientOptions) {
    this.resourceSecretRevisionApiService = new ResourceSecretRevisionApiService(apiClientOptions);
  }

  /**
   * Find the secret revisions of a given resource.
   * @param {string} resourceId
   * @param {Object} contains
   * @returns {Promise<ResourceSecretRevisionsCollection>}
   */
  async findAllByResourceId(resourceId, contains) {
    assertUuid(resourceId);
    assertType(contains, Object);

    const apiResponse = await this.resourceSecretRevisionApiService.findAllByResourceId(resourceId, contains);
    return new ResourceSecretRevisionsCollection(apiResponse.body);
  }
}
