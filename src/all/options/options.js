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
 *
 * Extension options page for device-local autofill preferences. Reads/writes browser.storage.local
 * directly (the options page runs in the extension context). Kept dependency-free so it loads as a
 * plain script under the extension-pages CSP (script-src 'self').
 */
(() => {
  // Must match AUTOFILL_SETTINGS_LOCAL_STORAGE_KEY in background_page/service/autofill/autofillSettingsService.js.
  const STORAGE_KEY = "passbolt-autofill-settings";
  const browserApi = globalThis.browser || globalThis.chrome;
  const checkbox = document.getElementById("autofillOnLaunch");
  const statusEl = document.getElementById("status");

  function notify(message) {
    statusEl.textContent = message;
    if (message) {
      setTimeout(() => {
        statusEl.textContent = "";
      }, 1500);
    }
  }

  async function load() {
    try {
      const data = await browserApi.storage.local.get(STORAGE_KEY);
      checkbox.checked = Boolean(data?.[STORAGE_KEY]?.autofillOnLaunch);
    } catch (error) {
      console.error(error);
    }
  }

  checkbox.addEventListener("change", async () => {
    try {
      await browserApi.storage.local.set({ [STORAGE_KEY]: { autofillOnLaunch: checkbox.checked } });
      notify("Saved.");
    } catch (error) {
      console.error(error);
      checkbox.checked = !checkbox.checked;
      notify("Could not save the setting.");
    }
  });

  load();
})();
