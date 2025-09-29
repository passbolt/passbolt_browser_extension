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
 * @since         4.10.1
 */
import {OpenpgpAssertion} from "../../utils/openpgp/openpgpAssertions";
import Keyring from "../../model/keyring";
import EncryptMessageService from "../../service/crypto/encryptMessageService";
import DecryptMessageService from "../../service/crypto/decryptMessageService";
import GroupModel from "../../model/group/groupModel";
import GroupEntity from "../../model/entity/group/groupEntity";
import GroupUpdateEntity from "../../model/entity/group/update/groupUpdateEntity";
import i18n from "../../sdk/i18n";
import SecretEntity from "../../model/entity/secret/secretEntity";
import GroupUpdateSecretsCollection from "../../model/entity/secret/groupUpdate/groupUpdateSecretsCollection";
import DecryptPrivateKeyService from "../crypto/decryptPrivateKeyService";
import {assertString, assertType} from "../../utils/assertions";
import GroupUpdatesCollection from "../../model/entity/group/update/groupUpdatesCollection";
import GroupLocalStorage from "../local_storage/groupLocalStorage";
import GroupService from "../api/group/groupService";

/**
 * Progress goals are:
 * - Initialize
 * - Group update feasibility check (dry-run)
 * - Encrypt required secrets for new users
 * - Synchronizing keyring
 * - Updating group
 * - Done
 */
const PROGRESS_GOAL = 6;

class GroupUpdateService {
  /**
   * @constructor
   * @param {ApiClientOptions} apiClientOptions
   * @param {AccountEntity} account
   * @param {ProgressService} progressService
   */
  constructor(apiClientOptions, account, progressService) {
    this.apiClientOptions = apiClientOptions;
    this.account = account;
    this.progressService = progressService;
    this.groupModel = new GroupModel(apiClientOptions);
    this.groupService = new GroupService(apiClientOptions);
    this.decryptPrivateKeyService = new DecryptPrivateKeyService();
  }

  /**
   * Orchestrate dialogs during the share operation
   *
   * @param {GroupEntity} updatedGroupEntity
   */
  async exec(updatedGroupEntity, passphrase) {
    assertType(updatedGroupEntity, GroupEntity);
    assertString(passphrase);

    const originalGroupEntity = await this.groupModel.getById(updatedGroupEntity.id);
    const groupUpdateEntity = GroupUpdateEntity.createFromGroupsDiff(originalGroupEntity, updatedGroupEntity);

    this.progressService.start(PROGRESS_GOAL, i18n.t('Initialize'));

    const groupUpdateDryRunResultEntity = await this.simulateUpdateGroup(groupUpdateEntity);
    const shouldEncryptSecrets = groupUpdateDryRunResultEntity.neededSecrets.length > 0;
    if (shouldEncryptSecrets) {
      groupUpdateEntity.secrets = await this.encryptNeededSecrets(passphrase, groupUpdateDryRunResultEntity);
    } else {
      // skipped steps are: "Encrypt required secrets for new users", "Synchronizing keyring"
      this.progressService.finishSteps(2);
    }

    await this.updateGroup(groupUpdateEntity);
    this.progressService.finishStep(i18n.t("Done"), true);
  }

  /**
   * Simulate group update operation
   * @param {GroupUpdateEntity} groupUpdateEntity The group update entity
   * @returns {Promise<GroupUpdateDryRunResult>}
   * @private
   */
  async simulateUpdateGroup(groupUpdateEntity) {
    this.progressService.finishStep(i18n.t("Group update feasibility check"), true);
    return await this.groupModel.updateDryRun(groupUpdateEntity);
  }

  /**
   * Encrypt the needed secrets to complete the group update operation if necessary.
   * @param {string} passphrase the current user's private key passphrase
   * @param {GroupUpdateEntity} groupUpdateDryRunResultEntity The result of the group update simulation
   * @returns {Promise<GroupUpdateSecretsCollection | null>}
   * @private
   */
  async encryptNeededSecrets(passphrase, groupUpdateDryRunResultEntity) {
    this.progressService.finishStep(i18n.t("Encrypt required secrets for new users"), true);
    const privateKey = await DecryptPrivateKeyService.decryptArmoredKey(this.account.userPrivateArmoredKey, passphrase);
    const decryptedSecrets = await this.decryptSecrets(privateKey, groupUpdateDryRunResultEntity.secrets);
    return await this.encryptSecrets(privateKey, groupUpdateDryRunResultEntity.neededSecrets, decryptedSecrets);
  }

  /**
   * Encrypt a collection of needed secrets.
   * @param {openpgp.PrivateKey} privateKey The logged in user private key
   * @param {NeededSecretsCollection} neededSecretsCollection A collection of needed secret
   * @param {Array} decryptedSecrets A collection of decrypted secret [{resourceId: secretDecrypted}, ...]
   * @returns {Promise<GroupUpdateSecretsCollection>}
   * @private
   */
  async encryptSecrets(privateKey, neededSecretsCollection, decryptedSecrets) {
    const groupUpdateSecrets = new GroupUpdateSecretsCollection([]);

    this.progressService.finishStep(i18n.t('Synchronizing keyring'), true);
    const usersPublicKeys = await this.retrieveAndReadUserPublicKeys(neededSecretsCollection);

    const collectionLength = neededSecretsCollection.length;
    for (let i = 0; i < collectionLength; i++) {
      const neededSecret = neededSecretsCollection.items[i];
      const user_id = neededSecret.userId;
      const resource_id = neededSecret.resourceId;

      await this.progressService.updateStepMessage(i18n.t('Encrypting {{counter}}/{{total}}', {counter: i + 1, total: collectionLength}));
      const data = await EncryptMessageService.encrypt(decryptedSecrets[resource_id], usersPublicKeys[user_id], [privateKey]);

      const secret = new SecretEntity({resource_id, user_id, data});
      groupUpdateSecrets.push(secret);
    }

    return groupUpdateSecrets;
  }

  /**
   * Decrypt a collection of secrets
   * @param {openpgp.PrivateKey} privateKey The logged in user private key
   * @param {GroupUpdateSecretsCollection} secretsCollection The collection of secrets to decrypt
   * @returns {Promise<[]>} [{resourceId: secretDecrypted}, ...]
   * @private
   */
  async decryptSecrets(privateKey, secretsCollection) {
    const result = [];

    const collectionLength = secretsCollection.length;
    for (let i = 0; i < collectionLength; i++) {
      const secret = secretsCollection.items[i];
      const secretMessage = await OpenpgpAssertion.readMessageOrFail(secret.data);

      this.progressService.updateStepMessage(i18n.t('Decrypting {{counter}}/{{total}}', {counter: i + 1, total: collectionLength}));
      result[secret.resourceId] = await DecryptMessageService.decrypt(secretMessage, privateKey);
    }

    return result;
  }

  /**
   * Update the group
   * @param {GroupUpdateEntity} groupUpdateEntity The group update entity
   * @returns {Promise<void>}
   * @private
   */
  async updateGroup(groupUpdateEntity) {
    this.progressService.finishStep(i18n.t("Updating group"), true);
    const groupUpdateSingleOperationList = GroupUpdatesCollection.createFromGroupUpdateEntity(groupUpdateEntity);
    const operationCount = groupUpdateSingleOperationList.length;

    for (let i = 0; i < operationCount; i++) {
      const progressMessage = i === 0
        ? i18n.t("Updating group metadata") //first operation is always the group name update, guaranteed by `createFromGroupUpdateEntity`
        : i18n.t("Updating group member {{counter}}/{{total}}", {counter: i, total: operationCount - 1});

      this.progressService.updateStepMessage(progressMessage);
      const groupUpdateOperation = groupUpdateSingleOperationList.items[i];
      const groupDto = await this.groupService.update(groupUpdateOperation.id, groupUpdateOperation.toDto());
      const updatedGroupEntity = new GroupEntity(groupDto, {ignoreInvalidEntity: true});
      await GroupLocalStorage.updateGroup(updatedGroupEntity);
    }
  }

  /**
   * Retrieve and read the user public keys.
   * @param {NeededSecretsCollection} neededSecrets The needed secrets
   * @returns {Promise<object>} User public key organized in an object where the property name represents the user id,
   * and the value contains the user openpgp public key.
   * @private
   */
  async retrieveAndReadUserPublicKeys(neededSecrets) {
    const userOpenpgpPublicKeys = {};
    const userIds = [...new Set(neededSecrets.extract("user_id"))];
    const keyring = new Keyring();

    await keyring.sync();

    for (const userId of userIds) {
      const userPublicArmoredKey = keyring.findPublic(userId).armoredKey;
      userOpenpgpPublicKeys[userId] = await OpenpgpAssertion.readKeyOrFail(userPublicArmoredKey);
    }

    return userOpenpgpPublicKeys;
  }
}

export default GroupUpdateService;
