/**
 * Get locale controller has for aim to retrieve the locale for the recover application.
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
const {LocaleModel} = require("../../model/locale/localeModel");

class GetRecoverLocaleController {
  /**
   * GetRecoverLocaleController constructor.
   * @param {Worker} worker The worker the controller is executed on.
   * @param {ApiClientOptions} apiClientOptions The api client options.
   * @param {SetupEntity} recoverEntity The recover entity
   */
  constructor(worker, apiClientOptions, recoverEntity) {
    this.worker = worker;
    this.localeModel = new LocaleModel(apiClientOptions);
    this.recoverEntity = recoverEntity;
  }

  /**
   * Get the locale following the priority:
   * 1. The locale of the user who recover if set and supported.
   * 2. The locale of the organization if set and supported.
   * 3. The default fallback locale.
   * @returns {Promise<LocaleEntity>} The locale
   */
  async getLocale() {
    let recoverLocale, userLocale;
    if (this.recoverEntity.locale) {
      recoverLocale = this.localeModel.getSupportedLocale(this.recoverEntity.locale);
    } else if (this.recoverEntity.user && this.recoverEntity.user.locale) {
      userLocale = this.localeModel.getSupportedLocale(this.recoverEntity.user.locale);
    }

    const locale = recoverLocale
      || userLocale
      || await this.localeModel.getOrganizationLocale()
      || LocaleModel.DEFAULT_LOCALE;

    // @todo It is not the best place to initialize the background page i18next library.
    this.localeModel.initializeI18next(locale);

    return locale;
  }
}

exports.GetRecoverLocaleController = GetRecoverLocaleController;
