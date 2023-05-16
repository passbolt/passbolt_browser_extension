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
      this.init();
    }

    async init() {
      await this.updateStylesWithUserPreferences();
      this.handleStorageChange = this.handleStorageChange.bind(this);
      chrome.storage.onChanged.addListener(this.handleStorageChange);
    }

    async updateStylesWithUserPreferences() {
      const cssInfoTag = document.querySelector('#stylesheet-manager');
      if (!cssInfoTag) {
        return;
      }

      this.theme = await this.getTheme();
      const cssFile = cssInfoTag.dataset.file;
      const baseUrl = window.location.origin;

      this.getLinkTag().setAttribute("href", `${baseUrl}/webAccessibleResources/css/themes/${this.theme}/${cssFile}`);
    }

    getLinkTag() {
      let link = document.querySelector("#stylesheet");
      if (link) {
        return link;
      }

      link = document.createElement("link");
      link.setAttribute("id", "stylesheet");
      link.setAttribute("media", "all");
      link.setAttribute("rel", "stylesheet");

      document.querySelector("head").appendChild(link);

      return link;
    }

    handleStorageChange(changes) {
      if (changes._passbolt_data && changes._passbolt_data.newValue.config) {
        const config = changes._passbolt_data.newValue.config;
        if (config && this.theme !== config["user.settings.theme"] && this.isValidTheme(config["user.settings.theme"])) {
          this.theme = config["user.settings.theme"];
          this.updateStylesWithUserPreferences();
        }
      }
    }

    async getLocalStorage() {
      return new Promise(resolve => {
        chrome.storage.local.get(["_passbolt_data"], result => resolve(result));
      });
    }

    async getTheme() {
      if (await this.isThemeDefined()) {
        const storageData = await this.getLocalStorage();
        const {_passbolt_data: {config}} = storageData;
        return config["user.settings.theme"];
      }

      return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? "midgar"
        : "default";
    }

    async isThemeDefined() {
      const storageData = await this.getLocalStorage();
      if (!storageData || !storageData._passbolt_data) {
        return false;
      }

      const {_passbolt_data: {config}} = storageData;
      const keyExists = config && "user.settings.theme" in config;
      return keyExists && this.isValidTheme(config["user.settings.theme"]);
    }

    isValidTheme(theme) {
      const whitelist = ['default', 'midgar', 'solarized_light', 'solarized_dark'];
      return whitelist.includes(theme);
    }
  }

  new Stylesheet();
})();
