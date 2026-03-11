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
import ResourcesCollection from "../../model/entity/resource/resourcesCollection";
import { assertUuid } from "../../utils/assertions";
import TagApiService from "../api/tag/tagApiService";
import ResourceLocalStorage from "../local_storage/resourceLocalStorage";

export default class DeleteTagService {
  /**
   * @constructor
   * @param {ApiClientOptions} apiClientOptions
   */
  constructor(apiClientOptions) {
    this.tagService = new TagApiService(apiClientOptions);
  }

  /**
   * Delete a tag using the dedicated API service.
   * @param {string} tagId The tag's id to remove
   * @returns {Promise} A promise that is resolved once the operation is successful
   * @throws {Error} if tagId is not a valid uuid
   * @throws {PassboltServiceUnavailableError} if service is not reachable
   * @throws {PassboltBadResponseError} if passbolt API responded with non parsable JSON
   * @throws {PassboltApiFetchError} if passbolt API response is not OK (non 2xx status)
   */
  async _deleteTagApi(tagId) {
    assertUuid(tagId);
    await this.tagService.delete(tagId);
  }

  /**
   * Delete a tag in the local storage.
   * @param {string} tagId The tag's id to remove
   * @returns {Promise} A promise that is resolved once the operation is successful
   * @throws {Error} if tagId is not a valid uuid
   * @throws {CollectionValidationError} if the returned local resources are malformed
   * @throws {Error} if local storage operation failed
   */
  async _deleteTagLocalStorage(tagId) {
    assertUuid(tagId);

    const localResources = await ResourceLocalStorage.get();
    const resourceCollection = new ResourcesCollection(localResources);

    if (resourceCollection.removeTagById(tagId)) {
      await ResourceLocalStorage.set(resourceCollection);
    }
  }

  /**
   * Delete a tag.
   * @param {string} tagId The tag's id to remove
   * @returns {Promise} A promise that is resolved once the operation is successful
   * @throws {Error} if tagId is not a valid uuid
   * @throws {PassboltServiceUnavailableError} if service is not reachable
   * @throws {PassboltBadResponseError} if passbolt API responded with non parsable JSON
   * @throws {PassboltApiFetchError} if passbolt API response is not OK (non 2xx status)
   * @throws {CollectionValidationError} if the returned local resources are malformed
   * @throws {Error} if local storage operation failed
   */
  async delete(tagId) {
    await this._deleteTagApi(tagId);
    await this._deleteTagLocalStorage(tagId);
  }
}
