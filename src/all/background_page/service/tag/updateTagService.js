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
import TagEntity from "../../model/entity/tag/tagEntity";
import { assertUuid } from "../../utils/assertions";
import TagApiService from "../api/tag/tagApiService";
import ResourceLocalStorage from "../local_storage/resourceLocalStorage";

export default class UpdateTagService {
  /**
   * @constructor
   * @param {ApiClientOptions} apiClientOptions
   */
  constructor(apiClientOptions) {
    this.tagService = new TagApiService(apiClientOptions);
  }

  /**
   * Update a tag in the API
   * @private
   * @param {TagEntity} tag The tag to update (identified by its id)
   * @returns {Promise<TagEntity>} The updated tag
   * @throws {TypeError} if tag is not a TagEntity
   * @throws {PassboltServiceUnavailableError} if service is not reachable
   * @throws {PassboltBadResponseError} if passbolt API responded with non parsable JSON
   * @throws {PassboltApiFetchError} if passbolt API response is not OK (non 2xx status)
   * @throws {EntityValidationError} (Implemented but does not throw) If the slug starts with # the tag is marked as shared.
   */
  async _updateTagApi(tag) {
    if (!(tag instanceof TagEntity)) {
      throw new TypeError("tag is not a TagEntity");
    }

    const response = await this.tagService.update(tag.id, tag.toDto());
    return new TagEntity(response.body);
  }

  /**
   * Update (replace) a tag in the local storage.
   * This will update the tag references in the resources stored locally.
   * @private
   * @param {string} oldTagId The id of the tag to update (replace)
   * @param {TagEntity} tag The tag to update (identified by its id)
   * @returns {Promise<TagEntity>} The updated tag
   * @throws {Error} if oldTagId is not a valid uuid or if local storage operation failed
   * @throws {TypeError} if tag is not a TagEntity
   * @throws {CollectionValidationError} if the returned local resources are malformed
   */
  async _updateTagLocalStorage(oldTagId, tag) {
    assertUuid(oldTagId);
    if (!(tag instanceof TagEntity)) {
      throw new TypeError("tag is not a TagEntity");
    }

    const localResources = await ResourceLocalStorage.get();
    const resourceCollection = new ResourcesCollection(localResources);

    if (resourceCollection.replaceTag(oldTagId, tag)) {
      await ResourceLocalStorage.set(resourceCollection);
    }

    return tag;
  }

  /**
   * Update a tag
   * @param {TagEntity} tag The tag to update (identified by its id)
   * @returns {Promise<TagEntity>} The updated tag
   * @throws {TypeError} if tag is not a TagEntity
   * @throws {PassboltServiceUnavailableError} if service is not reachable
   * @throws {PassboltBadResponseError} if passbolt API responded with non parsable JSON
   * @throws {PassboltApiFetchError} if passbolt API response is not OK (non 2xx status)
   * @throws {CollectionValidationError} if the returned local resources are malformed
   */
  async update(tag) {
    const updatedTag = await this._updateTagApi(tag);
    await this._updateTagLocalStorage(tag.id, updatedTag);
    return updatedTag;
  }
}
