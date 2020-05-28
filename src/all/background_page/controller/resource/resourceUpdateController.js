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
 * @since         2.13.0
 */
const passphraseController = require('../passphrase/passphraseController');
const {Resource} = require('../../model/resource');
const {User} = require('../../model/user');
const {Keyring} = require('../../model/keyring');
const {Crypto} = require('../../model/crypto');
const progressController = require('../progress/progressController');
const {UserService} = require('../../service/user');

class ResourceUpdateController {
  /**
   * Constructor
   *
   * @param {Worker} worker
   * @param {string} requestId
   */
  constructor(worker, requestId) {
    this.worker = worker;
    this.requestId = requestId;
  }

  /**
   * Update a resource.
   *
   * @param {array} resource The resource meta data.
   * @param {string} password The secret in clear.
   * @throws
   */
  async main(resource, password) {
    if (password) {
      resource.secrets = await this.encryptPassword(resource, password);
      await progressController.update(this.worker, 3, "Updating password");
    } else {
      await progressController.open(this.worker, "Updating password");
    }
    try {
      const updatedResource = await Resource.update(resource);
      await progressController.close(this.worker);
      return updatedResource;
    } catch(error) {
      console.error(error);
      throw error;
    }
  }

  async encryptPassword(resource, password) {
    const keyring = new Keyring();
    const crypto = new Crypto();
    const secrets = [];

    const keyringSyncPromise = keyring.sync();
    const getUsersIdsPromise = this.getUsersIdsToEncryptFor(resource);
    const passphrase = await passphraseController.get(this.worker);
    await progressController.open(this.worker, "Updating password", 3, "Retrieving users");
    await keyringSyncPromise;
    const usersIds = await getUsersIdsPromise;
    await progressController.update(this.worker, 1, "Decrypting private key");
    const privateKey = await crypto.getAndDecryptPrivateKey(passphrase);
    await progressController.update(this.worker, 2, "Encrypting");
    for (let i in usersIds) {
      const userId =  usersIds[i];
      const data = await crypto.encrypt(password, userId, privateKey);
      secrets.push({user_id: userId, data});
    }

    return secrets;
  }

  async getUsersIdsToEncryptFor(resource) {
    const filter = {
      'hasAccess': resource.id
    };
    const user = User.getInstance();
    const users = await UserService.findAll(user, {filter});
    return users.reduce((result, user) => [...result, user.id], []);
  }
}

exports.ResourceUpdateController = ResourceUpdateController;
