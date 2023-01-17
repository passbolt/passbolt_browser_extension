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

import GetKeyInfoController from "../controller/crypto/getKeyInfoController";
import VerifyImportedKeyPassphraseController from "../controller/setup/verifyImportedKeyPassphraseController";
import SignInSetupController from "../controller/setup/signInSetupController";
import SetSetupAccountRecoveryUserSettingController from "../controller/setup/setSetupAccountRecoveryUserSettingController";
import ImportSetupPrivateKeyController from "../controller/setup/importSetupPrivateKeyController";
import StartSetupController from "../controller/setup/startSetupController";
import DownloadRecoveryKitController from "../controller/setup/downloadRecoverKitController";
import CompleteSetupController from "../controller/setup/completeSetupController";
import ValidatePrivateGpgKeySetupController from "../controller/crypto/validatePrivateGpgKeySetupController";
import SetSetupLocaleController from "../controller/setup/setSetupLocaleController";
import GetOrganizationSettingsController from "../controller/organizationSettings/getOrganizationSettingsController";
import GenerateSetupKeyPairController from "../controller/setup/generateSetupKeyPairController";
import GetAndInitSetupLocaleController from "../controller/setup/getAndInitSetupLocaleController";
import IsExtensionFirstInstallController from "../controller/extension/isExtensionFirstInstallController";
import SetSetupSecurityTokenController from "../controller/setup/setSetupSecurityTokenController";
import GetAccountRecoveryOrganizationPolicyController from "../controller/setup/getAccountRecoveryOrganizationPolicyController";

const listen = function(worker, apiClientOptions, account) {
  /*
   * The setup runtime memory.
   *
   * Used to store information collected during the user setup journey that shouldn't be stored on the react side of
   * the application because of their confidentiality or for logic reason. By instance the account recovery organization
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
    const controller = new GenerateSetupKeyPairController(worker, requestId, apiClientOptions, account, runtimeMemory);
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

  worker.port.on('passbolt.setup.set-account-recovery-user-setting', async(requestId, status) => {
    const controller = new SetSetupAccountRecoveryUserSettingController(worker, requestId, account, runtimeMemory);
    await controller._exec(status);
  });

  worker.port.on('passbolt.setup.import-key', async(requestId, armoredKey) => {
    const controller = new ImportSetupPrivateKeyController(worker, requestId, account);
    await controller._exec(armoredKey);
  });

  worker.port.on('passbolt.setup.verify-passphrase', async(requestId, passphrase) => {
    const controller = new VerifyImportedKeyPassphraseController(worker, requestId, account, runtimeMemory);
    await controller._exec(passphrase);
  });

  worker.port.on('passbolt.setup.set-security-token', async(requestId, securityTokenDto) => {
    const controller = new SetSetupSecurityTokenController(worker, requestId, account);
    await controller._exec(securityTokenDto);
  });

  worker.port.on('passbolt.setup.complete', async requestId => {
    const controller = new CompleteSetupController(worker, requestId, apiClientOptions, account, runtimeMemory);
    await controller._exec();
  });

  worker.port.on('passbolt.keyring.get-key-info', async(requestId, armoredKey) => {
    const controller = new GetKeyInfoController(worker, requestId);
    await controller._exec(armoredKey);
  });

  worker.port.on('passbolt.setup.sign-in', async(requestId, rememberMe) => {
    const controller = new SignInSetupController(worker, requestId, apiClientOptions, account, runtimeMemory);
    await controller._exec(rememberMe);
  });

  worker.port.on('passbolt.setup.validate-private-key', async(requestId, key) => {
    const controller = new ValidatePrivateGpgKeySetupController(worker, requestId);
    await controller._exec(key);
  });
};
export const SetupEvents = {listen};
