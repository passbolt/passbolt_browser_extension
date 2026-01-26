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
import Logger from "passbolt-styleguide/src/shared/utils/logger";

import TagsCollection from "../../model/entity/tag/tagsCollection";
import TagApiService from "../api/tag/tagApiService";

export default class FindTagsService {
  /**
   * @constructor
   * @param {ApiClientOptions} apiClientOptions
   */
  constructor(apiClientOptions) {
    this.tagService = new TagApiService(apiClientOptions);
  }

  /**
   * Get all the tags.
   * @returns {Promise<TagsCollection>} The tags
   * @throws {CollectionValidationError} if the returned collection format is invalid
   * @throws {PassboltServiceUnavailableError} if service is not reachable
   * @throws {PassboltBadResponseError} if passbolt API responded with non parsable JSON
   * @throws {PassboltApiFetchError} if passbolt API response is not OK (non 2xx status)
   */
  async findAll() {
    const response = await this.tagService.findAll();

    let tags = response.body;
    if (!Array.isArray(response.body)) {
      tags = [];
      Logger.error(new Error("FindTagsService: API response is not an array, defaulting to an empty one"));
    }

    return new TagsCollection(tags, { clone: false });
  }
}
