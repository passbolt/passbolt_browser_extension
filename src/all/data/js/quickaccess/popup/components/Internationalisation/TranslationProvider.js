/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2020 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2020 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since        3.0.3
 */
import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import HttpApi from 'i18next-http-backend';
import {Component} from "react";
import PropTypes from "prop-types";

/**
 * The supported languages
 * @type {string[]}
 */
const supportedLanguages = [
  'en-US',
];

/**
 * The fallback language.
 * @type {string}
 */
const fallbackLanguage = 'en-US';

/**
 * The locales default path.
 * @type {string}
 */
const defaultLocalesPath = '/data/locales/{{lng}}/{{ns}}.json';

/**
 * This component set up the translation process
 */
class TranslationProvider extends Component {
  /**
   *
   * @returns {Promise<void>}
   * @constructor
   */
  async UNSAFE_componentWillMount() {
    const language = this.getLanguage();
    await i18n
      // pass the i18n instance to react-i18next.
      .use(initReactI18next)
      .use(HttpApi)
      // init i18next, for all options read: https://www.i18next.com/overview/configuration-options
      .init({
        lng: language,
        load: 'currentOnly',
        react: {
          useSuspense: false,
        },
        backend: {
          loadPath: this.props.loadingPath || defaultLocalesPath
        },
        supportedLngs: supportedLanguages,
        fallbackLng: false,
        ns: ['common'],
        defaultNS: 'common',
        keySeparator: false, // don't use the dot for separator of nested/ShareVariesDetails.js json object
        nsSeparator: false, // allowed ':' in key to avoid namespace separator
        debug: true,
      });
  }

  /**
   * Get the language to use to translate the application
   * @returns {string|string}
   */
  getLanguage() {
    let language = navigator.language;

    if (this.isSupportedLanguage(language)) {
      return language;
    }

    const similarLanguage = this.findSimilarLanguage(language);
    if (similarLanguage) {
      return similarLanguage;
    }

    return fallbackLanguage;
  }

  /**
   * Check if the given langauge is supported
   * @param {string} language The language to test
   * @returns {boolean}
   */
  isSupportedLanguage(language) {
    return supportedLanguages.includes(language);
  }

  /**
   * Find the first similar language
   * By instance if en-US is supported but not en-UK, then en-US will be a similar language of en-UK
   * @param {string} language The language to find a similar one
   * @returns {string}
   */
  findSimilarLanguage(language) {
    const nonExplicitLanguage = language.split('-')[0];
    return supportedLanguages.find(supportedLanguage => nonExplicitLanguage === supportedLanguage.split('-')[0]);
  }

  /**
   * Render the component.
   * @returns {JSX}
   */
  render() {
    return ({...this.props.children});
  }
}

TranslationProvider.propTypes = {
  defaultLanguage: PropTypes.string, // The default language
  loadingPath: PropTypes.any, // The way to load translations files
  children: PropTypes.any, // The children components
};

export default TranslationProvider;
