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
const {AccountRecoverySaveOrganizationSettingsController} = require("../controller/accountRecovery/accountRecoverySaveOrganizationSettingsController");
const {AccountRecoveryValidateOrganizationPrivateKeyController} = require("../controller/accountRecovery/accountRecoveryValidateOrganizationPrivateKeyController");
const {User} = require('../model/user');
const {AccountRecoveryGenerateOrganizationKeyController} = require("../controller/accountRecovery/accountRecoveryGenerateOrganizationKeyController");
const fileController = require('../controller/fileController');
const {AccountRecoveryModel} = require("../model/accountRecovery/accountRecoveryModel");
const {AccountRecoverySaveUserSettingController} = require("../controller/accountRecovery/accountRecoverySaveUserSetting");
const {AccountRecoveryReviewRequestController} = require("../controller/accountRecovery/accountRecoveryReviewRequestController");
const {GetKeyInfoController} = require("../controller/crypto/getKeyInfoController");
const {AccountRecoveryGetOrganizationPolicyController} = require("../controller/accountRecovery/accountRecoveryGetOrganizationPolicyController");

/**
 * Listens the account recovery events
 * @param worker
 */
const listen = function(worker) {
  worker.port.on('passbolt.account-recovery.get-organization-policy', async requestId => {
    const apiClientOptions = await User.getInstance().getApiClientOptions();
    const accountRecoveryGetOrganizationPolicyController = new AccountRecoveryGetOrganizationPolicyController(worker, requestId, apiClientOptions);
    await accountRecoveryGetOrganizationPolicyController._exec();
  });

  worker.port.on('passbolt.account-recovery.save-organization-settings', async(requestId, accountRecoveryOrganizationPolicyDto, oldAccountRecoveryOrganizationPolicyDto, privateGpgKeyDto) => {
    const apiClientOptions = await User.getInstance().getApiClientOptions();
    const accountRecoverySaveOrganizationSettingsController = new AccountRecoverySaveOrganizationSettingsController(worker, requestId, apiClientOptions);
    await accountRecoverySaveOrganizationSettingsController.exec(accountRecoveryOrganizationPolicyDto, oldAccountRecoveryOrganizationPolicyDto, privateGpgKeyDto);
  });

  worker.port.on('passbolt.account-recovery.validate-organization-key', async(requestId, newAccountRecoveryOrganizationPublicKeyDto, currentAccountRecoveryOrganizationPublicKeyDto) => {
    const controller = new AccountRecoveryValidatePublicKeyController(worker, requestId);
    await controller.exec(newAccountRecoveryOrganizationPublicKeyDto, currentAccountRecoveryOrganizationPublicKeyDto);
  });

  worker.port.on('passbolt.account-recovery.get-organization-key-details', async(requestId, armoredKey) => {
    const getKeyInfoController = new GetKeyInfoController(worker, requestId);
    await getKeyInfoController._exec(armoredKey);
  });

  worker.port.on('passbolt.account-recovery.generate-organization-key', async(requestId, generateGpgKeyDto) => {
    const controller = new AccountRecoveryGenerateOrganizationKeyController(worker, requestId);
    await controller._exec(generateGpgKeyDto);
  });

  worker.port.on('passbolt.account-recovery.download-organization-generated-key', async(requestId, privateKeyDto) => {
    try {
      const date = new Date().toISOString().slice(0, 10);
      await fileController.saveFile(`organization-recovery-private-key-${date}.asc`, privateKeyDto.armored_key, "text/plain", worker.tab.id);
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

  /** Whenever the account recovery user requests needs to be get */
  worker.port.on('passbolt.account-recovery.get-user-requests', async(requestId, userId) => {
    try {
      const apiClientOptions = await User.getInstance().getApiClientOptions();
      const accountRecoveryModel = new AccountRecoveryModel(apiClientOptions);
      const accountRecoveryUserRequestsCollection = await accountRecoveryModel.findUserRequests(userId);
      worker.port.emit(requestId, 'SUCCESS', accountRecoveryUserRequestsCollection);
    } catch (error) {
      console.error(error);
      worker.port.emit(requestId, 'ERROR', error);
    }
  });

  worker.port.on('passbolt.user.save-account-recovery-settings', async(requestId, accountRecoveryUserSettingDto, accountRecoveryOrganizationPublicKeyDto) => {
    const apiClientOptions = await User.getInstance().getApiClientOptions();
    const controller = new AccountRecoverySaveUserSettingController(worker, requestId, apiClientOptions);
    return await controller.exec(accountRecoveryUserSettingDto, accountRecoveryOrganizationPublicKeyDto);
  });

  worker.port.on('passbolt.account-recovery.review-request', async(requestId, accountRecoveryResponseDto, privateKeyDto) => {
    const apiClientOptions = await User.getInstance().getApiClientOptions();
    const controller = new AccountRecoveryReviewRequestController(worker, requestId, apiClientOptions);
    await controller._exec(accountRecoveryResponseDto, privateKeyDto);
  });
};


exports.listen = listen;
