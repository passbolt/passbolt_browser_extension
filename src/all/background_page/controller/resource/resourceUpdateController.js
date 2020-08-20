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
const __ = require('../../sdk/l10n').get;
const passphraseController = require('../passphrase/passphraseController');
const progressController = require('../progress/progressController');

const {Resource} = require('../../model/resource');
const {User} = require('../../model/user');
const {Keyring} = require('../../model/keyring');
const {Crypto} = require('../../model/crypto');
const {ResourceEntity} = require('../../model/entity/resource/resourceEntity');
const {ResourceModel} = require('../../model/resource/resourceModel');
const {UserService} = require('../../service/user');

class ResourceUpdateController {
  /**
   * ResourceUpdateController constructor
   *
   * @param {Worker} worker
   * @param {string} requestId
   * @param {ApiClientOptions} clientOptions
   */
  constructor(worker, requestId, clientOptions) {
    this.worker = worker;
    this.requestId = requestId;
    this.resourceModel = new ResourceModel(clientOptions);
    this.crypto = new Crypto();
  }

  /**
   * Update a resource.
   *
   * @param {object} resourceDto The resource data
   * @param {null|string|object} plaintextDto The secret to encrypt
   * @returns {Promise<Object>} updated resource
   */
  async main(resourceDto, plaintextDto) {
    // Most simple scenario, there is no secret to update
    if (plaintextDto === null) {
      return await this.updateResourceMetaOnly(resourceDto);
    } else {
      return await this.updateResourceAndSecret(resourceDto, plaintextDto);
    }
  }

  /**
   * Update a resource metadata
   *
   * @param {object} resourceDto
   * @returns {Promise<Object>} updated resource
   */
  async updateResourceMetaOnly(resourceDto) {
    await progressController.open(this.worker, __("Updating password"), 1);
    const updatedResource = await Resource.update(resourceDto);
    await progressController.update(this.worker, 1, __("Done!"));
    await progressController.close(this.worker);
    return updatedResource;
  }

  /**
   * Update a resource and associated secret
   *
   * @param {object} resourceDto
   * @param {string|object} plaintextDto
   * @returns {Promise<Object>} updated resource
   */
  async updateResourceAndSecret(resourceDto, plaintextDto) {
    let resource = new ResourceEntity(resourceDto);

    // Get the number of users the password is shared with to set the goal
    // And sync the keyring while we are at it
    const usersIds = await this.getUsersIdsToEncryptFor(resource.id);
    const keyring = new Keyring();
    const keyringSync = keyring.sync();

    // Get the passphrase if needed and decrypt secret key
    let privateKey = await this.getPrivateKey()

    // Set the goals
    await progressController.open(this.worker, __("Updating password"), 1);
    await usersIds;
    await keyringSync;
    const goals = usersIds.length + 2;
    await progressController.updateGoals(this.worker, goals);

    // Encrypt
    await progressController.update(this.worker, goals-1, __("Saving resource"));
    const plaintext = await this.resourceModel.serializePlaintextDto(resource.resourceTypeId, plaintextDto);
    resourceDto.secrets = await this.encryptSecrets(plaintext, usersIds, privateKey);

    // Post data & wrap up
    const updatedResource = await Resource.update(resourceDto);
    await progressController.update(this.worker, goals, __("Done!"));
    await progressController.close(this.worker);
    return updatedResource;
  }

  /**
   * getPrivateKey
   * @returns {Promise<openpgp.key.Key>}
   */
  async getPrivateKey() {
    try {
      let passphrase = await passphraseController.get(this.worker);
      return await this.crypto.getAndDecryptPrivateKey(passphrase);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  /**
   * Get all user ids a given resource should be encrypted for
   * TODO Move to service
   *
   * @param {string} resourceId
   * @returns {Promise<*>}
   */
  async getUsersIdsToEncryptFor(resourceId) {
    if (!resourceId || !Validator.isUUID(resourceId)) {
      throw new TypeError(__('Can not update resource. Resource id should be a valid UUID.'));
    }
    const filter = {
      'hasAccess': resourceId
    };
    const user = User.getInstance();
    const users = await UserService.findAll(user, {filter});
    return users.reduce((result, user) => [...result, user.id], []);
  }

  /**
   * Encrypt and sign plaintext data for the given users
   * TODO Move to service
   *
   * @param {string|Object} plaintextDto
   * @param {array} usersIds
   * @param {openpgp.key.Key} privateKey
   * @returns {Promise<array>}
   */
  async encryptSecrets(plaintextDto, usersIds, privateKey) {
    const secrets = [];
    for (let i in usersIds) {
      if (usersIds.hasOwnProperty(i)) {
        const userId =  usersIds[i];
        const data = await this.crypto.encrypt(plaintextDto, userId, privateKey);
        secrets.push({user_id: userId, data});
        await progressController.update(this.worker, i+1, __("Encrypting"));
      }
    }
    return secrets;
  }
}

exports.ResourceUpdateController = ResourceUpdateController;
