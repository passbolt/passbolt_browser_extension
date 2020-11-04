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
const {ThemesCollection} = require("../entity/theme/themesCollection");
const {AccountSettingsService} = require("../../service/api/accountSettings/accountSettingsService");

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

  //==============================================================
  // Finders / remote calls
  //==============================================================

  /**
   * Find all themes
   *
   * @returns {Promise<*>} response body
   * @throws {Error} if options are invalid or API error
   * @public
   */
  async findAll() {
    const themesDto = await this.accountSettingsService.findAllThemes();
    return new ThemesCollection(themesDto);
  }
}

exports.ThemeModel = ThemeModel;
