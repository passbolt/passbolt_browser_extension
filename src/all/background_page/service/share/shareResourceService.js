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
 * @since         4.10.0
 */

import i18n from "../../sdk/i18n";
import Keyring from "../../model/keyring";
import {OpenpgpAssertion} from "../../utils/openpgp/openpgpAssertions";
import DecryptMessageService from "../crypto/decryptMessageService";
import EncryptMessageService from "../crypto/encryptMessageService";
import ShareService from "../api/share/shareService";
import FindAndUpdateResourcesLocalStorage from "../resource/findAndUpdateResourcesLocalStorageService";
import {
  assertArray,
  assertArrayUUID,
  assertNonEmptyArray,
  assertNonEmptyString,
  assertString,
  assertType
} from "../../utils/assertions";
import DecryptPrivateKeyService from "../crypto/decryptPrivateKeyService";
import PermissionChangesCollection from "../../model/entity/permission/change/permissionChangesCollection";
import ResourceTypeModel from "../../model/resourceType/resourceTypeModel";
import ResourceService from "../api/resource/resourceService";
import ResourceLocalStorage from "../local_storage/resourceLocalStorage";
import EncryptMetadataService from "../metadata/encryptMetadataService";
import GetOrFindResourcesService from "../resource/getOrFindResourcesService";
import FindResourcesService from "../resource/findResourcesService";
import {
  RESOURCE_TYPE_VERSION_5
} from "passbolt-styleguide/src/shared/models/entity/metadata/metadataTypesSettingsEntity";
import ExecuteConcurrentlyService from "../execute/executeConcurrentlyService";
import NeededSecretsCollection from "../../model/entity/secret/needed/neededSecretsCollection";
import SecretsCollection from "../../model/entity/secret/secretsCollection";

export const PROGRESS_STEPS_SHARE_RESOURCES_SHARE_ALL = 8;

class ShareResourceService {
  /**
   * @constructor
   * @param {ApiClientOptions} apiClientOptions The api client options
   * @param {AccountEntity} account The user account
   * @param {ProgressService} progressService The progress service
   */
  constructor(apiClientOptions, account, progressService) {
    this.account = account;
    this.progressService = progressService;
    this.shareService = new ShareService(apiClientOptions);
    this.findResourcesService = new FindResourcesService(account, apiClientOptions);
    this.findAndUpdateResourcesLocalStorage = new FindAndUpdateResourcesLocalStorage(account, apiClientOptions);
    this.resourceTypeModel = new ResourceTypeModel(apiClientOptions);
    this.resourceService = new ResourceService(apiClientOptions);
    this.encryptMetadataService = new EncryptMetadataService(apiClientOptions, account);
    this.getOrFindResourcesService = new GetOrFindResourcesService(account, apiClientOptions);
  }

  /**
   * Share resources.
   *
   * @param {array<string>} resourcesIds The resources ids to share
   * @param {PermissionChangesCollection} permissionChanges The permission changes
   * @param {string} passphrase The user's private key passphrase
   * @returns {Promise<void>}
   * @todo resource ids is not necessary, it can be retrieved from the resources permissions changes
   */
  async shareAll(resourcesIds, permissionChanges, passphrase) {
    assertArray(resourcesIds, 'The parameter "resourcesIds" should be an array');
    assertNonEmptyArray(resourcesIds, 'The parameter "resourcesIds" should be a non empty array');
    assertArrayUUID(resourcesIds, 'The parameter "resourcesIds" should contain only uuid');
    assertType(permissionChanges, PermissionChangesCollection, 'The parameter "permissionChanges" should be of type PermissionChangesCollection');
    assertString(passphrase, 'The parameter "passphrase" should be a string');
    assertNonEmptyString(passphrase, 'The parameter "passphrase" should not be empty');

    const privateKey = await DecryptPrivateKeyService.decryptArmoredKey(this.account.userPrivateArmoredKey, passphrase);
    await this.updatePersonalMetadataToSharedMetadata(resourcesIds, permissionChanges, passphrase);
    const neededSecrets = await this.simulateShare(permissionChanges);
    const secrets = await this.encryptSecrets(neededSecrets, privateKey);
    await this.saveChanges(permissionChanges, secrets);
    /*
     * This could be optimized by refreshing only the resources that have been updated:
     * - Either by having their metadata encrypted with the shared key;
     * - Or for which a permission has been removed for which I could be impacted (lost access or privilege)
     */
    this.progressService.finishStep(i18n.t("Updating resources local storage"), true);
    await this.findAndUpdateResourcesLocalStorage.findAndUpdateAll({}, passphrase);
  }

  /**
   * Returns a collection of V5 resources that needs to have their metadata keys updated to use a shared key.
   * The collection is set from the given resourcesDto and by keeping all resources that are personal.
   * @param {array<string>} resourcesIds The resources ids to share
   * @param {PermissionChangesCollection} permissionChanges The permission changes
   * @param {string} passphrase The user's private key passphrase
   * @return {Promise}
   */
  async updatePersonalMetadataToSharedMetadata(resourcesIds, permissionChanges, passphrase) {
    this.progressService.finishStep(i18n.t("Updating resources metadata"), true);
    const resourcesToUpdate = await this.getOrFindResourcesService.getOrFindByIds(resourcesIds);
    const resourceTypes = await this.resourceTypeModel.getOrFindAll();
    const resourceIdMetadataToShare = permissionChanges.items.filter(permissionChange => !permissionChange.isDeleted)
      .map(permissionChange => permissionChange.acoForeignKey);

    resourceTypes.filterByResourceTypeVersion(RESOURCE_TYPE_VERSION_5);
    resourcesToUpdate.filterByResourceTypes(resourceTypes); // v4 resources have their metadata decrypted.
    resourcesToUpdate.filterOutMetadataNotEncryptedWithUserKey(); // metadata already encrypted with the shared key does not need to be encrypted again with it.
    resourcesToUpdate.filterByPropertyValueIn("id", resourceIdMetadataToShare); // only resources who have a new permissions needs their metadata to be shared.

    if (!resourcesToUpdate.length) {
      return;
    }

    // Encrypt the resources metadata.
    for (const resourceToUpdate of resourcesToUpdate) {
      resourceToUpdate.personal = false;
    }
    await this.encryptMetadataService.encryptAllFromForeignModels(resourcesToUpdate, passphrase);

    // Update the resources.
    const concurrentlyExecutionService = new ExecuteConcurrentlyService();
    let updatingCounter = 0;
    const updateCallbacks = resourceToUpdate => {
      this.progressService.updateStepMessage(i18n.t("Updating resources metadata {{counter}}/{{total}}", {counter: ++updatingCounter, total: resourcesToUpdate.length}));
      return this.resourceService.update(resourceToUpdate.id, resourceToUpdate.toDto(), ResourceLocalStorage.DEFAULT_CONTAIN);
    };
    const callbacks = resourcesToUpdate.items.map(resourceToUpdate => () => updateCallbacks(resourceToUpdate));
    await concurrentlyExecutionService.execute(callbacks, 5);
  }

  /**
   * Simulate the changes to apply to the resources
   * @param {PermissionChangesCollection} permissionChanges The permission changes
   * @returns {Promise<NeededSecretsCollection>}
   * @private
   */
  async simulateShare(permissionChanges) {
    this.progressService.finishStep(i18n.t("Calculating secrets"), true);
    const concurrentlyExecutionService = new ExecuteConcurrentlyService();
    const neededSecretsDto = [];
    const resourceIds = [...new Set(permissionChanges.extract('aco_foreign_key'))];
    let simulatingCounter = 0;


    const shareCallbacks = async resourceId => {
      this.progressService.updateStepMessage(i18n.t("Calculating secrets {{counter}}/{{total}}", {counter: ++simulatingCounter, total: resourceIds.length}));
      const resourcePermissionChanges = permissionChanges.items.filter(permissionChange => permissionChange.acoForeignKey === resourceId);
      const simulateResult = await this.shareService.simulateShareResource(resourceId, resourcePermissionChanges);
      simulateResult.changes.added?.forEach(user => neededSecretsDto.push({resource_id: resourceId, user_id: user.User.id}));
    };
    const callbacks = resourceIds.map(resourceId => () => shareCallbacks(resourceId));
    await concurrentlyExecutionService.execute(callbacks, 5);

    return new NeededSecretsCollection(neededSecretsDto);
  }

  /**
   * Encrypt the needed secrets.
   * @param {NeededSecretsCollection} neededSecrets The needed secrets
   * @param {openpgp.PrivateKey} userPrivateKey The user's private key
   * @returns {SecretsCollection}
   * @private
   */
  async encryptSecrets(neededSecrets, userPrivateKey) {
    if (!neededSecrets.length) {
      return new SecretsCollection([]);
    }

    const secretsDto = [];
    const secretsSerialized = await this.retrieveAndDecryptNeededSecrets(neededSecrets, userPrivateKey);
    const userPublicKeys = await this.retrieveAndReadUserPublicKeys(neededSecrets);
    let encryptingIndex = 0;

    this.progressService.finishStep(i18n.t("Encrypting secrets"), true);
    for (const neededSecret of neededSecrets) {
      this.progressService.updateStepMessage(`Encrypting secrets ${++encryptingIndex}/${neededSecrets.length}`);
      const secretData = await EncryptMessageService.encrypt(
        secretsSerialized[neededSecret.resourceId],
        userPublicKeys[neededSecret.userId],
        [userPrivateKey]
      );
      secretsDto.push({
        ...neededSecret.toDto(),
        data: secretData
      });
    }

    return new SecretsCollection(secretsDto);
  }

  /**
   * Retrieve and decrypt the needed secrets.
   * @param {NeededSecretsCollection} neededSecrets The needed secrets
   * @param {openpgp.PrivateKey} userPrivateKey The user's private key
   * @returns {Promise<object>} Decrypted secrets, organized in an object where the property name represents the resource id,
   * and the value contains the serialized, decrypted secret.
   * @private
   */
  async retrieveAndDecryptNeededSecrets(neededSecrets, userPrivateKey) {
    this.progressService.finishStep(i18n.t("Retrieving secrets"), true);
    const secretsSerialized = [];
    const resourcesIds = [...new Set(neededSecrets.extract("resource_id"))];
    const resources = await this.findResourcesService.findAllByIdsForShare(resourcesIds);

    this.progressService.finishStep(i18n.t("Decrypting secrets"), true);
    let decryptingCounter = 0;
    for (const resource of resources) {
      this.progressService.updateStepMessage(i18n.t("Decrypting secrets {{counter}}/{{total}}", {counter: ++decryptingCounter, total: resources.length}));
      const secretDataMessage = await OpenpgpAssertion.readMessageOrFail(resource.secrets.items[0].data);
      secretsSerialized[resource.id] = await DecryptMessageService.decrypt(secretDataMessage, userPrivateKey);
    }

    return secretsSerialized;
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

    this.progressService.finishStep(i18n.t('Synchronizing keyring'), true);
    await keyring.sync();

    for (const userId of userIds) {
      const userPublicArmoredKey = keyring.findPublic(userId).armoredKey;
      userOpenpgpPublicKeys[userId] = await OpenpgpAssertion.readKeyOrFail(userPublicArmoredKey);
    }

    return userOpenpgpPublicKeys;
  }

  /**
   * Save the permissions changes on the API.
   * @param {PermissionChangesCollection} permissionChanges The permission changes
   * @param {SecretsCollection} secrets The secrets
   * @returns {Promise<void>}
   * @private
   */
  async saveChanges(permissionChanges, secrets) {
    this.progressService.finishStep(i18n.t("Sharing resources"), true);
    const concurrentlyExecutionService = new ExecuteConcurrentlyService();
    const resourcesIds = [...new Set(permissionChanges.extract('aco_foreign_key'))];
    let sharingCounter = 0;

    const shareCallbacks = resourceId => {
      this.progressService.updateStepMessage(i18n.t("Sharing resources {{counter}}/{{total}}", {counter: ++sharingCounter, total: resourcesIds.length}));
      const resourcePermissionChanges = permissionChanges.items.filter(permissionChange => permissionChange.acoForeignKey === resourceId);
      const resourceSecrets = secrets.items.filter(secret => secret.resourceId === resourceId);
      return this.shareService.shareResource(resourceId, {permissions: resourcePermissionChanges, secrets: resourceSecrets});
    };
    const callbacks = resourcesIds.map(resourceId => () => shareCallbacks(resourceId));
    await concurrentlyExecutionService.execute(callbacks, 5);
  }
}

export default ShareResourceService;
