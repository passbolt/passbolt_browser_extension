/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         3.7.3
 */
import GenerateSsoKeyService from "../../service/crypto/generateSsoKeyService";
import GenerateSsoIvService from "../../service/crypto/generateSsoIvService";
import EncryptSsoPassphraseService from "../../service/crypto/encryptSsoPassphraseService";
import SsoDataStorage from "../../service/indexedDB_storage/ssoDataStorage";

class SetSetupSsoUserSettingController {
  /**
   * GetSsoConfigurationController constructor
   * @param {Worker} worker
   * @param {string} requestId uuid
   * @param {ApiClientOptions} apiClientOptions
   */
  constructor(worker, requestId, account, runtimeMemory) {
    this.worker = worker;
    this.requestId = requestId;
    this.account = account;
    this.runtimeMemory = runtimeMemory;
  }

  /**
   * Wrapper of exec function to run it with worker.
   *
   * @return {Promise<void>}
   */
  async _exec() {
    try {
      const ssoConfiguration = await this.exec();
      this.worker.port.emit(this.requestId, "SUCCESS", ssoConfiguration);
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, "ERROR", error);
    }
  }

  /**
   * Get the current SSO configuration.
   *
   * @return {Promise<void>}
   */
  async exec() {
    try {
      if (!this?.runtimeMemory?.passphrase) {
        throw new Error('A passphrase is required.');
      }

      const nek = await GenerateSsoKeyService.generateSsoKey();
      const extractableKey = await GenerateSsoKeyService.generateSsoKey(true);
      const iv1 = GenerateSsoIvService.generateIv();
      const iv2 = GenerateSsoIvService.generateIv();

      const tmpCipher = await EncryptSsoPassphraseService.encrypt(this.runtimeMemory.passphrase, nek, iv1);
      const cipheredPassphrase = await EncryptSsoPassphraseService.encrypt(tmpCipher, extractableKey, iv2);

      const ssoUserServerData = {
        key: extractableKey,
        cipher: cipheredPassphrase
      };

      this.account.ssoConfiguration = ssoUserServerData;
      const ssoUserClientData = {nek, iv1, iv2};
      await SsoDataStorage.save(ssoUserClientData);
    } catch (error) {
      delete this.account.ssoConfiguration;
      throw error;
    }
  }
}

export default SetSetupSsoUserSettingController;
