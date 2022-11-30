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
import {Worker} from "../model/worker";
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
import TestAzureSsoAuthenticationController from "../controller/sso/testAzureSsoAuthenticationController";
import GetCurrentSsoConfigurationController from "../controller/sso/getCurrentSsoConfigurationController";
import SaveSsoConfigurationAsDraftController from "../controller/sso/saveSsoConfigurationAsDraftController";
import ActivateSsoConfigurationController from "../controller/sso/activateSsoConfigurationController";
import DeleteSsoConfigurationController from "../controller/sso/deleteSsoConfigurationController";

const listen = function(worker, account) {
  /*
   * Whenever the (React) app changes his route
   * @listens passbolt.app.route-changed
   * @param path The relative navigated-to path
   */
  worker.port.on('passbolt.app.route-changed', path => {
    if (/^\/[A-Za-z0-9\-\/]*$/.test(path)) {
      const appBoostrapWorker = Worker.get('AppBootstrap', worker.tab.id);
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
    const controller = new GetCurrentSsoConfigurationController(worker, requestId, apiClientOptions);
    await controller._exec();
  });

  worker.port.on('passbolt.sso.save-draft', async(requestId, draftSsoConfiguration) => {
    const apiClientOptions = await User.getInstance().getApiClientOptions();
    const controller = new SaveSsoConfigurationAsDraftController(worker, requestId, apiClientOptions);
    await controller._exec(draftSsoConfiguration);
  });

  worker.port.on('passbolt.sso.test.azure', async(requestId, draftId) => {
    const apiClientOptions = await User.getInstance().getApiClientOptions();
    const controller = new TestAzureSsoAuthenticationController(worker, requestId, apiClientOptions, account);
    await controller._exec(draftId);
  });

  worker.port.on('passbolt.sso.activate-settings', async(requestId, draftId, ssoToken) => {
    const apiClientOptions = await User.getInstance().getApiClientOptions();
    const controller = new ActivateSsoConfigurationController(worker, requestId, apiClientOptions);
    await controller._exec(draftId, ssoToken);
  });

  worker.port.on('passbolt.sso.delete-settings', async(requestId, configurationId) => {
    const apiClientOptions = await User.getInstance().getApiClientOptions();
    const controller = new DeleteSsoConfigurationController(worker, requestId, apiClientOptions);
    await controller._exec(configurationId);
  });
};
export const AppEvents = {listen};
