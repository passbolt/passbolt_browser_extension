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
import AbstractService from "passbolt-styleguide/src/shared/services/api/abstract/abstractService";
import ChangeThemeEntity from "../../../model/entity/theme/change/ChangeThemeEntity";
import { assertType } from "../../../utils/assertions";

const THEMES_RESOURCE_NAME = "account/settings/themes";

export default class ThemesApiService extends AbstractService {
  /**
   * Constructor
   * @param {ApiClientOptions} apiClientOptions
   */
  constructor(apiClientOptions) {
    super(apiClientOptions, ThemesApiService.RESOURCE_NAME);
  }

  /**
   * API themes resource name
   * @returns {string}
   */
  static get RESOURCE_NAME() {
    return THEMES_RESOURCE_NAME;
  }

  /**
   * Find all the themes.
   * @returns {Promise<Array<object>>} the themes dtos
   */
  async findAll() {
    const response = await this.apiClient.findAll();
    return response.body;
  }

  /**
   * Update the current user theme.
   * @param {ChangeThemeEntity} changeThemeEntity the theme to apply
   * @returns {Promise<object>} the account setting dto
   * @throws {TypeError} if changeThemeEntity is not a ChangeThemeEntity
   */
  async update(changeThemeEntity) {
    assertType(changeThemeEntity, ChangeThemeEntity, "The given parameter is not a valid ChangeThemeEntity");
    const response = await this.apiClient.create({ value: changeThemeEntity.name });
    return response.body;
  }
}
