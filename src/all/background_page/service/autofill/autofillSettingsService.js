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
 * @since         5.12.1
 */

// Must match STORAGE_KEY in webAccessibleResources/options.js (the options page writes this key directly).
const AUTOFILL_SETTINGS_LOCAL_STORAGE_KEY = "passbolt-autofill-settings";

/**
 * Service to read and persist the user's "autofill on launch" preference.
 *
 * - autofillOnLaunch (default false): when on, clicking the launch action on a quickaccess search
 *   result navigates to the resource URI and autofills the login form once the page has loaded.
 *
 * Note: auto-submit ("auto-login") is intentionally NOT offered. Submitting credentials without a
 * human seeing the loaded page removes the gating Passbolt deliberately keeps, and was dropped after
 * security review. The fill is a value the user can inspect and undo.
 *
 * This preference is device-local only; it is never sent to the API and never carries any secret.
 */
class AutofillSettingsService {
  /**
   * Retrieve the autofill settings from the browser local storage.
   * Unknown or missing values fall back to the safe (off) default.
   * @return {Promise<{autofillOnLaunch: boolean}>}
   */
  static async get() {
    const storedData = await browser.storage.local.get(AUTOFILL_SETTINGS_LOCAL_STORAGE_KEY);
    const settings = storedData?.[AUTOFILL_SETTINGS_LOCAL_STORAGE_KEY] || {};
    return { autofillOnLaunch: settings.autofillOnLaunch === true };
  }

  /**
   * Persist the autofill settings in the browser local storage.
   * The value is normalised to a boolean.
   * @param {{autofillOnLaunch: boolean}} settings
   * @return {Promise<{autofillOnLaunch: boolean}>} the persisted settings
   */
  static async set(settings) {
    const normalisedSettings = { autofillOnLaunch: settings?.autofillOnLaunch === true };
    await browser.storage.local.set({ [AUTOFILL_SETTINGS_LOCAL_STORAGE_KEY]: normalisedSettings });
    return normalisedSettings;
  }
}

export default AutofillSettingsService;
