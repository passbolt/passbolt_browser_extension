/**
 * Set locale controller has for aim to set the locale for the setup application.
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

class SetSetupLocaleController {
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
   * Set the locale of the user in the setup workflow.
   * @returns {Promise<void>} The locale
   */
  async setLocale(localeDto) {
    const localeEntity = new LocaleEntity(localeDto);
    this.setupEntity.locale = localeEntity.locale;
    await this.localeModel.initializeI18next(localeEntity);
  }
}

exports.SetSetupLocaleController = SetSetupLocaleController;
