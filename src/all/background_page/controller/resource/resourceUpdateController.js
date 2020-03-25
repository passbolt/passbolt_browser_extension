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
const Resource = require('../../model/resource').Resource;
const User = require('../../model/user').User;
const Keyring = require('../../model/keyring').Keyring;
const Crypto = require('../../model/crypto').Crypto;
const progressController = require('../progress/progressController');

class ResourceUpdateController {

  constructor(worker, requestId) {
    this.worker = worker;
    this.requestId = requestId;
  }

  /**
   * Update a resource.
   *
   * @param {array} resource The resource meta data.
   * @param {string} password The secret in clear.
   */
  async main(resource, password) {
    if (password) {
      const secrets = await this.encryptPassword(resource, password);
      resource.secrets = secrets;
      await progressController.update(this.worker, 3, "Updating password");
    } else {
      progressController.start(this.worker, "Updating password");
    }

    const updatedResource = await Resource.update(resource);
    progressController.complete(this.worker);

    return updatedResource;
  }

  async encryptPassword(resource, password) {
    const keyring = new Keyring();
    const crypto = new Crypto();
    const secrets = [];

    const keyringSyncPromise = keyring.sync();
    const getUsersIdsPromise = this.getUsersIdsToEncryptFor(resource);
    const passphrase = await passphraseController.get(this.worker);
    await progressController.start(this.worker, "Updating password", 3, "Retrieving users");
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
    const users = await User.findAll({ filter });
    const usersIds = users.reduce((result, user) => [...result, user.id], []);

    return usersIds;
  }
}

exports.ResourceUpdateController = ResourceUpdateController;
