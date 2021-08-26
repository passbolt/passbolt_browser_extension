/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) Passbolt SARL (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         2.12.0
 */

(function() {
  class Stylesheet {
    constructor() {
      this.stylesheetElementId = "ext-iframe-stylesheet-link";
      this.init();
    }

    async init() {
      await this.insert();
      this.handleStorageChange = this.handleStorageChange.bind(this);
      chrome.storage.onChanged.addListener(this.handleStorageChange);
    }

    async insert() {
      this.theme = await this.getTheme();
      const stylesheetElement = this.createStylesheetElement(this.theme);
      document.getElementsByTagName("head")[0].appendChild(stylesheetElement);
    }

    handleStorageChange(changes) {
      if (changes._passbolt_data && changes._passbolt_data.newValue.config) {
        const config = changes._passbolt_data.newValue.config;
        if (config && this.theme !== config["user.settings.theme"] && this.isValidTheme(config["user.settings.theme"])) {
          this.theme = config["user.settings.theme"];
          const themePath = this.getThemePath(this.theme);
          document.getElementById(this.stylesheetElementId).setAttribute('href', themePath);
        }
      }
    }

    async getLocalStorage() {
      return new Promise(resolve => {
        chrome.storage.local.get(["_passbolt_data"], result => resolve(result));
      });
    }

    async getTheme() {
      let theme = "default";
      const storageData = await this.getLocalStorage();
      const {_passbolt_data: {config}} = storageData;
      if (config && this.isValidTheme(config["user.settings.theme"])) {
        theme = config["user.settings.theme"];
      }
      return theme;
    }

    isValidTheme(theme) {
      const whitelist = ['default', 'midgar'];
      return whitelist.includes(theme);
    }

    createStylesheetElement() {
      const themePath = this.getThemePath(this.theme);
      const link = document.createElement('link');
      link.id = this.stylesheetElementId;
      link.href = themePath;
      link.type = 'text/css';
      link.rel = 'stylesheet';
      link.media = 'all';

      return link;
    }

    getThemePath() {
      const addonUrl = document.location.origin;
      return `${addonUrl}/data/css/themes/${this.theme}/ext_app.min.css`;
    }
  }

  new Stylesheet();
})();
