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
 * @since         3.6.0
 */
import DownloadRecoveryKitController from "../controller/setup/downloadRecoverKitController";
import ContinueAccountRecoveryController from "../controller/accountRecovery/continueAccountRecoveryController";
import RecoverAccountController from "../controller/accountRecovery/recoverAccountController";
import VerifyAccountPassphraseController from "../controller/account/verifyAccountPassphraseController";
import AbortAndInitiateNewAccountRecoveryController from "../controller/accountRecovery/abortAndInitiateNewAccountRecoveryController";
import SetSetupLocaleController from "../controller/setup/setSetupLocaleController";
import GetOrganizationSettingsController from "../controller/organizationSettings/getOrganizationSettingsController";
import GetAndInitializeAccountLocaleController from "../controller/account/getAndInitializeAccountLocaleController";
import GetExtensionVersionController from "../controller/extension/getExtensionVersionController";
import GetAccountController from "../controller/account/getAccountController";
import AuthLoginController from "../controller/auth/authLoginController";

/**
 * Listens to the account recovery continue application events
 * @param {Worker} worker The worker
 * @param {ApiClientOptions} apiClientOptions The api client options
 * @param {AccountAccountRecoveryEntity} account The account completing the account recovery
 */
const listen = function(worker, apiClientOptions, account) {
  worker.port.on('passbolt.organization-settings.get', async requestId => {
    const controller = new GetOrganizationSettingsController(worker, requestId, apiClientOptions);
    await controller._exec();
  });

  worker.port.on('passbolt.locale.get', async requestId =>  {
    const controller = new GetAndInitializeAccountLocaleController(worker, requestId, apiClientOptions, account);
    await controller._exec();
  });

  worker.port.on('passbolt.addon.get-version', async requestId => {
    const controller = new GetExtensionVersionController(worker, requestId);
    await controller._exec();
  });

  worker.port.on('passbolt.account-recovery.continue', async requestId => {
    const controller = new ContinueAccountRecoveryController(worker, requestId, apiClientOptions, account);
    await controller._exec();
  });

  worker.port.on('passbolt.account-recovery.get-account', async requestId => {
    const controller = new GetAccountController(worker, requestId, account);
    await controller._exec();
  });

  worker.port.on('passbolt.account-recovery.verify-passphrase', async(requestId, passphrase) => {
    const controller = new VerifyAccountPassphraseController(worker, requestId, account);
    await controller._exec(passphrase);
  });

  worker.port.on('passbolt.account-recovery.recover-account', async(requestId, passphrase) => {
    const controller = new RecoverAccountController(worker, requestId, apiClientOptions, account);
    await controller._exec(passphrase);
  });

  worker.port.on('passbolt.account-recovery.sign-in', async(requestId, passphrase, rememberMe) => {
    const controller = new AuthLoginController(worker, requestId, apiClientOptions, account);
    await controller._exec(passphrase, rememberMe, true);
  });

  worker.port.on('passbolt.account-recovery.request-help-credentials-lost', async requestId => {
    const controller = new AbortAndInitiateNewAccountRecoveryController(worker, requestId, apiClientOptions, account);
    await controller._exec();
  });

  worker.port.on('passbolt.account-recovery.download-recovery-kit', async requestId => {
    const controller = new DownloadRecoveryKitController(worker, requestId, account);
    await controller._exec();
  });

  worker.port.on('passbolt.locale.update-user-locale', async(requestId, localeDto) => {
    const controller = new SetSetupLocaleController(worker, requestId, apiClientOptions, account);
    await controller._exec(localeDto);
  });
};

export const AccountRecoveryEvents = {listen};
