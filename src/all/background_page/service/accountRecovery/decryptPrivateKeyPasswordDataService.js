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
import DecryptMessageService from "../../service/crypto/decryptMessageService";
import AccountRecoveryPrivateKeyPasswordDecryptedDataEntity from "../../model/entity/accountRecovery/accountRecoveryPrivateKeyPasswordDecryptedDataEntity";
import {OpenpgpAssertion} from "../../utils/openpgp/openpgpAssertions";


class DecryptPrivateKeyPasswordDataService {
  /**
   * Decrypt the private key password encrypted data.
   * @param {AccountRecoveryPrivateKeyPasswordEntity} privateKeyPassword The private key password.
   * @param {openpgp.PrivateKey} decryptionKey The decrypted decryption key.
   * @param {string} verificationDomain The expected domain the private key password should contain.
   * @param {string} [verificationUserId] The id of the user who is the owner of the private key encrypted with the private key password.
   * @param {openpgp.PublicKey} [verificationUserPublicKey] The public key of the user who is the owner of the private key encrypted with the private key password
   * @return {Promise<AccountRecoveryPrivateKeyPasswordDecryptedDataEntity>}
   * @throw {Error} If the decryption key fingerprint does not match the private key password recipient fingerprint.
   * @throw {Error} If the private key password data cannot be decrypted.
   * @throw {Error} If the decrypted private key password data cannot be parsed.
   * @throw {EntityValidationError} If the decrypted private key password data cannot be used to create a private key password decrypted data entity.
   * @throw {Error} If the user id contained in the decrypted private key password data does not match the verification user id.
   * @throw {Error} If the fingerprint contained in the decrypted private key password data does not match the verification fingerprint.
   */
  static async decrypt(privateKeyPassword, decryptionKey, verificationDomain, verificationUserId, verificationUserPublicKey) {
    let privateKeyPasswordDecryptedDataDto;

    if (decryptionKey.getFingerprint().toUpperCase() !== privateKeyPassword.recipientFingerprint) {
      throw new Error("The decryption key fingerprint does not match the private key password recipient fingerprint.");
    }

    // @todo verify the signature on the password: can be the user itself while performing the setup or the admin while rotating the ork.
    const privateKeyPasswordMessage = await OpenpgpAssertion.readMessageOrFail(privateKeyPassword.data);
    const privateKeyPasswordDecryptedDataSerialized = await DecryptMessageService.decrypt(privateKeyPasswordMessage, decryptionKey);

    try {
      privateKeyPasswordDecryptedDataDto = JSON.parse(privateKeyPasswordDecryptedDataSerialized);
    } catch (error) {
      throw new Error("Unable to parse the decrypted private key password data.");
    }

    const privateKeyPasswordDecryptedData = new AccountRecoveryPrivateKeyPasswordDecryptedDataEntity(privateKeyPasswordDecryptedDataDto);

    if (privateKeyPasswordDecryptedData.domain !== verificationDomain) {
      throw new Error("The domain contained in the private key password data does not match the expected target domain.");
    }

    if (verificationUserId) {
      if (privateKeyPasswordDecryptedData.privateKeyUserId !== verificationUserId) {
        throw new Error("The user id contained in the private key password data does not match the private key target used id.");
      }
    }

    if (verificationUserPublicKey) {
      if (privateKeyPasswordDecryptedData.privateKeyFingerprint !== verificationUserPublicKey.getFingerprint().toUpperCase()) {
        throw new Error("The private key password data fingerprint should match the user public fingerprint.");
      }
    }

    return privateKeyPasswordDecryptedData;
  }
}

export default DecryptPrivateKeyPasswordDataService;
