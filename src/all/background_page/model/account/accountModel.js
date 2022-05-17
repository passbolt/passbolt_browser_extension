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
const {User} = require('../user');
const {Keyring} = require('../keyring');
const {ReEncryptPrivateKeyService} = require('../../service/crypto/reEncryptPrivateKeyService');
const {readKeyOrFail} = require('../../utils/openpgp/openpgpAssertions');

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
  async updatePrivateKey(oldPassphrase, newPassphrase) {
    const privateArmoredKey = this.keyring.findPrivate().armoredKey;
    try {
      const privateKey = await readKeyOrFail(privateArmoredKey);
      const reEncryptedArmoredKey = await ReEncryptPrivateKeyService.reEncrypt(privateKey, oldPassphrase, newPassphrase);
      await this.keyring.importPrivate(reEncryptedArmoredKey.armor());
      return reEncryptedArmoredKey;
    } catch (error) {
      // Rollback to the old passphrase
      await this.keyring.importPrivate(privateArmoredKey);
      throw error;
    }
  }
}

exports.AccountModel = AccountModel;
