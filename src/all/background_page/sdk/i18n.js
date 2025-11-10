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
   * @param {array<string>} locales The supported locales. i.e. ['en-UK', 'fr-FR']
   */
  static init(locale, locales) {
    _i18next = i18next.createInstance();
    _i18next.use(HttpApi)
      .init({
        lng: locale,
        load: 'currentOnly',
        backend: {
          loadPath: (lngs, namespaces) => I18n.getTranslationPath(lngs, namespaces)
        },
        supportedLngs: I18n.supportedLocales(locales),
        fallbackLng: false,
        ns: ['common'],
        defaultNS: 'common',
        keySeparator: false, // don't use the dot for separator of nested json object
        nsSeparator: false, // allowed ':' in key to avoid namespace separator
        debug: false,
      });
  }

  /**
   * Generates the translation file path for i18next with en-GB to en-UK locale mapping.
   *
   * i18next no longer supports the non-canonical locale code 'en-UK' and automatically
   * falls back to the canonical 'en-GB' code. To maintain our existing implementation
   * which uses 'en-UK' folder structure, this method intercepts the en-GB fallback
   * and redirects it to our en-UK translation files.
   * See: https://www.i18next.com/misc/migration-guide#v23.x.x-to-v24.0.0
   *
   * @param {string[]} lngs - Array of language codes from i18next
   * @param {string[]} namespaces - Array of namespace identifiers
   * @returns {string} The resolved translation file path with en-GB mapped to en-UK
   */
  static getTranslationPath(lngs, namespaces) {
    const lng = lngs[0];
    const ns = namespaces[0];
    //i18next is doing a fallback on en-GB we are redirecting to our en-UK folder
    const actualLng = lng === 'en-GB' ? 'en-UK' : lng;
    const basePath = '/locales/{{lng}}/{{ns}}.json';
    return basePath
      .replace('{{lng}}', actualLng)
      .replace('{{ns}}', ns);
  }

  /**
   * Add fallback locales for i18next compatibility
   *
   * i18next no longer supports the non-canonical locale code 'en-UK' and automatically
   * falls back to the canonical 'en-GB' code. To maintain our existing implementation
   * which uses 'en-UK' folder structure, this method intercepts the en-GB fallback
   * and redirects it to our en-UK translation files.
   * See: https://www.i18next.com/misc/migration-guide#v23.x.x-to-v24.0.0
   *
   * @param {array<string>} locales The supported locales. i.e. ['en-UK', 'fr-FR']
   * @returns {array<string>} The locales with fallback locales added
   */
  static supportedLocales(locales) {
    if (locales.includes('en-UK')) {
      locales.push('en-GB'); //Need to add the locale to support i18next fallback as en-UK is not supported
    }
    return locales;
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
