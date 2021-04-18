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
 * @since        3.2.0
 */
import i18n from 'i18next';
import {I18nextProvider} from 'react-i18next';
import HttpApi from 'i18next-http-backend';
import React, {Component} from "react";
import PropTypes from "prop-types";
import AppContext from "../../contexts/AppContext";

/**
 * The locales default path.
 * @type {string}
 */
const defaultLocalesPath = '/locales/{{lng}}/{{ns}}.json';

/**
 * This component set up the translation process
 */
class TranslationProvider extends Component {

  constructor(props) {
    super(props);
    this.state = this.defaultState;
  }

  /**
   * Returns the default component state
   */
  get defaultState() {
    return {
      i18next: null // The i18next instance
    };
  }

  /**
   * ComponentDidMount
   * Invoked immediately after component is inserted into the tree
   * @return {void}
   */
  componentDidMount() {
    this.initI18next();
  }

  /**
   * Whenever the component has updated in terms of props
   */
  async componentDidUpdate() {
    await this.handleLocaleChange();
  }

  /**
   * Check if the locale has changed and update
   */
  async handleLocaleChange() {
    const hasLocaleChanged = this.state.i18next && this.locale !== this.state.i18next.language;
    if (hasLocaleChanged) {
      this.initI18next();
    }
  }

  /**
   * Initialize i18next
   * @returns {Promise<void>}
   */
  async initI18next() {
    const i18next = i18n.createInstance();
    await i18next
      // pass the i18n instance to react-i18next.
      .use(HttpApi)
      // init i18next, for all options read: https://www.i18next.com/overview/configuration-options
      .init({
        lng: this.locale,
        load: 'currentOnly',
        react: {
          useSuspense: false,
        },
        backend: {
          loadPath: this.props.loadingPath || defaultLocalesPath
        },
        supportedLngs: this.supportedLocales,
        fallbackLng: false,
        ns: ['common'],
        defaultNS: 'common',
        keySeparator: false, // don't use the dot for separator of nested json object
        nsSeparator: false, // allowed ':' in key to avoid namespace separator
        debug: true,
      }, () => this.setState({i18next}));
  }

  /**
   * Get the locale
   * @type {string}
   */
  get locale() {
    return this.context.locale;
  }

  /**
   * Get supported locales.
   * @returns {string[]}
   */
  get supportedLocales() {
    if (!this.context.siteSettings || !this.context.siteSettings.supportedLocales) {
      return [this.locale];
    }
    return this.context.siteSettings.supportedLocales.map(supportedLocale => supportedLocale.locale);
  }

  /**
   * Returns true when the component can be rendered
   */
  get isReady() {
    // Waiting for the i18n initialization to be completed
    return this.state.i18next !== null;
  }

  /**
   * Render the component.
   * @returns {JSX}
   */
  render() {
    return (
      <>
        {this.isReady &&
        <I18nextProvider i18n={this.state.i18next}>
          {this.props.children}
        </I18nextProvider>
        }
      </>
    );
  }
}

TranslationProvider.contextType = AppContext;
TranslationProvider.propTypes = {
  loadingPath: PropTypes.any, // The way to load translations files
  children: PropTypes.any, // The children components
};

export default TranslationProvider;
