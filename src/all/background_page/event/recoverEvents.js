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

const {SetSetupLocaleController} = require("../controller/setup/setSetupLocaleController");
const {RequestAccountRecoveryController} = require("../controller/recover/requestAccountRecoveryController");
const {GenerateRecoverAccountRecoveryRequestKeyController} = require("../controller/recover/generateRecoverAccountRecoveryRequestKeyController");
const {VerifyAccountPassphraseController} = require("../controller/account/verifyAccountPassphraseController");
const {ImportRecoverPrivateKeyController} = require('../controller/recover/importRecoverPrivateKeyController');
const {GetKeyInfoController} = require("../controller/crypto/getKeyInfoController");
const {GetOrganizationSettingsController} = require("../controller/organizationSettings/getOrganizationSettingsController");
const {IsExtensionFirstInstallController} = require("../controller/extension/isExtensionFirstInstallController");
const {StartRecoverController} = require("../controller/recover/startRecoverController");
const {SetSetupSecurityTokenController} = require("../controller/setup/setSetupSecurityTokenController");
const {HasRecoverUserEnabledAccountRecoveryController} = require("../controller/recover/hasRecoverUserEnabledAccountRecoveryController");
const {CompleteRecoverController} = require("../controller/recover/completeRecoverController");
const {AuthSignInController} = require("../controller/auth/authSignInController");
const {GetAndInitializeAccountLocaleController} = require("../controller/account/getAndInitializeAccountLocaleController");
const {ValidatePrivateGpgKeyController} = require("../controller/crypto/validatePrivateGpgKeyController");
const {AbortAndRequestHelp} = require("../controller/recover/abortAndRequestHelpController");

const listen = (worker, apiClientOptions, account) => {
  worker.port.on('passbolt.recover.first-install', async requestId => {
    const controller = new IsExtensionFirstInstallController(worker, requestId);
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
    const controller = new VerifyAccountPassphraseController(worker, requestId, account);
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

  worker.port.on('passbolt.recover.sign-in', async(requestId, passphrase, rememberMe) => {
    const controller = new AuthSignInController(worker, requestId, apiClientOptions, account);
    await controller._exec(passphrase, rememberMe);
  });

  worker.port.on('passbolt.recover.generate-account-recovery-request-key', async(requestId, generateGpgKeyPairDto) => {
    const controller = new GenerateRecoverAccountRecoveryRequestKeyController(worker, requestId, account);
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
    const controller = new ValidatePrivateGpgKeyController(worker, requestId);
    await controller._exec(key, false);
  });

  worker.port.on('passbolt.recover.request-help-credentials-lost', async requestId => {
    const controller = new AbortAndRequestHelp(worker, requestId, apiClientOptions, account);
    await controller._exec();
  });
};
exports.listen = listen;
