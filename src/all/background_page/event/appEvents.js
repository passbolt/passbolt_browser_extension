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

import GetOrganizationPolicyController from "../controller/accountRecovery/getOrganizationPolicyController";
import User from "../model/user";
import AccountRecoverySaveOrganizationPolicyController from "../controller/accountRecovery/accountRecoverySaveOrganizationPolicyController";
import AccountRecoveryValidatePublicKeyController from "../controller/accountRecovery/accountRecoveryValidatePublicKeyController";
import AccountRecoveryValidateOrganizationPrivateKeyController from "../controller/accountRecovery/accountRecoveryValidateOrganizationPrivateKeyController";
import AccountRecoveryGetUserRequestsController from "../controller/accountRecovery/accountRecoveryGetUserRequestsController";
import AccountRecoveryGetRequestController from "../controller/accountRecovery/accountRecoveryGetRequestController";
import ReviewRequestController from "../controller/accountRecovery/reviewRequestController";
import AccountRecoveryGenerateOrganizationKeyController from "../controller/accountRecovery/accountRecoveryGenerateOrganizationKeyController";
import AccountRecoverySaveUserSettingsController from "../controller/accountRecovery/accountRecoverySaveUserSettingController";
import HasUserPostponedUserSettingInvitationController from "../controller/accountRecovery/hasUserPostponedUserSettingInvitationController";
import PostponeUserSettingInvitationController from "../controller/accountRecovery/postponeUserSettingInvitationController";
import FileService from "../service/file/fileService";
import WorkerService from "../service/worker/workerService";
import TestSsoAuthenticationController from "../controller/sso/testSsoAuthenticationController";
import GetCurrentSsoSettingsController from "../controller/sso/getCurrentSsoSettingsController";
import SaveSsoSettingsAsDraftController from "../controller/sso/saveSsoSettingsAsDraftController";
import ActivateSsoSettingsController from "../controller/sso/activateSsoSettingsController";
import DeleteSsoSettingsController from "../controller/sso/deleteSsoSettingsController";
import GenerateSsoKitController from "../controller/auth/generateSsoKitController";
import AuthenticationEventController from "../controller/auth/authenticationEventController";
import FindMeController from "../controller/rbac/findMeController";
import GetOrFindPasswordPoliciesController from "../controller/passwordPolicies/getOrFindPasswordPoliciesController";
import SavePasswordPoliciesController from "../controller/passwordPolicies/savePasswordPoliciesController";
import FindPasswordPoliciesController from "../controller/passwordPolicies/findPasswordPoliciesController";
import ExportDesktopAccountController from "../controller/exportAccount/exportDesktopAccountController";
import GetLegacyAccountService from "../service/account/getLegacyAccountService";
import FindUserPassphrasePoliciesController from "../controller/userPassphrasePolicies/findUserPassphrasePoliciesController";
import SaveUserPassphrasePoliciesController from "../controller/userPassphrasePolicies/saveUserPassphrasePoliciesController";
import SavePasswordExpirySettingsController from "../controller/passwordExpiry/savePasswordExpirySettingsController";
import DeletePasswordExpirySettingsController from "../controller/passwordExpiry/deletePasswordExpirySettingsController";
import FindPasswordExpirySettingsController from "../controller/passwordExpiry/findPasswordExpirySettingsController";

const listen = function(worker, apiClientOptions, account) {
  const authenticationEventController = new AuthenticationEventController(worker);
  authenticationEventController.startListen();
  /*
   * Whenever the (React) app changes his route
   * @listens passbolt.app.route-changed
   * @param path The relative navigated-to path
   */
  worker.port.on('passbolt.app.route-changed', async path => {
    if (/^\/[A-Za-z0-9\-\/]*$/.test(path)) {
      const appBoostrapWorker = await WorkerService.get('AppBootstrap', worker.tab.id);
      appBoostrapWorker.port.emit('passbolt.app-bootstrap.change-route', path);
    }
  });

  /*
   * ==================================================================================
   *  Account recovery events
   * ==================================================================================
   */

  worker.port.on('passbolt.account-recovery.get-organization-policy', async requestId => {
    const apiClientOptions = await User.getInstance().getApiClientOptions();
    const controller = new GetOrganizationPolicyController(worker, requestId, apiClientOptions);
    await controller._exec();
  });

  worker.port.on('passbolt.account-recovery.save-organization-policy', async(requestId, accountRecoveryOrganizationPolicyDto, privateGpgKeyDto) => {
    const apiClientOptions = await User.getInstance().getApiClientOptions();
    const controller = new AccountRecoverySaveOrganizationPolicyController(worker, requestId, apiClientOptions, account);
    await controller._exec(accountRecoveryOrganizationPolicyDto, privateGpgKeyDto);
  });

  worker.port.on('passbolt.account-recovery.validate-organization-key', async(requestId, newAccountRecoveryOrganizationPublicKey) => {
    const apiClientOptions = await User.getInstance().getApiClientOptions();
    const controller = new AccountRecoveryValidatePublicKeyController(worker, requestId, apiClientOptions);
    await controller._exec(newAccountRecoveryOrganizationPublicKey);
  });

  worker.port.on('passbolt.account-recovery.generate-organization-key', async(requestId, generateGpgKeyDto) => {
    const apiClientOptions = await User.getInstance().getApiClientOptions();
    const controller = new AccountRecoveryGenerateOrganizationKeyController(worker, requestId, apiClientOptions);
    await controller._exec(generateGpgKeyDto);
  });

  worker.port.on('passbolt.account-recovery.download-organization-generated-key', async(requestId, privateKey) => {
    try {
      const date = new Date().toISOString().slice(0, 10);
      await FileService.saveFile(`organization-recovery-private-key-${date}.asc`, privateKey, "text/plain", worker.tab.id);
      worker.port.emit(requestId, 'SUCCESS');
    } catch (error) {
      console.error(error);
      worker.port.emit(requestId, 'ERROR', error);
    }
  });

  worker.port.on('passbolt.account-recovery.validate-organization-private-key', async(requestId, accountRecoveryOrganizationPrivateKeyDto) => {
    const apiClientOptions = await User.getInstance().getApiClientOptions();
    const controller = new AccountRecoveryValidateOrganizationPrivateKeyController(worker, requestId, apiClientOptions);
    return await controller._exec(accountRecoveryOrganizationPrivateKeyDto);
  });

  worker.port.on('passbolt.account-recovery.get-user-requests', async(requestId, userId) => {
    const apiClientOptions = await User.getInstance().getApiClientOptions();
    const controller = new AccountRecoveryGetUserRequestsController(worker, requestId, apiClientOptions);
    await controller._exec(userId);
  });

  worker.port.on('passbolt.account-recovery.get-request', async(requestId, accountRecoveryRequestId) => {
    const apiClientOptions = await User.getInstance().getApiClientOptions();
    const controller = new AccountRecoveryGetRequestController(worker, requestId, apiClientOptions);
    await controller._exec(accountRecoveryRequestId);
  });

  worker.port.on('passbolt.account-recovery.save-user-settings', async(requestId, accountRecoveryUserSettingDto) => {
    const apiClientOptions = await User.getInstance().getApiClientOptions();
    const controller = new AccountRecoverySaveUserSettingsController(worker, requestId, apiClientOptions, account);
    await controller._exec(accountRecoveryUserSettingDto);
  });

  worker.port.on('passbolt.account-recovery.review-request', async(requestId, accountRecoveryRequestId, responseStatus, privateKeyDto) => {
    const apiClientOptions = await User.getInstance().getApiClientOptions();
    const controller = new ReviewRequestController(worker, requestId, apiClientOptions, account);
    await controller._exec(accountRecoveryRequestId, responseStatus, privateKeyDto);
  });

  worker.port.on('passbolt.account-recovery.has-user-postponed-user-setting-invitation', async requestId => {
    const controller = new HasUserPostponedUserSettingInvitationController(worker, requestId);
    await controller._exec();
  });

  worker.port.on('passbolt.account-recovery.postpone-user-setting-invitation', async requestId => {
    const controller = new PostponeUserSettingInvitationController(worker, requestId);
    await controller._exec();
  });

  worker.port.on('passbolt.sso.get-current', async requestId => {
    const apiClientOptions = await User.getInstance().getApiClientOptions();
    const controller = new GetCurrentSsoSettingsController(worker, requestId, apiClientOptions);
    await controller._exec();
  });

  worker.port.on('passbolt.sso.save-draft', async(requestId, draftSsoSettings) => {
    const apiClientOptions = await User.getInstance().getApiClientOptions();
    const controller = new SaveSsoSettingsAsDraftController(worker, requestId, apiClientOptions);
    await controller._exec(draftSsoSettings);
  });

  worker.port.on('passbolt.sso.dry-run', async(requestId, draftId) => {
    const apiClientOptions = await User.getInstance().getApiClientOptions();
    const controller = new TestSsoAuthenticationController(worker, requestId, apiClientOptions, account);
    await controller._exec(draftId);
  });

  worker.port.on('passbolt.sso.activate-settings', async(requestId, draftId, ssoToken) => {
    const apiClientOptions = await User.getInstance().getApiClientOptions();
    const controller = new ActivateSsoSettingsController(worker, requestId, apiClientOptions);
    await controller._exec(draftId, ssoToken);
  });

  worker.port.on('passbolt.sso.delete-settings', async(requestId, settingsId) => {
    const apiClientOptions = await User.getInstance().getApiClientOptions();
    const controller = new DeleteSsoSettingsController(worker, requestId, apiClientOptions);
    await controller._exec(settingsId);
  });

  worker.port.on('passbolt.sso.generate-sso-kit', async(requestId, provider) => {
    const apiClientOptions = await User.getInstance().getApiClientOptions();
    const controller = new GenerateSsoKitController(worker, requestId, apiClientOptions, account);
    await controller._exec(provider);
  });

  /*
   * ==================================================================================
   *  Role based control action
   * ==================================================================================
   */

  worker.port.on('passbolt.rbacs.find-me', async(requestId, name) => {
    const apiClientOptions = await User.getInstance().getApiClientOptions();
    const controller = new FindMeController(worker, requestId, apiClientOptions, account);
    await controller._exec(name);
  });

  /*
   * ==================================================================================
   *  Password policies events.
   * ==================================================================================
   */

  worker.port.on('passbolt.password-policies.get', async requestId => {
    const apiClientOptions = await User.getInstance().getApiClientOptions();
    const controller = new GetOrFindPasswordPoliciesController(worker, requestId, account, apiClientOptions);
    await controller._exec();
  });

  worker.port.on('passbolt.password-policies.save', async(requestId, passwordSettingsDto) => {
    const apiClientOptions = await User.getInstance().getApiClientOptions();
    const controller = new SavePasswordPoliciesController(worker, requestId, account, apiClientOptions);
    await controller._exec(passwordSettingsDto);
  });

  worker.port.on('passbolt.password-policies.get-admin-settings', async requestId => {
    const apiClientOptions = await User.getInstance().getApiClientOptions();
    const controller = new FindPasswordPoliciesController(worker, requestId, account, apiClientOptions);
    await controller._exec();
  });

  /*
   * ==================================================================================
   *  User Passphrase Policies events.
   * ==================================================================================
   */

  worker.port.on('passbolt.user-passphrase-policies.find', async requestId => {
    const apiClientOptions = await User.getInstance().getApiClientOptions();
    const controller = new FindUserPassphrasePoliciesController(worker, requestId, apiClientOptions);
    await controller._exec();
  });

  worker.port.on('passbolt.user-passphrase-policies.save', async(requestId, userPassphrasePoliciesDto) => {
    const apiClientOptions = await User.getInstance().getApiClientOptions();
    const controller = new SaveUserPassphrasePoliciesController(worker, requestId, apiClientOptions);
    await controller._exec(userPassphrasePoliciesDto);
  });

  /*
   * ==================================================================================
   *  Password expiry settings events.
   * ==================================================================================
   */

  worker.port.on('passbolt.password-expiry.find', async requestId => {
    const controller = new FindPasswordExpirySettingsController(worker, requestId, account, apiClientOptions);
    await controller._exec();
  });

  worker.port.on('passbolt.password-expiry.save', async(requestId, passwordExpirySettingsDto) => {
    const controller = new SavePasswordExpirySettingsController(worker, requestId, account, apiClientOptions);
    await controller._exec(passwordExpirySettingsDto);
  });

  worker.port.on('passbolt.password-expiry.delete', async(requestId, passwordExpiryId) => {
    const controller = new DeletePasswordExpirySettingsController(worker, requestId, account, apiClientOptions);
    await controller._exec(passwordExpiryId);
  });


  /*
   * ==================================================================================
   *  Desktop app events.
   * ==================================================================================
   */

  /*
   * export account for desktop application
   *
   * @listens passbolt.desktop.export-account
   * @param requestId {uuid} The request identifier
   */
  worker.port.on('passbolt.desktop.export-account', async requestId => {
    const account = await GetLegacyAccountService.get();
    const controller = new ExportDesktopAccountController(worker, requestId, account);
    await controller._exec();
  });
};
export const AppEvents = {listen};
