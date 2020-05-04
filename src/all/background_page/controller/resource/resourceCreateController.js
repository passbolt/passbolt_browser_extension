/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) Passbolt SARL (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         2.9.0
 */
const Crypto = require('../../model/crypto').Crypto;
const passphraseController = require('../passphrase/passphraseController');
const progressController = require('../progress/progressController');
const Resource = require('../../model/resource').Resource;
const User = require('../../model/user').User;

/**
 * Resources save controller
 */
class ResourceCreateController {

  constructor(worker, requestId) {
    this.worker = worker;
    this.requestId = requestId;
  }

  /**
   * Create a resource.
   *
   * @param {array} resource The resource data
   * @param {string} password The password to encrypt
   */
  async main(resource, password) {
    const crypto = new Crypto();
    const data = Object.assign({}, resource);
    let savedResource;

    const passphrase = await passphraseController.get(this.worker);
    await progressController.start(this.worker, "Creating password", 2, "Decrypting private key");
    const privateKey = await crypto.getAndDecryptPrivateKey(passphrase);
    await progressController.update(this.worker, 1, "Encrypting secret");

    try {
      const secret = await crypto.encrypt(password, User.getInstance().get().id, privateKey);
      data.secrets = [{data: secret}];
      await progressController.update(this.worker, 2, "Creating password");
      savedResource = await Resource.save(data);
    } catch (error) {
      await progressController.complete(this.worker);
      throw error;
    }

    await progressController.complete(this.worker);

    return savedResource;
  }
}

exports.ResourceCreateController = ResourceCreateController;
