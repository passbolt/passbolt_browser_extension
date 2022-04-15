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

const {AccountRecoveryValidatePublicKeyController} = require("../controller/accountRecovery/AccountRecoveryValidatePublicKeyController");
const {AccountRecoverySaveOrganizationPolicyController} = require("../controller/accountRecovery/accountRecoverySaveOrganizationPolicyController");
const {AccountRecoveryValidateOrganizationPrivateKeyController} = require("../controller/accountRecovery/accountRecoveryValidateOrganizationPrivateKeyController");
const {User} = require('../model/user');
const {AccountRecoveryGenerateOrganizationKeyController} = require("../controller/accountRecovery/accountRecoveryGenerateOrganizationKeyController");
const fileController = require('../controller/fileController');
const {AccountRecoverySaveUserSettingsController} = require("../controller/accountRecovery/accountRecoverySaveUserSettingController");
const {AccountRecoveryReviewRequestController} = require("../controller/accountRecovery/accountRecoveryReviewRequestController");
const {AccountRecoveryGetOrganizationPolicyController} = require("../controller/accountRecovery/accountRecoveryGetOrganizationPolicyController");
const {AccountRecoveryGetUserRequestsController} = require("../controller/accountRecovery/accountRecoveryGetUserRequestsController");
const {AccountRecoveryGetRequestController} = require("../controller/accountRecovery/accountRecoveryGetRequestController");
const {HasUserPostponedUserSettingInvitationController} = require("../controller/accountRecovery/HasUserPostponedUserSettingInvitationController");
const {PostponeUserSettingInvitationController} = require("../controller/accountRecovery/postponeUserSettingInvitationController");

/**
 * Listens the account recovery events
 * @param worker
 */
const listen = function(worker) {
  worker.port.on('passbolt.account-recovery.get-organization-policy', async requestId => {
    const apiClientOptions = await User.getInstance().getApiClientOptions();
    const controller = new AccountRecoveryGetOrganizationPolicyController(worker, requestId, apiClientOptions);
    await controller._exec();
  });

  worker.port.on('passbolt.account-recovery.save-organization-policy', async(requestId, accountRecoveryOrganizationPolicyDto, privateGpgKeyDto) => {
    const apiClientOptions = await User.getInstance().getApiClientOptions();
    const controller = new AccountRecoverySaveOrganizationPolicyController(worker, requestId, apiClientOptions);
    await controller._exec(accountRecoveryOrganizationPolicyDto, privateGpgKeyDto);
  });

  worker.port.on('passbolt.account-recovery.validate-organization-key', async(requestId, newAccountRecoveryOrganizationPublicKeyDto, currentAccountRecoveryOrganizationPublicKeyDto) => {
    const controller = new AccountRecoveryValidatePublicKeyController(worker, requestId);
    await controller.exec(newAccountRecoveryOrganizationPublicKeyDto, currentAccountRecoveryOrganizationPublicKeyDto);
  });

  worker.port.on('passbolt.account-recovery.generate-organization-key', async(requestId, generateGpgKeyDto) => {
    const controller = new AccountRecoveryGenerateOrganizationKeyController(worker, requestId);
    await controller._exec(generateGpgKeyDto);
  });

  worker.port.on('passbolt.account-recovery.download-organization-generated-key', async(requestId, privateKey) => {
    try {
      const date = new Date().toISOString().slice(0, 10);
      await fileController.saveFile(`organization-recovery-private-key-${date}.asc`, privateKey, "text/plain", worker.tab.id);
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
    const controller = new AccountRecoverySaveUserSettingsController(worker, requestId, apiClientOptions);
    await controller._exec(accountRecoveryUserSettingDto);
  });

  worker.port.on('passbolt.account-recovery.review-request', async(requestId, accountRecoveryResponseDto, privateKeyDto) => {
    const apiClientOptions = await User.getInstance().getApiClientOptions();
    const controller = new AccountRecoveryReviewRequestController(worker, requestId, apiClientOptions);
    await controller._exec(accountRecoveryResponseDto, privateKeyDto);
  });

  worker.port.on('passbolt.account-recovery.has-user-postponed-user-setting-invitation', async requestId => {
    const controller = new HasUserPostponedUserSettingInvitationController(worker, requestId);
    await controller._exec();
  });

  worker.port.on('passbolt.account-recovery.postpone-user-setting-invitation', async requestId => {
    const controller = new PostponeUserSettingInvitationController(worker, requestId);
    await controller._exec();
  });
};


exports.listen = listen;
