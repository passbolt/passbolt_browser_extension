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
const __ = require('../../sdk/l10n').get;
const {GroupUpdateEntity} = require("../../model/entity/group/update/groupUpdateEntity");
const {GroupModel} = require("../../model/group/groupModel");
const passphraseController = require('../passphrase/passphraseController');
const progressController = require('../progress/progressController');
const {GroupEntity} = require("../../model/entity/group/groupEntity");
const {SecretEntity} = require("../../model/entity/secret/secretEntity");
const {SecretsCollection} = require("../../model/entity/secret/secretsCollection");
const {Keyring} = require('../../model/keyring');
const {Crypto} = require('../../model/crypto');

const PROGRESS_DIALOG_TITLE = "Updating group ...";

class GroupsUpdateController {
  /**
   * MoveController constructor
   *
   * @param {Worker} worker
   * @param {string} requestId
   * @param {ApiClientOptions} clientOptions
   */
  constructor(worker, requestId, clientOptions) {
    this.worker = worker;
    this.groupModel = new GroupModel(clientOptions);
    this.keyring = new Keyring();
    this.crypto = new Crypto(this.keyring);
    this.progressGoal = 10;
    this.progress = 0;
  }

  /**
   * Orchestrate dialogs during the share operation
   *
   * @param {object} updatedGroupDto
   * @return {Promise}
   */
  async main(updatedGroupDto) {
    const updatedGroupEntity = new GroupEntity(updatedGroupDto);
    const originalGroupEntity = await this.groupModel.getById(updatedGroupEntity.id);
    const groupUpdateEntity = GroupUpdateEntity.createFromGroupsDiff(originalGroupEntity, updatedGroupEntity);

    await progressController.open(this.worker, PROGRESS_DIALOG_TITLE, this.progressGoal, __('Initialize'));
    await progressController.update(this.worker, this.progress++);

    try {
      const groupUpdateDryRunPromise = this.simulateUpdateGroup(groupUpdateEntity);
      const privateKey = await this.getPrivateKey();
      const groupUpdateDryRunResultEntity = await groupUpdateDryRunPromise;
      if (groupUpdateDryRunResultEntity.neededSecrets.length > 0) {
        await this.synchronizeKeys();
        groupUpdateEntity.secrets = await this.encryptNeededSecrets(privateKey, groupUpdateDryRunResultEntity);
      }
      await this.updateGroup(groupUpdateEntity);
      await progressController.update(this.worker, this.progressGoal);
      await progressController.close(this.worker);
    } catch (error) {
      await progressController.close(this.worker);
      throw error;
    }
    return updatedGroupDto;
  }

  /**
   * Simulate group update operation
   * @param {GroupUpdateEntity} groupUpdateEntity The group update entity
   * @returns {Promise<GroupUpdateDryRunResult>}
   */
  async simulateUpdateGroup(groupUpdateEntity) {
    const groupUpdateDryRunResultEntity = await this.groupModel.updateDryRun(groupUpdateEntity);
    this.progressGoal += groupUpdateDryRunResultEntity.neededSecrets.length + groupUpdateDryRunResultEntity.secrets.length;
    await progressController.updateGoals(this.worker, this.progressGoal);
    await progressController.update(this.worker, this.progress++);
    return groupUpdateDryRunResultEntity;
  }

  /**
   * Get the user private key decrypted
   * @returns {Promise<openpgp.key.Key>}
   */
  async getPrivateKey() {
    const passphrase = await passphraseController.get(this.worker);
    return this.crypto.getAndDecryptPrivateKey(passphrase);
  }

  /**
   * Synchronize the local keyring with the API.
   * @returns {Promise<int>}
   */
  async synchronizeKeys() {
    await progressController.update(this.worker, this.progress++, __('Synchronizing keys'));
    return this.keyring.sync();
  }

  /**
   * Encrypt the needed secrets to complete the group update operation.
   * @param {string} privateKey The logged in user private key
   * @param {GroupUpdateEntity} groupUpdateDryRunResultEntity The result of the group update simulation
   * @returns {Promise<SecretsCollection>}
   */
  async encryptNeededSecrets(privateKey, groupUpdateDryRunResultEntity) {
    const decryptedSecrets = await this.decryptSecrets(privateKey, groupUpdateDryRunResultEntity.secrets);
    return await this.encryptSecrets(privateKey, groupUpdateDryRunResultEntity.neededSecrets, decryptedSecrets);
  }

  /**
   * Encrypt a collection of needed secrets.
   * @param {string} privateKey The logged in user private key
   * @param {NeededSecretsCollection} neededSecretsCollection A collection of needed secret
   * @param {Array} decryptedSecrets A collection of decrypted secret [{resourceId: secretDecrypted}, ...]
   * @returns {Promise<SecretsCollection>}
   */
  async encryptSecrets(privateKey, neededSecretsCollection, decryptedSecrets) {
    const secrets = new SecretsCollection([]);
    const items = neededSecretsCollection.items;
    for (let i in items) {
      const neededSecret = items[i];
      const resourceId = neededSecret.resourceId;
      const userId = neededSecret.userId;
      progressController.update(this.worker, this.progress++, __(`Encrypting ${i}/${items.length}`));
      const secretDto = {
        resource_id: resourceId,
        user_id: userId,
        data: await this.crypto.encrypt(decryptedSecrets[resourceId], userId, privateKey)
      };
      const secret = new SecretEntity(secretDto);
      secrets.push(secret);
    }
    return secrets;
  }

  /**
   * Decrypt a collection of secrets
   * @param {string} privateKey The logged in user private key
   * @param {SecretsCollection} secretsCollection The collection of secrets to decrypt
   * @returns {Promise<[]>} [{resourceId: secretDecrypted}, ...]
   */
  async decryptSecrets(privateKey, secretsCollection) {
    const result = [];
    const items = secretsCollection.items;
    for (let i in items) {
      const secret = items[i];
      progressController.update(this.worker, this.progress++, __(`Decrypting ${i}/${items.length}`));
      result[secret.resourceId] = await this.crypto.decryptWithKey(secret.data, privateKey);
    }
    return result;
  }

  /**
   * Update the group
   * @param {GroupUpdateEntity} groupUpdateEntity The group update entity
   * @returns {Promise<void>}
   */
  async updateGroup(groupUpdateEntity) {
    await progressController.update(this.worker, this.progress++, __("Updating group"));
    await this.groupModel.update(groupUpdateEntity);
  }
}

exports.GroupsUpdateController = GroupsUpdateController;
