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
const {AccountModel} = require("../../model/account/accountModel");
const {SetupModel} = require("../../model/setup/setupModel");
const {AuthModel} = require("../../model/auth/authModel");
const {GpgAuth} = require("../../model/gpgauth");
const {Keyring} = require('../../model/keyring');
const {SetupEntity} = require("../../model/entity/setup/setupEntity");
const {SecurityTokenEntity} = require("../../model/entity/securityToken/securityTokenEntity");
const {AccountEntity} = require("../../model/entity/account/accountEntity");
const {assertPublicKeys} = require("../../utils/openpgp/openpgpAssertions");

class RecoverController {
  /**
   * Recover controller constructor
   *
   * @param {Worker} worker The worker the controller is executed on.
   * @param {ApiClientOptions} apiClientOptions The api client options.
   * @param {string} url The url on which the recover is launched
   */
  constructor(worker, apiClientOptions, url) {
    this.worker = worker;
    this.setupEntity = SetupEntity.createFromUrl(url);
    this.setupModel = new SetupModel(apiClientOptions);
    this.authModel = new AuthModel(apiClientOptions);
    this.accountModel = new AccountModel(apiClientOptions);
    this.keyring = new Keyring();
    this.legacyAuthModel = new GpgAuth(this.keyring);
  }

  /**
   * Retrieve the recover information.
   * @returns {Promise<SetupEntity>}
   */
  async retrieveRecoverInfo() {
    const serverKeyDto = await this.authModel.getServerKey();
    const keyInfo = await assertPublicKeys(serverKeyDto.armored_key);
    this.setupEntity.serverPublicArmoredKey = keyInfo.armor();
    await this.setupModel.findRecoverInfo(this.setupEntity);
    return this.setupEntity;
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
