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
const {AccountRecoverySaveOrganizationSettingsController} = require("../controller/accountRecovery/AccountRecoverySaveOrganizationSettingsController");
const {ExternalGpgKeyEntity} = require("../model/entity/gpgkey/external/externalGpgKeyEntity");
const {User} = require('../model/user');
const {GpgKeyInfoService} = require("../service/crypto/GpgKeyInfoService");

/**
 * Listens the account recovery events
 * @param worker
 */
const listen = function(worker) {
  worker.port.on('passbolt.account-recovery.organization.get', async requestId => {
    try {
      worker.port.emit(requestId, 'SUCCESS', {
        policy: "disabled"
      });
    } catch (error) {
      console.error(error);
      worker.port.emit(requestId, 'ERROR', error);
    }
  });

  /** Whenever the account recovery organization need to be saved */
  worker.port.on('passbolt.account-recovery.organization.save-settings', async(requestId, accountRecoveryOrganizationPolicyDto) => {
    const apiClientOptions = await User.getInstance().getApiClientOptions();
    const accountRecoverySaveOrganizationSettingsController = new AccountRecoverySaveOrganizationSettingsController(worker, requestId, apiClientOptions);
    await accountRecoverySaveOrganizationSettingsController.exec(accountRecoveryOrganizationPolicyDto);
  });

  worker.port.on('passbolt.account-recovery.organization.validate-key', async(requestId, newAccountRecoveryOrganizationPublicKeyDto, currentAccountRecoveryOrganizationPublicKeyDto) => {
    const controller = new AccountRecoveryValidatePublicKeyController(worker, requestId);
    await controller.validateOrganizationRecoveryKey(newAccountRecoveryOrganizationPublicKeyDto, currentAccountRecoveryOrganizationPublicKeyDto);
  });

  worker.port.on('passbolt.account-recovery.organization.get-key-details', async(requestId, accountRecoveryOrganizationPublicKeyDto) => {
    const keyEntity = new ExternalGpgKeyEntity(accountRecoveryOrganizationPublicKeyDto);
    const keyInfo = await GpgKeyInfoService.getKeyInfo(keyEntity);
    try {
      worker.port.emit(requestId, 'SUCCESS', new ExternalGpgKeyEntity(keyInfo));
    } catch (error) {
      console.error(error);
      worker.port.emit(requestId, 'ERROR', error);
    }
  });
};

exports.listen = listen;
