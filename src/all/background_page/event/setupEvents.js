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
import GetUserPassphrasePoliciesController from "../controller/setup/getUserPassphrasePoliciesController";
import ReloadTabController from "../controller/tab/reloadTabController";
import FindMetadataSetupSettingsController from "../controller/metadata/findMetadataSetupSettingsController";
import EnableMetadataSetupSettingsController from "../controller/metadata/enableMetadataSetupSettingsController";
import RedirectPostLoginController from "../controller/auth/redirectPostLoginController";
import GetActiveAccountService from "../service/account/getActiveAccountService";
import RedirectToAdminWorkspaceController from "../controller/auth/redirectToAdminWorkspaceController";
import GetOrFindLoggedInUserController from "../controller/user/getOrFindLoggedInUserController";

const listen = function(worker, apiClientOptions, account) {
  worker.port.on('passbolt.setup.is-first-install', async requestId => {
    const controller = new IsExtensionFirstInstallController(worker, requestId);
    await controller._exec();
  });

  worker.port.on('passbolt.organization-settings.get', async requestId => {
    const controller = new GetOrganizationSettingsController(worker, requestId, apiClientOptions);
    await controller._exec();
  });

  worker.port.on('passbolt.setup.start', async requestId => {
    const controller = new StartSetupController(worker, requestId, apiClientOptions, account);
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
    const controller = new GenerateSetupKeyPairController(worker, requestId, apiClientOptions);
    await controller._exec(generateGpgKeyDto);
  });

  worker.port.on('passbolt.setup.download-recovery-kit', async requestId => {
    const controller = new DownloadRecoveryKitController(worker, requestId);
    await controller._exec();
  });

  worker.port.on('passbolt.setup.get-account-recovery-organization-policy', async requestId => {
    const controller = new GetAccountRecoveryOrganizationPolicyController(worker, requestId);
    await controller._exec();
  });

  worker.port.on('passbolt.setup.set-account-recovery-user-setting', async(requestId, status) => {
    const controller = new SetSetupAccountRecoveryUserSettingController(worker, requestId);
    await controller._exec(status);
  });

  worker.port.on('passbolt.setup.import-key', async(requestId, armoredKey) => {
    const controller = new ImportSetupPrivateKeyController(worker, requestId, apiClientOptions);
    await controller._exec(armoredKey);
  });

  worker.port.on('passbolt.setup.verify-passphrase', async(requestId, passphrase) => {
    const controller = new VerifyImportedKeyPassphraseController(worker, requestId);
    await controller._exec(passphrase);
  });

  worker.port.on('passbolt.setup.set-security-token', async(requestId, securityTokenDto) => {
    const controller = new SetSetupSecurityTokenController(worker, requestId);
    await controller._exec(securityTokenDto);
  });

  worker.port.on('passbolt.setup.complete', async requestId => {
    const controller = new CompleteSetupController(worker, requestId, apiClientOptions);
    await controller._exec();
  });

  worker.port.on('passbolt.keyring.get-key-info', async(requestId, armoredKey) => {
    const controller = new GetKeyInfoController(worker, requestId);
    await controller._exec(armoredKey);
  });

  worker.port.on('passbolt.setup.sign-in', async(requestId, rememberMe) => {
    const controller = new SignInSetupController(worker, requestId, apiClientOptions);
    await controller._exec(rememberMe);
  });

  worker.port.on('passbolt.setup.validate-private-key', async(requestId, key) => {
    const controller = new ValidatePrivateGpgKeySetupController(worker, requestId);
    await controller._exec(key);
  });

  worker.port.on('passbolt.setup.get-user-passphrase-policies', async requestId => {
    const controller = new GetUserPassphrasePoliciesController(worker, requestId);
    await controller._exec();
  });

  worker.port.on('passbolt.tab.reload', async requestId => {
    const controller = new ReloadTabController(worker, requestId);
    await controller._exec();
  });

  worker.port.on('passbolt.metadata.find-setup-settings', async requestId => {
    const controller = new FindMetadataSetupSettingsController(worker, requestId, apiClientOptions);
    await controller._exec();
  });

  worker.port.on('passbolt.metadata.enable', async requestId => {
    /*
     * The global account at this stage is an `AccountSetupEntity` that is tempered as this process is run after the sign-in
     * So, to addresse the enablement of the metadata in the Setup app, we need to get a `AccountEntity` instead.
     * That's why, we use `GetActiveAccountService.get()` to find an account.
     */
    const account = await GetActiveAccountService.get();
    const controller = new EnableMetadataSetupSettingsController(worker, requestId, apiClientOptions, account);
    await controller._exec();
  });

  /*
   * Redirect the user post login.
   *
   * @listens passbolt.auth.post-login-redirect
   * @param requestId {uuid} The request identifier
   */
  worker.port.on('passbolt.auth.post-login-redirect', async requestId => {
    const controller = new RedirectPostLoginController(worker, requestId, account);
    await controller._exec();
  });

  /*
   * Redirect the user to the administration workspace.
   *
   * @listens passbolt.auth.post-login-redirect-to-admin-workspace
   * @param requestId {uuid} The request identifier
   */
  worker.port.on("passbolt.auth.post-login-redirect-to-admin-workspace", async requestId => {
    const controller = new RedirectToAdminWorkspaceController(worker, requestId, account);
    await controller._exec();
  });

  /*
   * Find the logged in user
   *
   * @listens passbolt.users.find-logged-in-user
   * @param requestId {uuid} The request identifier
   */
  worker.port.on('passbolt.users.find-logged-in-user', async requestId => {
    const controller = new GetOrFindLoggedInUserController(worker, requestId, apiClientOptions, account);
    await controller._exec();
  });
};
export const SetupEvents = {listen};
