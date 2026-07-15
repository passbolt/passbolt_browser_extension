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
import GetOrFindSiteSettingsService from "../../service/siteSettings/getOrFindSiteSettingsService";
import AccountSettingsService from "../../service/api/accountSettings/accountSettingsService";
import { Config } from "../config";
import i18n from "../../sdk/i18n";
import LocaleEntity from "../entity/locale/localeEntity";
import LocalesCollection from "../entity/locale/localesCollection";

class LocaleModel {
  /**
   * LocaleModel.default
   * @returns {LocaleEntity}
   */
  static get DEFAULT_LOCALE() {
    return new LocaleEntity({
      locale: "en-UK",
      label: "English",
    });
  }

  /**
   * LocaleModel.default
   * @returns {LocalesCollection}
   */
  static get DEFAULT_SUPPORTED_LOCALES() {
    return new LocalesCollection([LocaleModel.DEFAULT_LOCALE]);
  }

  /**
   * Constructor
   *
   * @param {ApiClientOptions} apiClientOptions
   * @param {AccountEntity} [account] The account. Required for the organization-locale finders that
   *   read the site settings; not needed by `updateUserLocale`.
   * @public
   */
  constructor(apiClientOptions, account) {
    this.accountSettingsService = new AccountSettingsService(apiClientOptions);
    this.apiClientOptions = apiClientOptions;
    this.account = account;
  }

  /**
   * Initialize the library i18next
   * @param {LocaleEntity} localeEntity The locale to use
   * @returns {Promise<void>}
   */
  async initializeI18next(localeEntity) {
    const supportedLocales = await this.getSupportedOrganizationLocales();
    const supportedLocalesId = supportedLocales.locales.map((supportedLocale) => supportedLocale.locale);
    i18n.init(localeEntity.locale, supportedLocalesId);
  }

  /*
   * ==============================================================
   *  Finders / remote calls
   * ==============================================================
   */

  /**
   * Get the organization locale.
   * @returns {Promise<LocaleEntity>}
   */
  async getOrganizationLocale() {
    const getOrFindSiteSettingsService = new GetOrFindSiteSettingsService(this.account, this.apiClientOptions);
    const siteSettings = await getOrFindSiteSettingsService.getOrFind(false);
    return this.getSupportedLocale(siteSettings.locale);
  }

  /**
   * Get supported organization locales
   * @returns {Promise<LocalesCollection>}
   */
  async getSupportedOrganizationLocales() {
    const getOrFindSiteSettingsService = new GetOrFindSiteSettingsService(this.account, this.apiClientOptions);
    const siteSettings = await getOrFindSiteSettingsService.getOrFind(false);
    const localePluginEnabled = siteSettings.isPluginEnabled("locale");

    if (localePluginEnabled) {
      const localePluginSettings = siteSettings.getPluginSettings("locale");
      return new LocalesCollection(localePluginSettings.options || []);
    }

    return LocaleModel.DEFAULT_SUPPORTED_LOCALES;
  }

  /**
   * Retrieve a supported locale by locale identifier.
   * @param {string} locale The locale to check. i.e. en-US
   * @returns {Promise<LocaleEntity>}
   */
  async getSupportedLocale(locale) {
    const supportedLocales = await this.getSupportedOrganizationLocales();
    return supportedLocales.locales.find((supportedLocale) => supportedLocale.locale === locale);
  }

  /**
   * Find the first similar language.
   * i.e. with supported locales: ["en-UK", "fr-FR"], "en-UK" will be returned as similar locale of "en-US".
   * @param {string} locale The locale to find a similar one for
   * @returns {string}
   */
  async getLocaleWithSimilarLanguage(locale) {
    const localeNonExplicitLanguage = locale.split("-")[0];
    const supportedLocales = await this.getSupportedOrganizationLocales();
    return supportedLocales.locales.find(
      (supportedLocale) => localeNonExplicitLanguage === supportedLocale.locale.split("-")[0],
    );
  }

  /*
   * ==============================================================
   *  CRUDs
   * ==============================================================
   */

  /**
   * Update the current user locale language
   *
   * @param {LocaleEntity} localeEntity The locale update entity
   * @returns {Promise<void>} response body
   * @throws {Error} if options are invalid or API error
   * @public
   */
  async updateUserLocale(localeEntity) {
    await this.accountSettingsService.updateLocale(localeEntity.locale);
    Config.write("user.settings.locale", localeEntity.locale);
  }
}

export default LocaleModel;
