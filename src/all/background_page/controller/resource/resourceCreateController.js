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
const masterPasswordController = require('../masterPasswordController');
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
    const masterPassword = await masterPasswordController.get(this.worker);
    const privateKey = await crypto.getAndDecryptPrivateKey(masterPassword);
    const secret = await crypto.encrypt(password, User.getInstance().get().id, privateKey);
    const data = Object.assign({
      secrets: [{ data: secret }]
    }, resource);
    const savedResource = await Resource.save(data);

    return savedResource;
  }
}

exports.ResourceCreateController = ResourceCreateController;
