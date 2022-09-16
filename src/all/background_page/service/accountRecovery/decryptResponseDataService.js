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

import {OpenpgpAssertion} from "../../utils/openpgp/openpgpAssertions";
import DecryptMessageService from "../../service/crypto/decryptMessageService";
import AccountRecoveryPrivateKeyPasswordDecryptedDataEntity from "../../model/entity/accountRecovery/accountRecoveryPrivateKeyPasswordDecryptedDataEntity";


class DecryptResponseDataService {
  /**
   * Decrypt the response encrypted data.
   * @param {AccountRecoveryResponseEntity} response The response.
   * @param {openpgp.PrivateKey} decryptionKey The decrypted decryption key.
   * @param {string} verificationUserId The id of the user who is the owner of the private key encrypted with the private key password.
   * @param {string}verificationDomain The expected domain to find in the decrypted private key password.
   * @param {openpgp.PublicKey} [verificationUserPublicKey] (Optional) The public key of the user who is the owner of the private key encrypted with the private key password.
   * @return {Promise<AccountRecoveryPrivateKeyPasswordDecryptedDataEntity>}
   * @throws {Error} If the response data cannot be decrypted.
   * @throws {Error} If the decrypted response data cannot be parsed.
   * @throws {EntityValidationError} If the decrypted response data cannot be used to create a private key password decrypted data entity.
   * @throws {Error} If the user id contained in the decrypted response data does not match the verification user id.
   * @throws {Error} If the fingerprint contained in the decrypted response data does not match the verification fingerprint.
   */
  static async decrypt(response, decryptionKey, verificationUserId, verificationDomain, verificationUserPublicKey) {
    let privateKeyPasswordDecryptedDataDto;
    const responseDataMessage = await OpenpgpAssertion.readMessageOrFail(response.data);
    const privateKeyPasswordDecryptedDataSerialized = await DecryptMessageService.decrypt(responseDataMessage, decryptionKey);

    try {
      privateKeyPasswordDecryptedDataDto = JSON.parse(privateKeyPasswordDecryptedDataSerialized);
    } catch (error) {
      throw new Error("Unable to parse the decrypted response data.");
    }

    const privateKeyPasswordDecryptedData = new AccountRecoveryPrivateKeyPasswordDecryptedDataEntity(privateKeyPasswordDecryptedDataDto);

    if (privateKeyPasswordDecryptedData.privateKeyUserId !== verificationUserId) {
      throw new Error("The user id contained in the response data does not match the verification user id.");
    }

    if (privateKeyPasswordDecryptedData.domain !== verificationDomain) {
      throw new Error("The domain contained in the private key password data does not match the expected target domain.");
    }

    if (verificationUserPublicKey) {
      if (privateKeyPasswordDecryptedData.privateKeyFingerprint !== verificationUserPublicKey.getFingerprint().toUpperCase()) {
        throw new Error("The response data fingerprint should match the verification fingerprint.");
      }
    }

    return privateKeyPasswordDecryptedData;
  }
}

export default DecryptResponseDataService;
