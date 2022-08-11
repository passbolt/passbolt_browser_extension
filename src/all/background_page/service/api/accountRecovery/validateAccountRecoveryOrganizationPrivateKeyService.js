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
import {OpenpgpAssertion} from "../../../utils/openpgp/openpgpAssertions";
import DecryptPrivateKeyService from "../../crypto/decryptPrivateKeyService";
import WrongOrganizationRecoveryKeyError from "../../../error/wrongOrganizationRecoveryKeyError";

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
    const accountRecoveryPublicKey = await OpenpgpAssertion.readKeyOrFail(accountRecoveryOrganisationPolicyEntity.accountRecoveryOrganizationPublicKey.armoredKey);
    const privateKey = await OpenpgpAssertion.readKeyOrFail(privateKeyEntity.armoredKey);

    const publicKeyFingerPrint = accountRecoveryPublicKey.getFingerprint().toUpperCase();
    const privateKeyFingerPrint = privateKey.getFingerprint().toUpperCase();

    if (publicKeyFingerPrint !== privateKeyFingerPrint) {
      throw new WrongOrganizationRecoveryKeyError(`Error, this is not the current organization recovery key. Expected fingerprint: ${publicKeyFingerPrint}`, publicKeyFingerPrint);
    }

    await DecryptPrivateKeyService.decrypt(privateKey, privateKeyEntity.passphrase);
  }
}

export default ValidateAccountRecoveryOrganizationPrivateKeyService;
