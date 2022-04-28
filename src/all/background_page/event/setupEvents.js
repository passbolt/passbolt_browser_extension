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
 * @since         2.0.0
 */

const {VerifyAccountPassphraseController} = require("../controller/account/verifyAccountPassphraseController");
const {GenerateSetupKeyPairController} = require("../controller/setup/generateSetupKeyPairController");
const {SetSetupAccountRecoveryUserSettingController} = require("../controller/setup/setSetupAccountRecoveryUserSettingController");
const {ImportSetupPrivateKeyController} = require("../controller/setup/importSetupPrivateKeyController");
const {GetKeyInfoController} = require("../controller/crypto/getKeyInfoController");
const {GetOrganizationSettingsController} = require("../controller/organizationSettings/getOrganizationSettingsController");
const {IsExtensionFirstInstallController} = require("../controller/extension/isExtensionFirstInstallController");
const {GetAndInitSetupLocaleController} = require("../controller/setup/getAndInitSetupLocaleController");
const {SetSetupLocaleController} = require("../controller/setup/setSetupLocaleController");
const {StartSetupController} = require("../controller/setup/startSetupController");
const {GetAccountRecoveryOrganizationPolicyController} = require("../controller/setup/getAccountRecoveryOrganizationPolicyController");
const {DownloadRecoveryKitController} = require("../controller/setup/downloadRecoverKitController");
const {SetSetupSecurityTokenController} = require("../controller/setup/setSetupSecurityTokenController");
const {CompleteSetupController} = require("../controller/setup/completeSetupController");
const {AuthSignInController} = require("../controller/auth/authSignInController");
const {ValidatePrivateGpgKeyController} = require("../controller/crypto/validatePrivateGpgKeyController");

const listen = function(worker, apiClientOptions, account) {
  /*
   * The setup runtime memory.
   *
   * Used to store information collected during the user setup journey that shouldn't be stored on the react side of
   * the application because of their confidentiality or for logic reason. By intance the account recovery organization
   * policy, collected during a setup start, and used later during the process to encrypt the private escrow of the user.
   */
  const runtimeMemory = {};

  worker.port.on('passbolt.setup.is-first-install', async requestId => {
    const controller = new IsExtensionFirstInstallController(worker, requestId);
    await controller._exec();
  });

  worker.port.on('passbolt.organization-settings.get', async requestId => {
    const controller = new GetOrganizationSettingsController(worker, requestId, apiClientOptions);
    await controller._exec();
  });

  worker.port.on('passbolt.setup.start', async requestId => {
    const controller = new StartSetupController(worker, requestId, apiClientOptions, account, runtimeMemory);
    await controller._exec();
  });

  worker.port.on('passbolt.setup.get-and-init-locale', async requestId => {
    const controller = new GetAndInitSetupLocaleController(worker, requestId, apiClientOptions, account);
    await controller._exec();
  });

  worker.port.on('passbolt.setup.update-locale', async(requestId, localeDto) => {
    const controller = new SetSetupLocaleController(worker, requestId, apiClientOptions, account);
    await controller._exec(localeDto);
  });

  worker.port.on('passbolt.setup.generate-key', async(requestId, generateGpgKeyDto) => {
    const controller = new GenerateSetupKeyPairController(worker, requestId, account);
    await controller._exec(generateGpgKeyDto);
  });

  worker.port.on('passbolt.setup.download-recovery-kit', async requestId => {
    const controller = new DownloadRecoveryKitController(worker, requestId, account);
    await controller._exec();
  });

  worker.port.on('passbolt.setup.get-account-recovery-organization-policy', async requestId => {
    const controller = new GetAccountRecoveryOrganizationPolicyController(worker, requestId, runtimeMemory);
    await controller._exec();
  });

  worker.port.on('passbolt.setup.set-account-recovery-user-setting', async(requestId, status, passphrase) => {
    const controller = new SetSetupAccountRecoveryUserSettingController(worker, requestId, account, runtimeMemory);
    await controller._exec(status, passphrase);
  });

  worker.port.on('passbolt.setup.import-key', async(requestId, armoredKey) => {
    const controller = new ImportSetupPrivateKeyController(worker, requestId, account);
    await controller._exec(armoredKey);
  });

  worker.port.on('passbolt.setup.verify-passphrase', async(requestId, passphrase) => {
    const controller = new VerifyAccountPassphraseController(worker, requestId, account);
    await controller._exec(passphrase);
  });

  worker.port.on('passbolt.setup.set-security-token', async(requestId, securityTokenDto) => {
    const controller = new SetSetupSecurityTokenController(worker, requestId, account);
    await controller._exec(securityTokenDto);
  });

  worker.port.on('passbolt.setup.complete', async requestId => {
    const controller = new CompleteSetupController(worker, requestId, apiClientOptions, account);
    await controller._exec();
  });

  worker.port.on('passbolt.keyring.get-key-info', async(requestId, armoredKey) => {
    const controller = new GetKeyInfoController(worker, requestId);
    await controller._exec(armoredKey);
  });

  worker.port.on('passbolt.setup.sign-in', async(requestId, passphrase, rememberMe) => {
    const controller = new AuthSignInController(worker, requestId, apiClientOptions, account);
    await controller._exec(passphrase, rememberMe);
  });

  worker.port.on('passbolt.setup.validate-private-key', async(requestId, key) => {
    const controller = new ValidatePrivateGpgKeyController(worker, requestId);
    await controller._exec(key, true);
  });
};
exports.listen = listen;
