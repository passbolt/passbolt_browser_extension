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
import Keyring from "../../model/keyring";
import EncryptMessageService from "../../service/crypto/encryptMessageService";
import DecryptMessageService from "../../service/crypto/decryptMessageService";
import {PassphraseController as passphraseController} from "../passphrase/passphraseController";
import GetDecryptedUserPrivateKeyService from "../../service/account/getDecryptedUserPrivateKeyService";
import GroupModel from "../../model/group/groupModel";
import GroupEntity from "../../model/entity/group/groupEntity";
import GroupUpdateEntity from "../../model/entity/group/update/groupUpdateEntity";
import i18n from "../../sdk/i18n";
import SecretEntity from "../../model/entity/secret/secretEntity";
import SecretsCollection from "../../model/entity/secret/secretsCollection";
import ProgressService from "../../service/progress/progressService";

const INITIAL_PROGRESS_GOAL = 10;
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

    this.progressService = new ProgressService(this.worker, i18n.t('Updating group ...'));
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

    this.progressService.start(INITIAL_PROGRESS_GOAL, i18n.t('Initialize'));
    await this.progressService.finishStep(null, true);

    try {
      const privateKey = await this.getPrivateKey();
      const groupUpdateDryRunPromise = await this.simulateUpdateGroup(groupUpdateEntity);
      const groupUpdateDryRunResultEntity = await groupUpdateDryRunPromise;
      if (groupUpdateDryRunResultEntity.neededSecrets.length > 0) {
        await this.synchronizeKeys();
        groupUpdateEntity.secrets = await this.encryptNeededSecrets(privateKey, groupUpdateDryRunResultEntity);
      }
      await this.updateGroup(groupUpdateEntity);
      await this.progressService.finishStep(null, true);
      await this.progressService.close();
    } catch (error) {
      await this.progressService.close();
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
    const progressGoal = INITIAL_PROGRESS_GOAL + groupUpdateDryRunResultEntity.neededSecrets.length + groupUpdateDryRunResultEntity.secrets.length;
    this.progressService.updateGoals(progressGoal);
    await this.progressService.finishStep(null, true);
    return groupUpdateDryRunResultEntity;
  }

  /**
   * Get the user private key decrypted
   * @returns {Promise<openpgp.PrivateKey>}
   */
  async getPrivateKey() {
    const passphrase = await passphraseController.get(this.worker);
    return GetDecryptedUserPrivateKeyService.getKey(passphrase);
  }

  /**
   * Synchronize the local keyring with the API.
   * @returns {Promise<int>}
   */
  async synchronizeKeys() {
    await this.progressService.finishStep(i18n.t('Synchronizing keys'), true);
    return this.keyring.sync();
  }

  /**
   * Encrypt the needed secrets to complete the group update operation.
   * @param {openpgp.PrivateKey} privateKey The logged in user private key
   * @param {GroupUpdateEntity} groupUpdateDryRunResultEntity The result of the group update simulation
   * @returns {Promise<SecretsCollection>}
   */
  async encryptNeededSecrets(privateKey, groupUpdateDryRunResultEntity) {
    const decryptedSecrets = await this.decryptSecrets(privateKey, groupUpdateDryRunResultEntity.secrets);
    return await this.encryptSecrets(privateKey, groupUpdateDryRunResultEntity.neededSecrets, decryptedSecrets);
  }

  /**
   * Encrypt a collection of needed secrets.
   * @param {openpgp.PrivateKey} privateKey The logged in user private key
   * @param {NeededSecretsCollection} neededSecretsCollection A collection of needed secret
   * @param {Array} decryptedSecrets A collection of decrypted secret [{resourceId: secretDecrypted}, ...]
   * @returns {Promise<SecretsCollection>}
   */
  async encryptSecrets(privateKey, neededSecretsCollection, decryptedSecrets) {
    const secrets = new SecretsCollection([]);
    const items = neededSecretsCollection.items;
    let userId, userPublicArmoredKey, userPublicKey;
    for (const i in items) {
      const neededSecret = items[i];
      const resourceId = neededSecret.resourceId;
      // This check implies that neededSecret are sorted by userId to be the most efficient
      if (userId !== neededSecret.userId) {
        userId = neededSecret.userId;
        userPublicArmoredKey = this.keyring.findPublic(userId).armoredKey;
        userPublicKey = await OpenpgpAssertion.readKeyOrFail(userPublicArmoredKey);
      }
      await this.progressService.finishStep(i18n.t('Encrypting {{counter}}/{{total}}', {counter: i, total: items.length}));
      const secretDto = {
        resource_id: resourceId,
        user_id: userId,
        data: await EncryptMessageService.encrypt(decryptedSecrets[resourceId], userPublicKey, [privateKey])
      };
      const secret = new SecretEntity(secretDto);
      secrets.push(secret);
    }
    return secrets;
  }

  /**
   * Decrypt a collection of secrets
   * @param {openpgp.PrivateKey} privateKey The logged in user private key
   * @param {SecretsCollection} secretsCollection The collection of secrets to decrypt
   * @returns {Promise<[]>} [{resourceId: secretDecrypted}, ...]
   */
  async decryptSecrets(privateKey, secretsCollection) {
    const result = [];
    const items = secretsCollection.items;
    for (const i in items) {
      const secret = items[i];
      const secretMessage = await OpenpgpAssertion.readMessageOrFail(secret.data);
      await this.progressService.finishStep(i18n.t('Decrypting {{counter}}/{{total}}', {counter: i, total: items.length}));
      result[secret.resourceId] = await DecryptMessageService.decrypt(secretMessage, privateKey);
    }
    return result;
  }

  /**
   * Update the group
   * @param {GroupUpdateEntity} groupUpdateEntity The group update entity
   * @returns {Promise<void>}
   */
  async updateGroup(groupUpdateEntity) {
    await this.progressService.finishStep(i18n.t("Updating group"), true);
    await this.groupModel.update(groupUpdateEntity, true);
  }
}

export default GroupsUpdateController;
