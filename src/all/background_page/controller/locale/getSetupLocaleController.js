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
const {LocaleEntity} = require("../../model/entity/locale/localeEntity");
const {LocaleModel} = require("../../model/locale/localeModel");

class GetSetupLocaleController {
  /**
   * GetRecoverLocaleController constructor.
   * @param {Worker} worker The worker the controller is executed on.
   * @param {ApiClientOptions} apiClientOptions The api client options.
   * @param {SetupEntity} setupEntity The setup entity
   */
  constructor(worker, apiClientOptions, setupEntity) {
    this.worker = worker;
    this.localeModel = new LocaleModel(apiClientOptions);
    this.setupEntity = setupEntity;
  }

  /**
   * Get the setup locale.
   *
   * If the setup locale has not been set yet, detect it and set it following the priorities:
   * 1. The locale of the browser if supported.
   * 2. A locale having the same language as the browser locale.
   * 3. The locale of the organization if set and supported.
   * 4. The default fallback locale.
   * @returns {Promise<LocaleEntity>} The locale
   */
  async getLocale() {
    if (!this.setupEntity.locale) {
      const detectedLocale = await this.localeModel.getSupportedLocale(navigator.language)
        || await this.localeModel.getLocaleWithSimilarLanguage(navigator.language)
        || await this.localeModel.getOrganizationLocale()
        || LocaleModel.DEFAULT_LOCALE;
      this.setupEntity.locale = detectedLocale.locale;
    }

    const locale = new LocaleEntity({locale: this.setupEntity.locale});

    // @todo It is not the best place to initialize the background page i18next library.
    this.localeModel.initializeI18next(locale);

    return locale;
  }
}

exports.GetSetupLocaleController = GetSetupLocaleController;
