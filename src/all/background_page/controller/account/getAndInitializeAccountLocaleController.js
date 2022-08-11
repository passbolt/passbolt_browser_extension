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
 * @since         3.6.0
 */
import LocaleModel from "../../model/locale/localeModel";

class GetAndInitializeAccountLocaleController {
  /**
   * Constructor
   * @param {Worker} worker
   * @param {string} requestId uuid
   * @param {ApiClientOptions} apiClientOptions the api client options
   * @param {AbstractAccountEntity} account the account associated to the worker
   */
  constructor(worker, requestId, apiClientOptions, account) {
    this.worker = worker;
    this.requestId = requestId;
    this.apiClientOptions = apiClientOptions;
    this.account = account;
    this.localeModel = new LocaleModel(apiClientOptions);
  }

  /**
   * Wrapper of exec function to run it with worker.
   *
   * @return {Promise<void>}
   */
  async _exec() {
    try {
      const result = await this.exec();
      this.worker.port.emit(this.requestId, "SUCCESS", result);
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, 'ERROR', error);
    }
  }

  /**
   * Get the worker account locale.
   * Return default organization if no locale defined.
   * Fallback on default extension locale if nothing found.
   *
   * @return {Promise<LocaleEntity>}
   */
  async exec() {
    let accountLocale;
    if (this.account.locale) {
      accountLocale = await this.localeModel.getSupportedLocale(this.account.locale);
    }

    const locale = accountLocale
      || await this.localeModel.getOrganizationLocale()
      || LocaleModel.DEFAULT_LOCALE;

    // @todo It is not the best place to initialize the background page i18next library.
    this.localeModel.initializeI18next(locale);

    return locale;
  }
}

export default GetAndInitializeAccountLocaleController;
