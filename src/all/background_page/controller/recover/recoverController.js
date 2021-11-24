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
 */
const {i18n} = require('../../sdk/i18n');
const app = require("../../app");
const {ApiClientOptions} = require("../../service/api/apiClient/apiClientOptions");
const {GpgKeyError} = require("../../error/GpgKeyError");
const {InvalidMasterPasswordError} = require("../../error/invalidMasterPasswordError");
const {AccountModel} = require("../../model/account/accountModel");
const {SetupModel} = require("../../model/setup/setupModel");
const {AuthModel} = require("../../model/auth/authModel");
const {GpgAuth} = require("../../model/gpgauth");
const {Keyring} = require('../../model/keyring');
const {Crypto} = require('../../model/crypto');
const {SetupEntity} = require("../../model/entity/setup/setupEntity");
const {SecurityTokenEntity} = require("../../model/entity/securityToken/securityTokenEntity");
const {AccountEntity} = require("../../model/entity/account/accountEntity");

class RecoverController {
  /**
   * Recover controller constructor
   *
   * @param {Worker} worker
   * @param {string} url The url on which the recover is launched
   */
  constructor(worker, url) {
    this.worker = worker;
    this.setupEntity = SetupEntity.createFromUrl(url);
    const apiClientOptions = (new ApiClientOptions()).setBaseUrl(this.setupEntity.domain);
    this.setupModel = new SetupModel(apiClientOptions);
    this.authModel = new AuthModel(apiClientOptions);
    this.accountModel = new AccountModel(apiClientOptions);
    this.keyring = new Keyring();
    this.crypto = new Crypto(this.keyring);
    this.legacyAuthModel = new GpgAuth(this.keyring);
  }

  /**
   * Retrieve the recover information.
   * @returns {Promise<SetupEntity>}
   */
  async retrieveRecoverInfo() {
    const serverKeyDto = await this.authModel.getServerKey();
    await this.keyring.keyInfo(serverKeyDto.armored_key);
    this.setupEntity.serverPublicArmoredKey = serverKeyDto.armored_key;
    this.setupEntity.user = await this.setupModel.findRecoverInfo(this.setupEntity.userId, this.setupEntity.token);
    return this.setupEntity;
  }

  /**
   * Import user key.
   * @param {string} armoredKey The key to import
   * @returns {Promise<void>}
   */
  async importKey(armoredKey) {
    const keyInfo = await this._assertImportKeyFormat(armoredKey);
    await this._assertImportKeyOwnedByUser(keyInfo.fingerprint);
    this.setupEntity.userPrivateArmoredKey = keyInfo.key;
    this.setupEntity.userPublicArmoredKey = await this.keyring.extractPublicKey(this.setupEntity.userPrivateArmoredKey);
  }

  /**
   * Assert import key.
   * @param {string} armoredKey The user armored private key
   * @returns {Promise<object>} The keyinfo
   * @throws {GpgKeyError} If the key is not a valid key
   * @throws {GpgKeyError} If the key is not a private key
   * @private
   */
  async _assertImportKeyFormat(armoredKey) {
    let keyInfo = null;

    try {
      keyInfo = await this.keyring.keyInfo(armoredKey);
    } catch (error) {
      throw new GpgKeyError(i18n.t('The key must be a valid private key.'));
    }
    if (!keyInfo.private) {
      throw new GpgKeyError(i18n.t('The key must be a private key.'));
    }

    return keyInfo;
  }

  /**
   * Assert import key is owned by the user doing the recover.
   * @todo for now the function only check that the key is recognized by the server. The API does offer yet a way to verify that a key is associated to a user id.
   * @param {string} fingerprint The import key fingerprint
   * @returns {Promise<void>}
   * @throws {GpgKeyError} If the key is already used
   * @private
   */
  async _assertImportKeyOwnedByUser(fingerprint) {
    const domain = this.setupEntity.domain;
    const serverPublicArmoredKey = this.setupEntity.serverPublicArmoredKey;

    try {
      await this.legacyAuthModel.verify(domain, serverPublicArmoredKey, fingerprint);
    } catch (error) {
      // @todo Handle not controlled errors, such as timeout error...
      throw new GpgKeyError(i18n.t('This key does not match any account.'));
    }
  }

  /**
   * Verify the imported key passphrase
   * @param {string} passphrase The passphrase
   * @param {boolean?} rememberUntilLogout (Optional) The passphrase should be remembered until the user is logged out
   * @returns {Promise<void>}
   */
  async verifyPassphrase(passphrase, rememberUntilLogout) {
    const privateKey = (await openpgp.key.readArmored(this.setupEntity.userPrivateArmoredKey)).keys[0];
    try {
      await privateKey.decrypt(passphrase);
    } catch (error) {
      throw new InvalidMasterPasswordError();
    }
    // Store the user passphrase to login in after the setup operation.
    this.setupEntity.passphrase = passphrase;
    if (rememberUntilLogout) {
      this.setupEntity.rememberUntilLogout = rememberUntilLogout;
    }
  }

  /**
   * Set the user security token.
   * @param {object} securityTokenDto The security token dto
   */
  setSecurityToken(securityTokenDto) {
    const securityTokenEntity = new SecurityTokenEntity(securityTokenDto);
    this.setupEntity.securityToken = securityTokenEntity;
  }

  /**
   * Complete the recover.
   * @returns {Promise<void>}
   */
  async complete() {
    const accountDto = this.setupEntity.toAccountDto();
    const accountEntity = new AccountEntity(accountDto);
    await this.setupModel.completeRecovery(this.setupEntity);
    await this.accountModel.add(accountEntity);
    app.pageMods.WebIntegration.init(); // This is required, the pagemod is not initialized prior to the completion of the setup.
    app.pageMods.AuthBootstrap.init(); // This is required, the pagemod is not initialized prior to the completion of the setup.
    await this.authModel.login(this.setupEntity.passphrase, this.setupEntity.rememberUntilLogout);
    await this.redirectToApp();
  }

  /**
   * Redirect the user to the application
   * @returns {Promise<void>}
   */
  async redirectToApp() {
    const url = this.setupEntity.domain;
    chrome.tabs.update(this.worker.tab.id, {url: url});
  }
}

exports.RecoverController = RecoverController;
