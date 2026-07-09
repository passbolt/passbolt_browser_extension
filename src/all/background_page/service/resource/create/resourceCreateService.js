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

import { OpenpgpAssertion } from "../../../utils/openpgp/openpgpAssertions";
import EncryptMessageService from "../../crypto/encryptMessageService";
import ResourceSecretsCollection from "../../../model/entity/secret/resource/resourceSecretsCollection";
import ResourceEntity from "../../../model/entity/resource/resourceEntity";
import ResourceService from "../../api/resource/resourceService";
import ResourceLocalStorage from "../../local_storage/resourceLocalStorage";
import i18n from "../../../sdk/i18n";
import ResourceModel from "../../../model/resource/resourceModel";
import DecryptPrivateKeyService from "../../crypto/decryptPrivateKeyService";
import EncryptMetadataKeysService from "../../metadata/encryptMetadataService";
import PermissionChangesCollection from "../../../model/entity/permission/change/permissionChangesCollection";
import ShareResourceService, { PROGRESS_STEPS_SHARE_RESOURCES_SHARE_ALL } from "../../share/shareResourceService";
import GetOrFindResourceTypesService from "../../resourceType/getOrFindResourceTypesService";

class ResourceCreateService {
  /**
   *
   * @param {AccountEntity} account The user account
   * @param {ApiClientOptions} apiClientOptions The api client options
   */
  constructor(account, apiClientOptions, progressService) {
    this.account = account;
    this.resourceService = new ResourceService(apiClientOptions);
    this.getOrFindResourceTypesService = new GetOrFindResourceTypesService(account, apiClientOptions);
    this.progressService = progressService;
    this.resourceModel = new ResourceModel(apiClientOptions, this.account);
    this.encryptMetadataKeysService = new EncryptMetadataKeysService(apiClientOptions, this.account);
    this.shareResourceService = new ShareResourceService(apiClientOptions, account, progressService);
  }

  /**
   * Create a resource operator-only, then optionally extend the share with the caller-provided
   * permission changes (spec-mandated safe order: no secret is encrypted for an ARO the caller
   * hasn't confirmed).
   * @param {object} resourceDto The resource data
   * @param {string|object} secretDto The secret to encrypt
   * @param {string} passphrase The user passphrase
   * @param {Array<object>} [permissionChanges] Optional permission changes to apply after create.
   * @return {Promise<ResourceEntity>} resourceEntity
   */
  async create(resourceDto, secretDto, passphrase, permissionChanges) {
    // Port serialization replaces an omitted arg with `null`, sliding past a `= []` default;
    // normalize defensively so the rest of the method can assume an array.
    permissionChanges = permissionChanges ?? [];
    const resource = new ResourceEntity(resourceDto);
    const resourceTypes = await this.getOrFindResourceTypesService.getOrFindAll();
    const resourceType = resourceTypes.getFirstById(resource.resourceTypeId);
    // Keep a copy of the metadata. It will be used after creation on the API, to persist it decrypted into the local storage.
    const resourceMetadata = resource.metadata;
    // Get private key decrypted to encrypt data
    const privateKey = await DecryptPrivateKeyService.decryptArmoredKey(this.account.userPrivateArmoredKey, passphrase);
    this.updateGoals(resourceType.isV5(), permissionChanges.length);
    await this.encryptMetadata(resource, resourceType, passphrase);
    await this.buildAndEncryptUserSecret(resource, secretDto, privateKey);
    const createdResource = await this.save(resource, resourceType);
    // If resource v5, metadata will be returned encrypted, replace it with the original decrypted copy.
    if (resourceType.isV5()) {
      createdResource.metadata = resourceMetadata;
    }
    await ResourceLocalStorage.addResource(createdResource);
    if (permissionChanges.length > 0) {
      // The styleguide can't know the resource id at confirm time so the deltas arrive with
      // aco_foreign_key unset (or null). Stamp the real id before handing them to the share API.
      const stampedChanges = permissionChanges.map((change) => ({ ...change, aco_foreign_key: createdResource.id }));
      await this.shareResourceService.shareAll(
        [createdResource.id],
        new PermissionChangesCollection(stampedChanges),
        passphrase,
      );
    }
    return createdResource;
  }

  /**
   * Save the resource on the API.
   *
   * @param {ResourceEntity} resource The resource
   * @param {ResourceTypeEntity} resourceType The resource type
   * @returns {Promise<ResourceEntity>}
   * @private
   */
  async save(resource, resourceType) {
    await this.progressService.finishStep(i18n.t("Creating resource"), true);

    const resourceDto = resourceType.isV5() ? resource.toDto({ secrets: true }) : resource.toV4Dto({ secrets: true });
    const contain = { permission: true, favorite: true, tags: true, folder: true };
    const newResourceDto = await this.resourceService.create(resourceDto, contain);
    return new ResourceEntity(newResourceDto);
  }

  /**
   * Build and encrypt user secret.
   *
   * @param {ResourceEntity} resource
   * @param {string|object} secretDto
   * @param {openpgp.PrivateKey} privateKey The user private key
   * @returns {Promise}
   * @private
   */
  async buildAndEncryptUserSecret(resource, secretDto, privateKey) {
    const serializedSecret = await this.resourceModel.serializePlaintextDto(resource.resourceTypeId, secretDto);

    // Encrypt and sign
    await this.progressService.finishStep(i18n.t("Encrypting secret"), true);
    const userPublicKey = await OpenpgpAssertion.readKeyOrFail(this.account.userPublicArmoredKey);
    const secret = await EncryptMessageService.encrypt(serializedSecret, userPublicKey, [privateKey]);
    resource.secrets = new ResourceSecretsCollection([{ data: secret }]);
  }

  /**
   * Encrypt resource metadata if v5. The resource is always created as `personal` at this stage —
   * the workflow extends sharing afterwards via `passbolt.share.resources.save`, which re-encrypts
   * the metadata with the shared key when (and only when) the resource actually gets shared.
   * @param {ResourceEntity} resource The resource
   * @param {ResourceTypeEntity} resourceType The resource type
   * @param {string} passphrase The user passphrase
   * @private
   */
  async encryptMetadata(resource, resourceType, passphrase) {
    if (!resourceType.isV5()) {
      return;
    }
    await this.progressService.finishStep(i18n.t("Encrypting Metadata"), true);
    resource.personal = true;
    await this.encryptMetadataKeysService.encryptOneForForeignModel(resource, passphrase);
  }

  /**
   * Update goals
   * @param {boolean} shouldEncryptMetadata if metadata should be encrypted
   * @param {number} permissionChangesLength number of permission changes that will be applied after create
   * @private
   */
  updateGoals(shouldEncryptMetadata, permissionChangesLength = 0) {
    const stepsToCreate = shouldEncryptMetadata ? 4 : 3;
    const shareSteps = permissionChangesLength > 0 ? PROGRESS_STEPS_SHARE_RESOURCES_SHARE_ALL : 0;
    this.progressService.updateGoals(stepsToCreate + shareSteps);
  }
}

export default ResourceCreateService;
