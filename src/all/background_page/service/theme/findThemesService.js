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
 * @since         5.18.0
 */
import ThemesApiService from "../api/theme/themesApiService";
import ThemesCollection from "../../model/entity/theme/themesCollection";

/**
 * The service aims to find the themes.
 */
export default class FindThemesService {
  /**
   * @constructor
   * @param {ApiClientOptions} apiClientOptions The api client options
   */
  constructor(apiClientOptions) {
    this.themesApiService = new ThemesApiService(apiClientOptions);
  }

  /**
   * Finds all the themes.
   * @returns {Promise<ThemesCollection>}
   * @throws {CollectionValidationError} if the API returns invalid themes
   */
  async findAll() {
    const dtos = await this.themesApiService.findAll();
    return new ThemesCollection(dtos);
  }
}
