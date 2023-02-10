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
 * @since         3.6.3
 */
import AccountModel from "../../model/account/accountModel";
import PassphraseStorageService from "../../service/session_storage/passphraseStorageService";
import FileService from "../../service/file/fileService";
import OrganizationSettingsModel from "../../model/organizationSettings/organizationSettingsModel";
import SsoDataStorage from "../../service/indexedDB_storage/ssoDataStorage";
import SsoKitServerPartModel from "../../model/sso/ssoKitServerPartModel";
import PassboltApiFetchError from "../../error/passboltApiFetchError";
import GenerateSsoKitService from "../../service/sso/generateSsoKitService";

const RECOVERY_KIT_FILENAME = "passbolt-recovery-kit.asc";

class UpdatePrivateKeyController {
  /**
   * UpdatePrivateKeyController constructor
   * @param {Worker} worker
   * @param {string} requestId uuid
   * @param {ApiClientOptions} apiClientOptions the api client options
   */
  constructor(worker, requestId, apiClientOptions) {
    this.worker = worker;
    this.requestId = requestId;
    this.apiClientOptions = apiClientOptions;
    this.accountModel = new AccountModel(apiClientOptions);
    this.organisationSettingsModel = new OrganizationSettingsModel(apiClientOptions);
    this.ssoKitServerPartModel = new SsoKitServerPartModel(apiClientOptions);
  }

  /**
   * Wrapper of exec function to run it with worker.
   *
   * @return {Promise<void>}
   */
  async _exec(oldPassphrase, newPassphrase) {
    try {
      await this.exec(oldPassphrase, newPassphrase);
      this.worker.port.emit(this.requestId, "SUCCESS");
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, 'ERROR', error);
    }
  }

  /**
   * Updates the passphrase of the current user's private key and then starts a download of the new key.
   * It also generates a new SSO kit if required.
   * @param {string} oldPassphrase
   * @param {string} newPassphrase
   * @returns {Promise<void>}
   */
  async exec(oldPassphrase, newPassphrase) {
    if (typeof oldPassphrase !== 'string' || typeof newPassphrase !== 'string') {
      throw new Error('The old and new passphrase have to be string');
    }
    const organizationSettings = await this.organisationSettingsModel.getOrFind();
    const ssoIsEnabled = organizationSettings.isPluginEnabled("sso");

    const userPrivateArmoredKey = await this.accountModel.rotatePrivateKeyPassphrase(oldPassphrase, newPassphrase);
    if (ssoIsEnabled) {
      await this.regenerateSsoKit(newPassphrase);
    }
    await this.accountModel.updatePrivateKey(userPrivateArmoredKey);
    await PassphraseStorageService.flushPassphrase();
    if (PassphraseStorageService.isSessionKeptUntilLogOut()) {
      await PassphraseStorageService.set(newPassphrase);
    }
    await FileService.saveFile(RECOVERY_KIT_FILENAME, userPrivateArmoredKey, "text/plain", this.worker.tab.id);
  }

  /**
   * Handles the generation of a new SSO kit.
   * @param {string} newPassphrase
   * @returns {Promise<void>}
   */
  async regenerateSsoKit(newPassphrase) {
    let currentKit;
    try {
      currentKit = await SsoDataStorage.get();
    } catch (e) {
      console.log(e);
      return;
    }

    if (!currentKit) {
      return;
    }

    if (currentKit.isRegistered()) {
      await this.deleteServerPartSsoKit(currentKit.id);
    }

    const ssoKits = await GenerateSsoKitService.generateSsoKits(newPassphrase, currentKit.provider);
    const registeredServerPartSsoKit = await this.ssoKitServerPartModel.setupSsoKit(ssoKits.serverPart);
    ssoKits.clientPart.id = registeredServerPartSsoKit.id;
    await SsoDataStorage.save(ssoKits.clientPart);
  }

  /**
   * Tries to delete the server part SSO kit id if any.
   * If the kit doesn't exist on the server, it ignores the deletion silently.
   * @param {uuid} ssoKitId
   * @private
   */
  async deleteServerPartSsoKit(ssoKitId) {
    try {
      await this.ssoKitServerPartModel.deleteSsoKit(ssoKitId);
    } catch (e) {
      // we assume that the kit might have been remove from the server already
      if (!(e instanceof PassboltApiFetchError && e?.data?.code === 404)) {
        throw e;
      }
    }
  }
}

export default UpdatePrivateKeyController;
