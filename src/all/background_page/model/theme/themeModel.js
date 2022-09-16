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
 */
import AccountSettingsService from "../../service/api/accountSettings/accountSettingsService";
import {Config} from "../config";
import ThemesCollection from "../entity/theme/themesCollection";


class ThemeModel {
  /**
   * Constructor
   *
   * @param {ApiClientOptions} apiClientOptions
   * @public
   */
  constructor(apiClientOptions) {
    this.accountSettingsService = new AccountSettingsService(apiClientOptions);
  }

  /*
   * ==============================================================
   *  Finders / remote calls
   * ==============================================================
   */

  /**
   * Find all themes
   *
   * @returns {Promise<ThemesCollection>} The collection of available themes
   * @throws {Error} if options are invalid or API error
   * @public
   */
  async findAll() {
    const themesDto = await this.accountSettingsService.findAllThemes();
    return new ThemesCollection(themesDto);
  }

  /*
   * ==============================================================
   *  CRUDs
   * ==============================================================
   */

  /**
   * Change the current user theme
   *
   * @param {ChangeThemeEntity} changeThemeEntity The theme change entity
   * @returns {Promise<void>} response body
   * @throws {Error} if options are invalid or API error
   * @public
   */
  async change(changeThemeEntity) {
    await this.accountSettingsService.updateTheme(changeThemeEntity.name);
    Config.write('user.settings.theme', changeThemeEntity.name);
  }
}

export default ThemeModel;
