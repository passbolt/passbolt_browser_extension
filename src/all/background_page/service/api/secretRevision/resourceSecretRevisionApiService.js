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

import {assertType, assertUuid} from "../../../utils/assertions";
import AbstractService from "../abstract/abstractService";
import PassboltResponseEntity from "passbolt-styleguide/src/shared/models/entity/apiService/PassboltResponseEntity";

const RESOURCE_SECRET_REVISION_RESOURCE_NAME = 'secret-revisions/resource';

export default class ResourceSecretRevisionApiService extends AbstractService {
  /**
   * @constructor
   * @param {ApiClientOptions} apiClientOptions
   */
  constructor(apiClientOptions) {
    super(apiClientOptions, ResourceSecretRevisionApiService.RESOURCE_NAME);
  }

  /**
   * API Resource Name
   * @returns {string}
   * @public
   */
  static get RESOURCE_NAME() {
    return RESOURCE_SECRET_REVISION_RESOURCE_NAME;
  }

  /**
   * Return the list of supported options for the contains option in API find operations
   * @returns {Array<string>} list of supported option
   */
  static getSupportedContainOptions() {
    return [
      "creator",
      "creator.profile",
      "owner_accessors",
      "owner_accessors.profile",
      "secret",
    ];
  }

  /**
   * Get the resource secret revisions given a resource id.
   * @param {string} resourceId
   * @param {object} [contains = {}]
   * @returns {Promise<PassboltResponseEntity>}
   */
  async findAllByResourceId(resourceId, contains = {}) {
    assertUuid(resourceId);
    assertType(contains, Object);
    this.assertContains(contains);

    const options = this.formatContainOptions(contains, ResourceSecretRevisionApiService.getSupportedContainOptions());

    const result = await this.apiClient.get(resourceId, options);
    return new PassboltResponseEntity(result);
  }

  /**
   * Assert the contains to ensure they match the supported ones.
   * @param {object} contains
   * @throws {Error} if one of the given contains is not supported
   * @private
   */
  assertContains(contains) {
    const supportedOptions = ResourceSecretRevisionApiService.getSupportedContainOptions();
    if (contains && !Object.keys(contains).every(option => supportedOptions.includes(option))) {
      throw new Error("Unsupported contains parameter used, please check supported contains");
    }
  }
}
