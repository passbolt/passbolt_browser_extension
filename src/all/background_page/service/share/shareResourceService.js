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
import {assertNonEmptyArray} from "../../utils/assertions";
import DecryptPrivateKeyService from "../crypto/decryptPrivateKeyService";
import PermissionChangesCollection from "../../model/entity/permission/change/permissionChangesCollection";
import ResourceTypeModel from "../../model/resourceType/resourceTypeModel";
import DecryptMetadataService from "../metadata/decryptMetadataService";
import ResourceService from "../api/resource/resourceService";
import ResourceEntity from "../../model/entity/resource/resourceEntity";
import ResourceLocalStorage from "../local_storage/resourceLocalStorage";
import EncryptMetadataService from "../metadata/encryptMetadataService";
import GetOrFindResourcesService from "../resource/getOrFindResourcesService";

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
    this.findAndUpdateResourcesLocalStorage = new FindAndUpdateResourcesLocalStorage(account, apiClientOptions);
    this.resourceTypeModel = new ResourceTypeModel(apiClientOptions);
    this.resourceService = new ResourceService(apiClientOptions);
    this.decryptMetadataService = new DecryptMetadataService(apiClientOptions, account);
    this.encryptMetadataService = new EncryptMetadataService(apiClientOptions, account);
    this.getOrFindResourcesService = new GetOrFindResourcesService(account, apiClientOptions);
  }

  /**
   * Proceed with update the permissions of the given resources, given the chagnes to be applied.
   *
   * @param {array<object>} resourcesDto The resources to share
   * @param {array<object>} permissionChangesDto The permission changes
   * @param {string} passphrase The user's private key passphrase
   * @returns {Promise<void>}
   */
  async exec(resourcesDto, permissionChangesDto, passphrase) {
    assertNonEmptyArray(resourcesDto, 'resources should be an non empty array');
    assertNonEmptyArray(permissionChangesDto, 'changes should be an non empty array');

    const privateKey = await DecryptPrivateKeyService.decryptArmoredKey(this.account.userPrivateArmoredKey, passphrase);

    this.progressService.finishStep(i18n.t('Synchronizing keys'), true);
    await (new Keyring()).sync();

    await this.updatePersonalMetadataToSharedMetadata(resourcesDto, passphrase);

    const permissionChanges = new PermissionChangesCollection(permissionChangesDto);
    let requiredSecretsDto = await this.simulateShare(permissionChanges);
    requiredSecretsDto = await this.encryptSecrets(resourcesDto, requiredSecretsDto, privateKey);
    await this.saveChanges(permissionChanges, requiredSecretsDto);

    await this.findAndUpdateResourcesLocalStorage.findAndUpdateAll();
  }

  /**
   * Returns a collection of V5 resources that needs to have their metadata keys updated to use a shared key.
   * The collection is set from the given resourcesDto and by keeping all resources that are personal.
   * @param {ResourcesCollection} resourcesDto
   */
  async updatePersonalMetadataToSharedMetadata(resourcesDto, passphrase) {
    const resourceTypesCollection = await this.resourceTypeModel.getOrFindAll();

    const resourcesCollection = await this.getOrFindResourcesService.getOrFindByIds(resourcesDto.map(r => r.id));
    resourcesCollection.filterByCallback(resource => {
      const resourceType = resourceTypesCollection.getFirstById(resource.resourceTypeId);
      return resource.isPersonal() && resourceType.isV5();
    });

    const collectionLength = resourcesCollection.length;
    if (collectionLength === 0) {
      return;
    }

    this.progressService.updateGoals(this.progressService.goals + collectionLength);

    for (let i = 0; i < collectionLength; i++) {
      this.progressService.finishStep(i18n.t('Updating resources metadata {{counter}}/{{total}}', {counter: i + 1, total: collectionLength}));
      const resource = resourcesCollection.items[i];
      const decryptedMetadata = resource.metadata;

      //enforce personal property to `false` for the encrypting service to use the shared metadata key instead of the user's private key.
      resource.personal = false;
      await this.encryptMetadataService.encryptOneForForeignModel(resource, passphrase);

      const updatedResourceDto = await this.resourceService.update(resource.id, resource.toDto(), ResourceLocalStorage.DEFAULT_CONTAIN);
      const updatedResourceEntity = new ResourceEntity(updatedResourceDto);

      updatedResourceEntity.metadata = decryptedMetadata;
      await ResourceLocalStorage.updateResource(updatedResourceEntity);
    }
  }

  /**
   * Simulate the changes to apply to the resources
   * @param {PermissionChangesCollection} permissionChanges The permission changes
   * @returns {Promise<array>} required secrets dto
   * @private
   */
  async simulateShare(permissionChanges) {
    const requiredSecretsDto = [];
    const resourceIds = [...new Set(permissionChanges.extract('aco_foreign_key'))];
    let counter = 0;

    for (const resourceId of resourceIds) {
      this.progressService.finishStep(`Calculating resource permissions ${++counter}/${resourceIds.length}`);
      const resourcePermissionChanges = permissionChanges.items.filter(permissionChange => permissionChange.acoForeignKey === resourceId);
      const simulateResult = await this.shareService.simulateShareResource(resourceId, resourcePermissionChanges);
      simulateResult.changes.added?.forEach(user => requiredSecretsDto.push({resource_id: resourceId, user_id: user.User.id}));
    }

    return requiredSecretsDto;
  }

  /**
   * Encrypt the resources secrets for all the new users
   * @param {array} resourcesDto The resources to share
   * @param {array} requiredSecretsDto The required secrets
   * @param {openpgp.PrivateKey} privateKey The decrypted private key to use to decrypt the message.
   * @returns {object} secrets collection dto
   * @private
   */
  async encryptSecrets(resourcesDto, requiredSecretsDto, privateKey) {
    const keyring = new Keyring();
    const secretsDataSerialized = {};
    const usersPublicKeys = {};
    let counter = 0;

    for (const requiredSecretDto of requiredSecretsDto) {
      this.progressService.finishStep(`Encrypting resource secret ${++counter}/${requiredSecretsDto.length}`);
      if (!secretsDataSerialized[requiredSecretDto.resource_id]) {
        const resourceDto = resourcesDto.find(resource => resource.id === requiredSecretDto.resource_id);
        const secretDataMessage = await OpenpgpAssertion.readMessageOrFail(resourceDto.secrets[0].data);
        secretsDataSerialized[requiredSecretDto.resource_id] = await DecryptMessageService.decrypt(secretDataMessage, privateKey);
      }
      if (!usersPublicKeys[requiredSecretDto.user_id]) {
        const userPublicArmoredKey = keyring.findPublic(requiredSecretDto.user_id).armoredKey;
        usersPublicKeys[requiredSecretDto.user_id] = await OpenpgpAssertion.readKeyOrFail(userPublicArmoredKey);
      }
      requiredSecretDto.data = await EncryptMessageService.encrypt(
        secretsDataSerialized[requiredSecretDto.resource_id],
        usersPublicKeys[requiredSecretDto.user_id],
        [privateKey]
      );
    }

    return requiredSecretsDto;
  }

  /**
   * Save the permissions changes on the API.
   * @param {array} resources The resources to share
   * @param {PermissionChangesCollection} permissionChanges The permission changes
   * @param {array} requiredSecretsDto The resources secrets
   * @returns {Promise<void>}
   */
  async saveChanges(permissionChanges, requiredSecretsDto) {
    const resourceIds = [...new Set(permissionChanges.extract('aco_foreign_key'))];

    let counter = 0;
    for (const resourceId of resourceIds) {
      this.progressService.finishStep(`Sharing resource ${++counter}/${resourceIds.length}`);
      const resourcePermissionChanges = permissionChanges.items.filter(permissionChange => permissionChange.acoForeignKey === resourceId);
      const secretsDto = requiredSecretsDto.filter(requiredSecretDto => requiredSecretDto.resource_id === resourceId);
      await this.shareService.shareResource(resourceId, {permissions: resourcePermissionChanges, secrets: secretsDto});
    }
  }
}

export default ShareResourceService;
