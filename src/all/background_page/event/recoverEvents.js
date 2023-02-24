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
import RequestAccountRecoveryController from "../controller/recover/requestAccountRecoveryController";
import GenerateRecoverAccountRecoveryRequestKeyController from "../controller/recover/generateRecoverAccountRecoveryRequestKeyController";
import VerifyImportedKeyPassphraseController from "../controller/setup/verifyImportedKeyPassphraseController";
import ImportRecoverPrivateKeyController from "../controller/recover/importRecoverPrivateKeyController";
import StartRecoverController from "../controller/recover/startRecoverController";
import CompleteRecoverController from "../controller/recover/completeRecoverController";
import ValidatePrivateGpgKeyRecoverController from "../controller/crypto/validatePrivateGpgKeyRecoverController";
import AbortAndRequestHelp from "../controller/recover/abortAndRequestHelpController";
import SignInSetupController from "../controller/setup/signInSetupController";
import SetSetupLocaleController from "../controller/setup/setSetupLocaleController";
import GetOrganizationSettingsController from "../controller/organizationSettings/getOrganizationSettingsController";
import GetAndInitializeAccountLocaleController from "../controller/account/getAndInitializeAccountLocaleController";
import IsExtensionFirstInstallController from "../controller/extension/isExtensionFirstInstallController";
import IsLostPassphraseCaseController from "../controller/accountRecovery/isLostPassphraseCaseController";
import SetSetupSecurityTokenController from "../controller/setup/setSetupSecurityTokenController";
import HasRecoverUserEnabledAccountRecoveryController from "../controller/recover/hasRecoverUserEnabledAccountRecoveryController";
import GeneratePortIdController from "../controller/port/generatePortIdController";


const listen = (worker, apiClientOptions, account) => {
  /*
   * The recover runtime memory.
   *
   * Used to store information collected during the user setup journey that shouldn't be stored on the react side of
   * the application because of their confidentiality or for logic reason. By instance the passphrase of the user.
   */
  const runtimeMemory = {};

  worker.port.on('passbolt.recover.first-install', async requestId => {
    const controller = new IsExtensionFirstInstallController(worker, requestId);
    await controller._exec();
  });

  worker.port.on('passbolt.recover.lost-passphrase-case', async requestId => {
    const controller = new IsLostPassphraseCaseController(worker, requestId);
    await controller._exec();
  });

  worker.port.on('passbolt.organization-settings.get', async requestId => {
    const controller = new GetOrganizationSettingsController(worker, requestId, apiClientOptions);
    await controller._exec();
  });

  worker.port.on('passbolt.recover.start', async requestId => {
    const controller = new StartRecoverController(worker, requestId, apiClientOptions, account);
    await controller._exec();
  });

  worker.port.on('passbolt.locale.get', async requestId => {
    const controller = new GetAndInitializeAccountLocaleController(worker, requestId, apiClientOptions, account);
    await controller._exec();
  });

  worker.port.on('passbolt.locale.update-user-locale', async(requestId, localeDto) => {
    const controller = new SetSetupLocaleController(worker, requestId, apiClientOptions, account);
    await controller._exec(localeDto);
  });

  worker.port.on('passbolt.recover.has-user-enabled-account-recovery', async requestId => {
    const controller = new HasRecoverUserEnabledAccountRecoveryController(worker, requestId, account);
    await controller._exec();
  });

  worker.port.on('passbolt.recover.import-key', async(requestId, armoredKey) => {
    const controller = new ImportRecoverPrivateKeyController(worker, requestId, account);
    await controller._exec(armoredKey);
  });

  worker.port.on('passbolt.recover.verify-passphrase', async(requestId, passphrase) => {
    const controller = new VerifyImportedKeyPassphraseController(worker, requestId, account, runtimeMemory);
    await controller._exec(passphrase);
  });

  worker.port.on('passbolt.recover.set-security-token', async(requestId, securityTokenDto) => {
    const controller = new SetSetupSecurityTokenController(worker, requestId, account);
    await controller._exec(securityTokenDto);
  });

  worker.port.on('passbolt.recover.complete', async requestId => {
    const controller = new CompleteRecoverController(worker, requestId, apiClientOptions, account);
    await controller._exec();
  });

  worker.port.on('passbolt.recover.sign-in', async(requestId, rememberMe) => {
    const controller = new SignInSetupController(worker, requestId, apiClientOptions, account, runtimeMemory);
    await controller._exec(rememberMe);
  });

  worker.port.on('passbolt.recover.generate-account-recovery-request-key', async(requestId, generateGpgKeyPairDto) => {
    const controller = new GenerateRecoverAccountRecoveryRequestKeyController(worker, requestId, apiClientOptions, account);
    await controller._exec(generateGpgKeyPairDto);
  });

  worker.port.on('passbolt.recover.initiate-account-recovery-request', async requestId => {
    const controller = new RequestAccountRecoveryController(worker, apiClientOptions, requestId, account);
    await controller._exec();
  });

  worker.port.on('passbolt.keyring.get-key-info', async(requestId, armoredKey) => {
    const controller = new GetKeyInfoController(worker, requestId);
    await controller._exec(armoredKey);
  });

  worker.port.on('passbolt.recover.validate-private-key', async(requestId, key) => {
    const controller = new ValidatePrivateGpgKeyRecoverController(worker, requestId);
    await controller._exec(key);
  });

  worker.port.on('passbolt.recover.request-help-credentials-lost', async requestId => {
    const controller = new AbortAndRequestHelp(worker, requestId, apiClientOptions, account);
    await controller._exec();
  });

  worker.port.on('passbolt.port.generate-id', async requestId => {
    const controller = new GeneratePortIdController(worker, requestId);
    await controller._exec();
  });
};
export const RecoverEvents = {listen};
