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
const {UserEntity} = require("../entity/user/userEntity");
const {User} = require('../user');
const {Keyring} = require('../keyring');
const {UserService} = require("../../service/api/user/userService");

class AccountModel {
  /**
   * Constructor
   *
   * @param {ApiClientOptions} apiClientOptions
   * @public
   */
  constructor(apiClientOptions) {
    this.keyring = new Keyring();
    this.userService = new UserService(apiClientOptions);
  }

  /**
   * Add an account to the browser extension.
   * @param {AccountEntity} accountEntity The account to add
   * @returns {Promise<UserEntity>}
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
}

exports.AccountModel = AccountModel;
