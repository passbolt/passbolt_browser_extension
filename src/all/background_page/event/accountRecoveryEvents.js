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
const {AccountRecoveryValidatePublicKeyController} = require("../controller/accountRecovery/AccountRecoveryValidatePublicKeyController");
const {AccountRecoverySaveOrganizationSettingsController} = require("../controller/accountRecovery/accountRecoverySaveOrganizationSettingsController");
const {ValidatePrivateOrganizationAccountRecoveryKeyController} = require("../controller/accountRecovery/validatePrivateOrganizationAccountRecoveryKeyController");
const {ExternalGpgKeyEntity} = require("../model/entity/gpgkey/external/externalGpgKeyEntity");
const {User} = require('../model/user');
const {GetGpgKeyInfoService} = require("../service/crypto/getGpgKeyInfoService");
const {AccountRecoveryGenerateKeyPairController} = require("../controller/accountRecovery/accountRecoveryGenerateKeyPairController");
const fileController = require('../controller/fileController');
const {AccountRecoveryModel} = require("../model/accountRecovery/accountRecoveryModel");
const {AccountRecoverySaveUserSettingController} = require("../controller/accountRecovery/accountRecoverySaveUserSetting");
const {AccountRecoveryResponseController} = require("../controller/accountRecovery/accountRecoveryResponseController");
/**
 * Listens the account recovery events
 * @param worker
 */
const listen = function(worker) {
  /** Whenever the account recovery organization needs to be get */
  worker.port.on('passbolt.account-recovery.get', async requestId => {
    try {
      const apiClientOptions = await User.getInstance().getApiClientOptions();
      const accountRecoveryModel = new AccountRecoveryModel(apiClientOptions);
      const accountRecoveryOrganizationPolicyEntity = await accountRecoveryModel.find();
      worker.port.emit(requestId, 'SUCCESS', accountRecoveryOrganizationPolicyEntity);
    } catch (error) {
      console.error(error);
      worker.port.emit(requestId, 'ERROR', error);
    }
  });

  /** Whenever the account recovery organization needs to be saved */
  worker.port.on('passbolt.account-recovery.save-organization-settings', async(requestId, accountRecoveryOrganizationPolicyDto, oldAccountRecoveryOrganizationPolicyDto, privateGpgKeyDto) => {
    const apiClientOptions = await User.getInstance().getApiClientOptions();
    const accountRecoverySaveOrganizationSettingsController = new AccountRecoverySaveOrganizationSettingsController(worker, requestId, apiClientOptions);
    await accountRecoverySaveOrganizationSettingsController.exec(accountRecoveryOrganizationPolicyDto, oldAccountRecoveryOrganizationPolicyDto, privateGpgKeyDto);
  });

  worker.port.on('passbolt.account-recovery.validate-organization-key', async(requestId, newAccountRecoveryOrganizationPublicKeyDto, currentAccountRecoveryOrganizationPublicKeyDto) => {
    const controller = new AccountRecoveryValidatePublicKeyController(worker, requestId);
    await controller.exec(newAccountRecoveryOrganizationPublicKeyDto, currentAccountRecoveryOrganizationPublicKeyDto);
  });

  worker.port.on('passbolt.account-recovery.get-organization-key-details', async(requestId, accountRecoveryOrganizationPublicKeyDto) => {
    try {
      const keyInfo = await GetGpgKeyInfoService.getKeyInfo(accountRecoveryOrganizationPublicKeyDto.armored_key);
      worker.port.emit(requestId, 'SUCCESS', new ExternalGpgKeyEntity(keyInfo));
    } catch (error) {
      console.error(error);
      worker.port.emit(requestId, 'ERROR', error);
    }
  });

  worker.port.on('passbolt.account-recovery.generate-organization-key', async(requestId, generateGpgKeyDto) => {
    const controller = new AccountRecoveryGenerateKeyPairController(worker, requestId);
    await controller.exec(generateGpgKeyDto);
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

  worker.port.on('passbolt.account-recovery.validate-organization-private-key', async(requestId, accountRecoveryPolicyDto, privateAccountRecoveryKeyDto) => {
    const controller = new ValidatePrivateOrganizationAccountRecoveryKeyController(worker, requestId);
    return await controller.exec(accountRecoveryPolicyDto, privateAccountRecoveryKeyDto);
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

  /** Whenever the admin review the account recovery request */
  worker.port.on('passbolt.account-recovery.organization-review', async(requestId, accountRecoveryResponseDto, privateKeyDto) => {
    try {
      const apiClientOptions = await User.getInstance().getApiClientOptions();
      const accountRecoveryResponseController = new AccountRecoveryResponseController(worker, apiClientOptions);
      await accountRecoveryResponseController.saveReview(accountRecoveryResponseDto, privateKeyDto);
      this.worker.port.emit(requestId, "SUCCESS");
    } catch (error) {
      console.error(error);
      this.worker.port.emit(requestId, 'ERROR', error);
    }
  });
};

exports.listen = listen;
