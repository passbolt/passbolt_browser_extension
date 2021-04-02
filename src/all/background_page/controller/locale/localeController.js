/**
 * Locale controller
 *
 * Used to handle the operation related to the locale language
 *
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
const {LocaleEntity} = require("../../model/entity/locale/localeEntity");
const {LocaleModel} = require("../../model/locale/localeModel");
const {User} = require('../../model/user');
const {i18n} = require('../../sdk/i18n');

class LocaleController {
  /**
   * LocaleController constructor
   * @param {Worker} worker
   * @param {ApiClientOptions} clientOptions
   */
  constructor(worker, clientOptions) {
    this.worker = worker;

    // Models
    this.user = User.getInstance();
    this.localeModel = new LocaleModel(clientOptions);
  }

  /**
   * Get the locale
   * @returns {Promise<LocaleEntity>} The locale
   */
  async getLocale() {
    const locale =  {
      language: this.user.settings.getLocale()
    };
    return new LocaleEntity(locale);
  }

  /**
   * Update the locale
   * @param localeDto The new locale
   */
  async updateLocale(localeDto) {
    const localeEntity = new LocaleEntity(localeDto);
    await this.localeModel.update(localeEntity);
    await i18n.changeLanguage(localeEntity.language);
  }
}

exports.LocaleController = LocaleController;
