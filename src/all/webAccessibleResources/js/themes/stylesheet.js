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
      this.bindCallbacks();
      this.init();
    }

    /**
     * Bind callbacks
     */
    bindCallbacks() {
      this.handleStorageChange = this.handleStorageChange.bind(this);
      this.setThemeFromOsPreference = this.setThemeFromOsPreference.bind(this);
    }

    /**
     * Initialise to get the theme from local storage or OS preference
     */
    async init() {
      if (await this.isThemeDefined()) {
        this.theme = await this.getThemeFromLocalStorage();
      } else {
        this.mediaQueryPreferColor = window.matchMedia('(prefers-color-scheme: dark)');
        this.setThemeFromOsPreference(this.mediaQueryPreferColor);
        this.mediaQueryPreferColor.addEventListener("change", this.setThemeFromOsPreference);
      }
      this.updateStylesWithUserPreferences();
      chrome.storage.onChanged.addListener(this.handleStorageChange);
    }

    /**
     * Update link reference with the theme
     */
    updateStylesWithUserPreferences() {
      const cssInfoTag = document.querySelector('#stylesheet-manager');
      if (!cssInfoTag) {
        return;
      }

      const cssFile = cssInfoTag.dataset.file;
      const baseUrl = window.location.origin;

      this.getLinkTag().setAttribute("href", `${baseUrl}/webAccessibleResources/css/themes/${this.theme}/${cssFile}`);
    }

    /**
     * Get link tag
     * @returns {Element}
     */
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

    /**
     * Handle storage change to update the theme
     * @param changes The change from the local storage
     */
    handleStorageChange(changes) {
      if (changes._passbolt_data && changes._passbolt_data.newValue.config) {
        const config = changes._passbolt_data.newValue.config;
        if (config && this.theme !== config["user.settings.theme"] && this.isValidTheme(config["user.settings.theme"])) {
          this.theme = config["user.settings.theme"];
          this.updateStylesWithUserPreferences();
          this.mediaQueryPreferColor?.removeEventListener("change", this.setThemeFromOsPreference);
        }
      }
    }

    /**
     * Get the local storage
     * @returns {Promise<unknown>}
     */
    async getLocalStorage() {
      return new Promise(resolve => {
        chrome.storage.local.get(["_passbolt_data"], result => resolve(result));
      });
    }

    /**
     * Get the theme from the local storage
     * @returns {Promise<string>}
     */
    async getThemeFromLocalStorage() {
      const storageData = await this.getLocalStorage();
      const {_passbolt_data: {config}} = storageData;
      return config["user.settings.theme"];
    }

    /**
     * Set theme according to the OS preference
     * @param mediaQueryPreferColor
     */
    setThemeFromOsPreference(mediaQueryPreferColor) {
      this.theme = mediaQueryPreferColor.matches
        ? "midgar"
        : "default";
      this.updateStylesWithUserPreferences();
    }

    /**
     * Is theme defined
     * @returns {Promise<boolean>}
     */
    async isThemeDefined() {
      const storageData = await this.getLocalStorage();
      if (!storageData || !storageData._passbolt_data) {
        return false;
      }

      const {_passbolt_data: {config}} = storageData;
      const keyExists = config && "user.settings.theme" in config;
      return keyExists && this.isValidTheme(config["user.settings.theme"]);
    }

    /**
     * Is valid theme
     * @param theme
     * @returns {boolean}
     */
    isValidTheme(theme) {
      const whitelist = ['default', 'midgar', 'solarized_light', 'solarized_dark'];
      return whitelist.includes(theme);
    }
  }

  new Stylesheet();
})();
