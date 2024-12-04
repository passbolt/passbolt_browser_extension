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
 * @since         v4.10.1
 */

import AbstractService from "../abstract/abstractService";
import SessionKeysBundleEntity from "passbolt-styleguide/src/shared/models/entity/sessionKey/sessionKeysBundleEntity";
import {assertType, assertUuid} from "../../../utils/assertions";

const SESSION_KEYS_BUNDLES_API_SERVICE_RESOURCE_NAME = "metadata/session-keys";

class SessionKeysBundlesApiService extends AbstractService {
  /**
   * Constructor
   *
   * @param {ApiClientOptions} apiClientOptions
   * @public
   */
  constructor(apiClientOptions) {
    super(apiClientOptions, SESSION_KEYS_BUNDLES_API_SERVICE_RESOURCE_NAME);
  }

  /**
   * Retrieve the session keys from the API.
   * @returns {Promise<Array>}
   * @public
   */
  async findAll() {
    const response = await this.apiClient.findAll();
    if (!response.body || !response.body.length) {
      return [];
    }

    return response.body;
  }

  /**
   * Save new session keys bundle entity
   * @param {SessionKeysBundleEntity} sessionKeysBundleEntity The session key bundle to save
   * @returns {Promise<Object>}
   */
  async create(sessionKeysBundleEntity) {
    assertType(sessionKeysBundleEntity, SessionKeysBundleEntity, "The parameter 'sessionKeysBundleEntity' should be a SessionKeysBundleEntity");
    const response = await this.apiClient.create(sessionKeysBundleEntity.toDto());
    return response.body;
  }

  /**
   * Delete a session keys bundle
   * @param {string} id The id of the session key bundle to delete.
   * @returns {Promise}
   */
  async delete(id) {
    assertUuid(id, "The parameter 'id' should be a UUID.");
    const response = await this.apiClient.delete(id);
    return response.body;
  }

  /**
   * Update a session keys bundle
   * @param {string} id The id of the session key bundle to delete.
   * @param {SessionKeysBundleEntity} sessionKeysBundleEntity The session key bundle to update
   * @returns {Promise}
   */
  async update(id, sessionKeysBundleEntity) {
    assertUuid(id, "The parameter 'id' should be a UUID.");
    assertType(sessionKeysBundleEntity, SessionKeysBundleEntity, "The parameter 'sessionKeysBundleEntity' should be a SessionKeysBundleEntity");
    const response = await this.apiClient.update(id, sessionKeysBundleEntity);
    return response.body;
  }
}

export default SessionKeysBundlesApiService;
