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
const {i18n} = require('../../sdk/i18n');
const passphraseController = require('../passphrase/passphraseController');
const progressController = require('../progress/progressController');
const {ResourceSecretsCollection} = require("../../model/entity/secret/resource/resourceSecretsCollection");

const {Keyring} = require('../../model/keyring');
const {ResourceEntity} = require('../../model/entity/resource/resourceEntity');
const {ResourceModel} = require('../../model/resource/resourceModel');
const {UserModel} = require('../../model/user/userModel');
const {EncryptMessageService} = require('../../service/crypto/encryptMessageService');
const {GetDecryptedUserPrivateKeyService} = require('../../service/account/getDecryptedUserPrivateKeyService');

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
    this.userModel = new UserModel(clientOptions);
    this.keyring = new Keyring();
  }

  /**
   * Update a resource.
   *
   * @param {object} resourceDto The resource data
   * @param {null|string|object} plaintextDto The secret to encrypt
   * @returns {Promise<Object>} updated resource
   */
  async main(resourceDto, plaintextDto) {
    const resourceEntity = new ResourceEntity(resourceDto);
    if (plaintextDto === null) {
      // Most simple scenario, there is no secret to update
      return await this.updateResourceMetaOnly(resourceEntity);
    } else {
      return await this.updateResourceAndSecret(resourceEntity, plaintextDto);
    }
  }

  /**
   * Update a resource metadata
   *
   * @param {ResourceEntity} resourceEntity
   * @returns {Promise<Object>} updated resource
   */
  async updateResourceMetaOnly(resourceEntity) {
    await progressController.open(this.worker, i18n.t("Updating password"), 1);
    const updatedResource = await this.resourceModel.update(resourceEntity);
    await progressController.update(this.worker, 1, i18n.t("Done!"));
    await progressController.close(this.worker);
    return updatedResource;
  }

  /**
   * Update a resource and associated secret
   *
   * @param {ResourceEntity} resourceEntity
   * @param {string|object} plaintextDto
   * @returns {Promise<Object>} updated resource
   */
  async updateResourceAndSecret(resourceEntity, plaintextDto) {
    // Get the passphrase if needed and decrypt secret key
    const privateKey = await this.getPrivateKey();

    // Set the goals
    try {
      await progressController.open(this.worker, i18n.t("Updating password"), 4);
      const usersIds = await this.userModel.findAllIdsForResourceUpdate(resourceEntity.id);
      const goals = usersIds.length + 3; // encrypt * users + keyring sync + save + done
      await progressController.updateGoals(this.worker, goals);

      // Sync keyring
      await progressController.update(this.worker, 1, i18n.t("Synchronizing keyring"));
      await this.keyring.sync();

      // Encrypt
      const plaintext = await this.resourceModel.serializePlaintextDto(resourceEntity.resourceTypeId, plaintextDto);
      resourceEntity.secrets = await this.encryptSecrets(plaintext, usersIds, privateKey);

      // Post data & wrap up
      await progressController.update(this.worker, goals - 1, i18n.t("Saving resource"));
      const updatedResource = await this.resourceModel.update(resourceEntity);
      await progressController.update(this.worker, goals, i18n.t("Done!"));
      await progressController.close(this.worker);
      return updatedResource;
    } catch (error) {
      await progressController.close(this.worker);
      throw error;
    }
  }

  /**
   * getPrivateKey
   * @returns {Promise<openpgp.PrivateKey>}
   */
  async getPrivateKey() {
    try {
      const passphrase = await passphraseController.get(this.worker);
      return GetDecryptedUserPrivateKeyService.getKey(passphrase);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  /**
   * Encrypt and sign plaintext data for the given users
   * TODO Move to service
   *
   * @param {string|Object} plaintextDto
   * @param {array} usersIds
   * @param {openpgp.PrivateKey} privateKey
   * @returns {Promise<ResourceSecretsCollection>}
   */
  async encryptSecrets(plaintextDto, usersIds, privateKey) {
    const secrets = [];
    for (let i = 0; i < usersIds.length; i++) {
      if (Object.prototype.hasOwnProperty.call(usersIds, i)) {
        const userId =  usersIds[i];
        const userPublicKey = this.keyring.findPublic(userId).armoredKey;
        const data = await EncryptMessageService.encrypt(plaintextDto, userPublicKey, privateKey);
        secrets.push({user_id: userId, data: data});
        await progressController.update(this.worker, i + 2, i18n.t("Encrypting"));
      }
    }
    return new ResourceSecretsCollection(secrets);
  }
}

exports.ResourceUpdateController = ResourceUpdateController;
