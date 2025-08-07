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
 * @since         4.10.1
 */
import PassphraseStorageService from '../session_storage/passphraseStorageService';
import SessionKeysBundleEntity from "passbolt-styleguide/src/shared/models/entity/sessionKey/sessionKeysBundleEntity";
import {assertString, assertType} from '../../utils/assertions';
import DecryptPrivateKeyService from '../crypto/decryptPrivateKeyService';
import EncryptMessageService from "../crypto/encryptMessageService";
import {OpenpgpAssertion} from "../../utils/openpgp/openpgpAssertions";

class EncryptSessionKeysBundlesService {
  /**
   * @constructor
   * @param {AbstractAccountEntity} account the user account
   */
  constructor(account) {
    this.account = account;
  }

  /**
   * Encrypt session key bundle data. Mutate the original object and replace decrypted data with encrypted one.
   *
   * @param {SessionKeysBundleEntity} sessionKeysBundle the session key bundle entity to encrypt.
   * @param {string} [passphrase = null] The passphrase to use to sign the encrypted data.
   * @returns {Promise<void>}
   */
  async encryptOne(sessionKeysBundle, passphrase = null) {
    assertType(sessionKeysBundle, SessionKeysBundleEntity, "The parameter \"sessionKeysBundle\" should be a SessionKeysBundleEntity.");
    if (passphrase !== null) {
      assertString(passphrase, 'The parameter "passphrase" should be a string.');
    }

    if (!sessionKeysBundle.isDecrypted) {
      throw new TypeError("The session key bundle should be decrypted.");
    }

    passphrase = passphrase || await PassphraseStorageService.getOrFail();

    const userDecryptedPrivateKey = await DecryptPrivateKeyService.decryptArmoredKey(this.account.userPrivateArmoredKey, passphrase);
    const userPublicKey = await OpenpgpAssertion.readKeyOrFail(this.account.userPublicArmoredKey);
    const message = JSON.stringify(sessionKeysBundle.data.toDto());
    sessionKeysBundle.data = await EncryptMessageService.encrypt(message, userPublicKey, [userDecryptedPrivateKey]);
  }
}

export default EncryptSessionKeysBundlesService;
