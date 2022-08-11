/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         3.2.0
 */

import LocaleModel from "../../model/locale/localeModel";
import LocaleEntity from "../../model/entity/locale/localeEntity";


class GetAndInitSetupLocaleController {
  /**
   * Constructor.
   * @param {Worker} worker The worker the controller is executed on.
   * @param {string} requestId The associated request id.
   * @param {ApiClientOptions} apiClientOptions The api client options.
   * @param {AccountSetupEntity} account The account being setup.
   */
  constructor(worker, requestId, apiClientOptions, account) {
    this.worker = worker;
    this.requestId = requestId;
    this.account = account;
    this.localeModel = new LocaleModel(apiClientOptions);
  }

  /**
   * Controller executor.
   * @returns {Promise<void>}
   */
  async _exec() {
    try {
      const result = await this.exec();
      this.worker.port.emit(this.requestId, 'SUCCESS', result);
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, 'ERROR', error);
    }
  }

  /**
   * Get the locale of the user performing a setup.
   *
   * If the setup locale has not been set yet, detect it and set it following the priorities:
   * 1. The locale of the browser if supported.
   * 2. A locale having the same language as the browser locale.
   * 3. The locale of the organization if set and supported.
   * 4. The default fallback locale.
   * @returns {Promise<LocaleEntity>} The locale
   */
  async exec() {
    if (!this.account.locale) {
      const detectedLocale = await this.localeModel.getSupportedLocale(navigator.language)
        || await this.localeModel.getLocaleWithSimilarLanguage(navigator.language)
        || await this.localeModel.getOrganizationLocale()
        || LocaleModel.DEFAULT_LOCALE;
      this.account.locale = detectedLocale.locale;
    }

    const locale = new LocaleEntity({locale: this.account.locale});

    // @todo It is not the best place to initialize the background page i18next library.
    this.localeModel.initializeI18next(locale);

    return locale;
  }
}

export default GetAndInitSetupLocaleController;
