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
const app = require("../../app");
const {ApiClientOptions} = require("../../service/api/apiClient/apiClientOptions");
const fileController = require('../../controller/fileController');
const {GpgKeyError} = require("../../error/GpgKeyError");
const {AccountModel} = require("../../model/account/accountModel");
const {SetupModel} = require("../../model/setup/setupModel");
const {AuthModel} = require("../../model/auth/authModel");
const {GpgAuth} = require("../../model/gpgauth");
const {Keyring} = require('../../model/keyring');
const {Crypto} = require('../../model/crypto');
const {SetupEntity} = require("../../model/entity/setup/setupEntity");
const {GenerateGpgKeyEntity} = require("../../model/entity/gpgkey/generate/generateGpgkeyEntity");
const {SecurityTokenEntity} = require("../../model/entity/securityToken/securityTokenEntity");
const {AccountEntity} = require("../../model/entity/account/accountEntity");
const {i18n} = require('../../sdk/i18n');
const {SetAccountRecoveryUserSetting} = require("../../service/setup/setAccountRecoveryUserSetting");
const {GetGpgKeyInfoService} = require('../../service/crypto/getGpgKeyInfoService');

const RECOVERY_KIT_FILENAME = "passbolt-recovery-kit.asc";

class SetupController {
  /**
   * Setup controller constructor
   *
   * @param {Worker} worker
   * @param {string} url The url on which the setup is launched
   */
  constructor(worker, url) {
    this.worker = worker;
    this.setupEntity = SetupEntity.createFromUrl(url, true);
    const apiClientOptions = (new ApiClientOptions()).setBaseUrl(this.setupEntity.domain);
    this.setupModel = new SetupModel(apiClientOptions);
    this.authModel = new AuthModel(apiClientOptions);
    this.accountModel = new AccountModel(apiClientOptions);
    this.keyring = new Keyring();
    this.crypto = new Crypto(this.keyring);
    this.legacyAuthModel = new GpgAuth(this.keyring);
  }

  /**
   * Retrieve the setup information.
   * @returns {Promise<SetupEntity>}
   */
  async retrieveSetupInfo() {
    const serverKeyDto = await this.authModel.getServerKey();
    //Ensures that `serverKeyDto.armored_key` is a valid key.
    const keyInfo = await GetGpgKeyInfoService.getKeyInfo(serverKeyDto.armored_key);
    this.setupEntity.serverPublicArmoredKey = keyInfo.armoredKey;
    await this.setupModel.findSetupInfo(this.setupEntity);
    return this.setupEntity;
  }

  /**
   * Retrieve the account recovery organization policy.
   * @returns {Promise<AccountRecoveryOrganizationPolicy>}
   */
  async getAccountRecoveryOrganizationPolicy() {
    return this.setupEntity.accountRecoveryOrganizationPolicy;
  }

  /**
   * Generate user gpg key.
   * @param {object} generateGpgKeyDto The meta used to generate the user key
   */
  async generateKey(generateGpgKeyDto) {
    generateGpgKeyDto = this.setupEntity.toGenerateGpgKeyDto(generateGpgKeyDto);
    const generateGpgKeyEntity = new GenerateGpgKeyEntity(generateGpgKeyDto);
    const generateOpengpgKeyDto = generateGpgKeyEntity.toGenerateOpengpgKeyDto();
    const opengpgKeyPair = await openpgp.generateKey(generateOpengpgKeyDto);
    this.setupEntity.userPrivateArmoredKey = opengpgKeyPair.privateKeyArmored;
    this.setupEntity.userPublicArmoredKey = opengpgKeyPair.publicKeyArmored;
    // Store the user passphrase to login in after the setup operation.
    this.setupEntity.passphrase = generateGpgKeyDto.passphrase;
  }

  /**
   * Initiate the download of the recovery kit.
   * @returns {Promise<void>}
   */
  async downloadRecoveryKit() {
    const userPrivateArmoredKey = this.setupEntity.userPrivateArmoredKey;
    await fileController.saveFile(RECOVERY_KIT_FILENAME, userPrivateArmoredKey, "text/plain", this.worker.tab.id);
  }

  /**
   * Set the user account recovery setting.
   * @param {Object} accountRecoveryUserSettingDto The account recovery user setting dto
   * @return {Promise<void>}
   */
  async setAccountRecoveryUserSetting(accountRecoveryUserSettingDto) {
    return SetAccountRecoveryUserSetting.set(this.setupEntity, accountRecoveryUserSettingDto);
  }

  /**
   * Import user key.
   * @param {string} armoredKey The key to import
   * @returns {Promise<void>}
   */
  async importKey(armoredKey) {
    const keyInfo = await this._assertImportKeyFormat(armoredKey);
    await this._assertImportKeyNotUsed(keyInfo.fingerprint);
    this.setupEntity.userPrivateArmoredKey = keyInfo.armoredKey;
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
      keyInfo = await GetGpgKeyInfoService.getKeyInfo(armoredKey);
    } catch (error) {
      throw new GpgKeyError(i18n.t('The key must be a valid private key.'));
    }
    if (!keyInfo.private) {
      throw new GpgKeyError(i18n.t('The key must be a private key.'));
    }

    return keyInfo;
  }

  /**
   * Assert import key is not already used
   * @param {string} fingerprint The import key fingerprint
   * @returns {Promise<void>}
   * @throws {GpgKeyError} If the key is already used
   * @private
   */
  async _assertImportKeyNotUsed(fingerprint) {
    const domain = this.setupEntity.domain;
    const serverPublicArmoredKey = this.setupEntity.serverPublicArmoredKey;
    let keyAlreadyUsed = false;

    try {
      await this.legacyAuthModel.verify(domain, serverPublicArmoredKey, fingerprint);
      keyAlreadyUsed = true;
    } catch (error) {
      // @todo Handle not controlled errors, such as timeout error...
    }

    if (keyAlreadyUsed) {
      throw new GpgKeyError(i18n.t('This key is already used by another user.'));
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
   * Complete the registration.
   * @returns {Promise<void>}
   */
  async complete() {
    const accountDto = this.setupEntity.toAccountDto();
    const accountEntity = new AccountEntity(accountDto);
    await this.setupModel.complete(this.setupEntity);
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

exports.SetupController = SetupController;
