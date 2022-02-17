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
const {GetGpgKeyInfoService} = require("../../crypto/getGpgKeyInfoService");
const {DecryptPrivateKeyService} = require('../../crypto/decryptPrivateKeyService');
const {WrongOrganizationRecoveryKeyError} = require('../../../error/wrongOrganizationRecoveryKeyError');

class ValidateAccountRecoveryOrganizationPrivateKeyService {
  /**
   * Validate the private ORK is the current one:
   * - does the private key matches the public one
   * - is the password the right one
   *
   * @param {AccountRecoveryOrganizationPolicyEntity} accountRecoveryOrganisationPolicyEntity The account recovery organization policy
   * @param {PrivateGpgkeyEntity} privateKeyEntity The account recovery organization private key entity
   * @return {Promise<void>}
   * @throws {WrongOrganizationRecoveryKeyError} If the provided key doesn't match the organization key.
   */
  static async validate(accountRecoveryOrganisationPolicyEntity, privateKeyEntity) {
    const publicKeyInfo = await GetGpgKeyInfoService.getKeyInfo(accountRecoveryOrganisationPolicyEntity.accountRecoveryOrganizationPublicKey.armoredKey);
    const privateKeyInfo = await GetGpgKeyInfoService.getKeyInfo(privateKeyEntity.armoredKey);

    if (publicKeyInfo.fingerprint !== privateKeyInfo.fingerprint) {
      throw new WrongOrganizationRecoveryKeyError(`Error, this is not the current organization recovery key. Expected fingerprint: ${publicKeyInfo.fingerprint}`, publicKeyInfo.fingerprint);
    }

    await DecryptPrivateKeyService.decryptPrivateGpgKeyEntity(privateKeyEntity);
  }
}

exports.ValidateAccountRecoveryOrganizationPrivateKeyService = ValidateAccountRecoveryOrganizationPrivateKeyService;
