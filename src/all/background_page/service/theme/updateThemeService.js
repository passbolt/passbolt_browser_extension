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
import { Config } from "../../model/config";

/**
 * The service aims to update the current user theme.
 */
export default class UpdateThemeService {
  /**
   * @constructor
   * @param {ApiClientOptions} apiClientOptions The api client options
   */
  constructor(apiClientOptions) {
    this.themesApiService = new ThemesApiService(apiClientOptions);
  }

  /**
   * Updates the theme server side, then in the local config so every frame swaps its stylesheet.
   * @param {ChangeThemeEntity} changeThemeEntity the theme to apply
   * @returns {Promise<void>}
   * @throws {TypeError} if changeThemeEntity is not a ChangeThemeEntity
   */
  async update(changeThemeEntity) {
    await this.themesApiService.update(changeThemeEntity);
    Config.write("user.settings.theme", changeThemeEntity.name);
  }
}
