/**
 * Get locale controller has for aim to retrieve the locale for an application
 * having an already configured browser extension.
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
 * @since         3.2.0
 */
import LocaleModel from "../../model/locale/localeModel";
import {Config} from "../../model/config";
import LocaleEntity from "../../model/entity/locale/localeEntity";


class GetLocaleController {
  /**
   * GetLocaleController constructor.
   * @param {Worker} worker
   * @param {ApiClientOptions} apiClientOptions The api client options.
   */
  constructor(worker, apiClientOptions) {
    this.worker = worker;
    this.localeModel = new LocaleModel(apiClientOptions);
  }

  /**
   * Get the locale following the priority:
   * 1. The locale of the user if set.
   * 2. The locale of the organization if set and supported.
   * 3. The default fallback locale.
   * @returns {Promise<LocaleEntity>} The locale
   */
  async getLocale() {
    let userLocale;
    const userSettingsLocale = await Config.read('user.settings.locale');
    if (userSettingsLocale) {
      userLocale = new LocaleEntity({locale: userSettingsLocale});
    }

    const locale = userLocale
      || await this.localeModel.getOrganizationLocale()
      || LocaleModel.DEFAULT_LOCALE;

    // @todo It is not the best place to initialize the background page i18next library.
    this.localeModel.initializeI18next(locale);

    return locale;
  }
}

export default GetLocaleController;
