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
const {AccountSettingsService} = require("../../service/api/accountSettings/accountSettingsService");
const Config = require('../config');

class LocaleModel {
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

  //==============================================================
  // CRUDs
  //==============================================================

  /**
   * Update the current user locale language
   *
   * @param {LocaleEntity} localeEntity The locale update entity
   * @returns {Promise<void>} response body
   * @throws {Error} if options are invalid or API error
   * @public
   */
  async update(localeEntity) {
    await this.accountSettingsService.updateLocale(localeEntity.language);
    Config.write('user.settings.locale', localeEntity.language);
  }
}

exports.LocaleModel = LocaleModel;
