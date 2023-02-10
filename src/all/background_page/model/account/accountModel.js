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
import {OpenpgpAssertion} from "../../utils/openpgp/openpgpAssertions";
import Keyring from "../keyring";
import User from "../user";
import ReEncryptPrivateKeyService from "../../service/crypto/reEncryptPrivateKeyService";

class AccountModel {
  /**
   * Constructor
   * @public
   */
  constructor() {
    this.keyring = new Keyring();
  }

  /**
   * Add an account to the browser extension.
   * @param {AccountEntity} accountEntity The account to add
   * @throws {Error} if options are invalid or API error
   */
  async add(accountEntity) {
    const user = User.getInstance();
    user.settings.setSecurityToken(accountEntity.securityToken.toDto());
    user.settings.setDomain(accountEntity.domain);
    const legacyUserDto = accountEntity.toLegacyUserDto();
    user.set(legacyUserDto);
    this.keyring.flush(Keyring.PUBLIC);
    this.keyring.flush(Keyring.PRIVATE);
    await this.keyring.importServerPublicKey(accountEntity.serverPublicArmoredKey, accountEntity.domain);
    await this.keyring.importPublic(accountEntity.userPublicArmoredKey, accountEntity.userId);
    await this.keyring.importPrivate(accountEntity.userPrivateArmoredKey);
  }

  /**
   * Change the security token
   * @param securityTokenEntity the security token
   * @returns {Promise<void>}
   */
  async changeSecurityToken(securityTokenEntity) {
    await User.getInstance().updateSecurityToken(securityTokenEntity.toDto());
  }

  /**
   * Decrypt and encrypt the private key with new passphrase of an account to the browser extension.
   * @param {string} oldPassphrase The old passphrase
   * @param {string} newPassphrase The new passphrase
   * @returns {Promise<string>}
   * @throws {Error} if something went wrong while updating the private passphrase
   */
  async rotatePrivateKeyPassphrase(oldPassphrase, newPassphrase) {
    const privateArmoredKey = this.keyring.findPrivate().armoredKey;
    const privateKey = await OpenpgpAssertion.readKeyOrFail(privateArmoredKey);
    const reEncryptedPrivateKey = await ReEncryptPrivateKeyService.reEncrypt(privateKey, oldPassphrase, newPassphrase);
    return reEncryptedPrivateKey.armor();
  }

  /**
   * Update the currently stored private key with the given private key into the local storage.
   * @param {string} newPrivateArmoredKey armored private key
   * @returns {Promise<void>}
   * @throws {Error} if the new private key doesn't match the one already registered locally
   */
  async updatePrivateKey(newPrivateArmoredKey) {
    const currentPrivateKey = this.keyring.findPrivate();
    const newPrivateKey = await OpenpgpAssertion.readKeyOrFail(newPrivateArmoredKey);
    if (currentPrivateKey.fingerprint.toUpperCase() !== newPrivateKey.getFingerprint().toUpperCase()) {
      throw new Error("The private key to import doesn't match the current private key.");
    }
    await this.keyring.importPrivate(newPrivateArmoredKey);
  }
}

export default AccountModel;
