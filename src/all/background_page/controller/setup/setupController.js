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
const {AccountModel} = require("../../model/account/accountModel");
const {SetupModel} = require("../../model/setup/setupModel");
const {AuthModel} = require("../../model/auth/authModel");
const {GpgAuth} = require("../../model/gpgauth");
const {Keyring} = require('../../model/keyring');
const {SetupEntity} = require("../../model/entity/setup/setupEntity");
const {SecurityTokenEntity} = require("../../model/entity/securityToken/securityTokenEntity");
const {AccountEntity} = require("../../model/entity/account/accountEntity");
const {assertPublicKeys} = require("../../utils/openpgp/openpgpAssertions");

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
    this.legacyAuthModel = new GpgAuth(this.keyring);
  }

  /**
   * Retrieve the setup information.
   * @returns {Promise<SetupEntity>}
   */
  async retrieveSetupInfo() {
    const serverKeyDto = await this.authModel.getServerKey();
    //Ensures that `serverKeyDto.armored_key` is a valid key.
    const keyInfo = await assertPublicKeys(serverKeyDto.armored_key);
    this.setupEntity.serverPublicArmoredKey = keyInfo.armor();
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
   * Initiate the download of the recovery kit.
   * @returns {Promise<void>}
   */
  async downloadRecoveryKit() {
    const userPrivateArmoredKey = this.setupEntity.userPrivateArmoredKey;
    await fileController.saveFile(RECOVERY_KIT_FILENAME, userPrivateArmoredKey, "text/plain", this.worker.tab.id);
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
