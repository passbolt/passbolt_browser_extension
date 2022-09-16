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
 * @since         3.2.0
 */
import i18next from "i18next";
import HttpApi from "i18next-http-backend";

/**
 * The instance of the I18next library.
 */
let _i18next;

class I18n {
  /**
   * Initialize I18n
   * @param {string} locale The locale. i.e. en-UK
   * @param {array<string>} supportedLocales The supported locales. i.e. ['en-UK', 'fr-FR']
   */
  static init(locale, supportedLocales) {
    _i18next = i18next.createInstance();
    _i18next.use(HttpApi)
      .init({
        lng: locale,
        load: 'currentOnly',
        backend: {
          loadPath: '/locales/{{lng}}/{{ns}}.json'
        },
        supportedLngs: supportedLocales,
        fallbackLng: false,
        ns: ['common'],
        defaultNS: 'common',
        keySeparator: false, // don't use the dot for separator of nested json object
        nsSeparator: false, // allowed ':' in key to avoid namespace separator
        debug: false,
      });
  }

  /**
   * Initialize the library with the default locale.
   */
  static initWithDefaultLocale() {
    const defaultLocale = "en-UK";
    const defaultSupportedLocales = [defaultLocale];
    I18n.init(defaultLocale, defaultSupportedLocales);
  }

  /**
   * Interface to the i18next translation function t().
   * @returns {string}
   */
  static t() {
    if (!_i18next) {
      I18n.initWithDefaultLocale();
    }
    return _i18next.t.apply(_i18next, arguments);
  }
}

export default I18n;
