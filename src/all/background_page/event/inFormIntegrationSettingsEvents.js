/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2024 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2024 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         5.7.0
 */
import GetActiveAccountService from "../service/account/getActiveAccountService";
import InFormIntegrationSettingsLocalStorage from "../service/local_storage/inFormIntegrationSettingsLocalStorage";
import InFormIntegrationSettingsEntity from "../model/entity/inFormIntegration/inFormIntegrationSettingsEntity";

/**
 * Listens to the in-form integration settings events.
 *
 * These events are registered on both the application pagemod (so the settings screen can read and
 * update the preference) and the web integration pagemod (so the content script bootstrap can read
 * it). The account is resolved internally so the handlers behave the same in both contexts.
 *
 * @param {Worker} worker
 * @param {ApiClientOptions} [_apiClientOptions]
 * @param {AbstractAccountEntity} [account] The account, only provided on the application pagemod.
 */
const listen = function (worker, _apiClientOptions, account) {
  /*
   * Get the user's in-form integration settings.
   *
   * @listens passbolt.in-form-integration-settings.get
   * @param requestId {uuid} The request identifier
   */
  worker.port.on("passbolt.in-form-integration-settings.get", async (requestId) => {
    try {
      const resolvedAccount = account || (await GetActiveAccountService.get());
      const localStorage = new InFormIntegrationSettingsLocalStorage(resolvedAccount);
      const settings = (await localStorage.get()) || InFormIntegrationSettingsEntity.createDefault();
      worker.port.emit(requestId, "SUCCESS", settings.toDto());
    } catch (error) {
      console.error(error);
      worker.port.emit(requestId, "ERROR", error);
    }
  });

  /*
   * Set the user's in-form integration settings.
   *
   * @listens passbolt.in-form-integration-settings.set
   * @param requestId {uuid} The request identifier
   * @param settingsDto {object} The settings to save
   */
  worker.port.on("passbolt.in-form-integration-settings.set", async (requestId, settingsDto) => {
    try {
      const resolvedAccount = account || (await GetActiveAccountService.get());
      const localStorage = new InFormIntegrationSettingsLocalStorage(resolvedAccount);
      const settings = new InFormIntegrationSettingsEntity(settingsDto);
      await localStorage.set(settings);
      worker.port.emit(requestId, "SUCCESS", settings.toDto());
    } catch (error) {
      console.error(error);
      worker.port.emit(requestId, "ERROR", error);
    }
  });
};

export const InFormIntegrationSettingsEvents = { listen };
