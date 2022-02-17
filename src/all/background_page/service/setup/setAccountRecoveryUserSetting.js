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

const {BuildAccountRecoveryUserSettingEntityService} = require("../../service/accountRecovery/buildAccountRecoveryUserSettingEntityService");
const {DecryptPrivateKeyService} = require("../../service/crypto/decryptPrivateKeyService");
const {SetupEntity} = require("../../model/entity/setup/setupEntity");
const {AccountRecoveryUserSettingEntity} = require("../../model/entity/accountRecovery/accountRecoveryUserSettingEntity");

class SetAccountRecoveryUserSetting {
  /**
   * Set the user account recovery setting.
   * @param {SetupEntity} setup The current user setup
   * @param {Object} accountRecoveryUserSettingDto The user settings dto
   * @returns {Promise<void>}
   */
  static async set(setup, accountRecoveryUserSettingDto) {
    if (!(setup instanceof SetupEntity)) {
      throw new TypeError("setup parameter should be an instance of SetupEntity.");
    }
    let decryptedPrivateKey;

    if (accountRecoveryUserSettingDto?.status === AccountRecoveryUserSettingEntity.STATUS_APPROVED) {
      if (!setup.userPrivateArmoredKey) {
        throw new TypeError("setup user private armored key is required.");
      }
      if (!setup.passphrase) {
        throw new TypeError("setup user passphrase is required.");
      }
      decryptedPrivateKey = await DecryptPrivateKeyService.decrypt(setup.userPrivateArmoredKey, setup.passphrase);
    }

    setup.accountRecoveryUserSetting = await BuildAccountRecoveryUserSettingEntityService.build(
      accountRecoveryUserSettingDto,
      setup.accountRecoveryOrganizationPolicy?.accountRecoveryOrganizationPublicKey,
      decryptedPrivateKey?.armor()
    );
  }
}

exports.SetAccountRecoveryUserSetting = SetAccountRecoveryUserSetting;
