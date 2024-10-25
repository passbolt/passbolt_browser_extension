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
 * @since         4.9.4
 */

import ResourceEntity from "../../../model/entity/resource/resourceEntity";
import ResourceService from "../../api/resource/resourceService";
import ResourceLocalStorage from "../../local_storage/resourceLocalStorage";
import i18n from "../../../sdk/i18n";
import ResourceModel from "../../../model/resource/resourceModel";
import DecryptPrivateKeyService from "../../crypto/decryptPrivateKeyService";
import UserModel from "../../../model/user/userModel";
import Keyring from "../../../model/keyring";
import {OpenpgpAssertion} from "../../../utils/openpgp/openpgpAssertions";
import EncryptMessageService from "../../crypto/encryptMessageService";
import ResourceSecretsCollection from "../../../model/entity/secret/resource/resourceSecretsCollection";
import EncryptMetadataKeysService from "../../metadata/encryptMetadataService";
import ResourceTypeModel from "../../../model/resourceType/resourceTypeModel";

class ResourceUpdateService {
  /**
   *
   * @param {AccountEntity} account The user account
   * @param {ApiClientOptions} apiClientOptions The api client options
   * @param {ProgressService} progressService The progress service
   */
  constructor(account, apiClientOptions, progressService) {
    this.account = account;
    this.resourceService = new ResourceService(apiClientOptions);
    this.resourceTypeModel = new ResourceTypeModel(apiClientOptions);
    this.progressService = progressService;
    this.resourceModel = new ResourceModel(apiClientOptions);
    this.encryptMetadataKeysService = new EncryptMetadataKeysService(apiClientOptions, this.account);
    this.userModel = new UserModel(apiClientOptions);
    this.keyring = new Keyring();
  }

  /**
   * Create a resource.
   *
   * @param {object} resourceDto The resource data
   * @param {string|object} plaintextDto The secret to encrypt
   * @param {string} passphrase The user passphrase
   * @return {Promise<ResourceEntity>} resourceEntity
   */
  async exec(resourceDto, plaintextDto, passphrase) {
    const resourceEntity = new ResourceEntity(resourceDto);
    const resourceTypesCollection = await this.resourceTypeModel.getOrFindAll();
    const resourceTypeEntity = resourceTypesCollection.getFirstById(resourceEntity.resourceTypeId);
    // Get users ids of those who have access to the resource
    const usersIds = await this.userModel.findAllIdsForResourceUpdate(resourceEntity.id);
    // Set personal property
    resourceEntity.personal = usersIds.length === 1;
    // Set goals
    const goals = this.calculateGoals(plaintextDto, resourceTypeEntity, usersIds.length);
    this.progressService.updateGoals(goals);
    // Keep metadata decrypted to update it in the local storage
    const metadataDecrypted = resourceEntity.metadata;
    if (resourceTypeEntity.isV5()) {
      // Encrypt metadata
      await this.progressService.finishStep(i18n.t("Encrypting Metadata"), true);
      await this.encryptMetadataKeysService.encryptOneForForeignModel(resourceEntity, passphrase);
    }
    if (plaintextDto !== null) {
      // Update secret
      await this.updateSecret(resourceEntity, plaintextDto, passphrase, usersIds);
    }
    // Update resource
    return this.update(resourceEntity, resourceTypeEntity, metadataDecrypted);
  }

  /**
   * Update associated secret
   *
   * @param {ResourceEntity} resourceEntity
   * @param {string|object} plaintextDto
   * @param {string} passphrase The user passphrase
   * @param {Array<string>} usersIds The users ids
   * @returns {Promise<Object>} updated resource
   */
  async updateSecret(resourceEntity, plaintextDto, passphrase, usersIds) {
    // Get the passphrase if needed and decrypt secret key
    const privateKey = await DecryptPrivateKeyService.decryptArmoredKey(this.account.userPrivateArmoredKey, passphrase);

    // Sync keyring
    await this.progressService.finishStep(i18n.t("Synchronizing keyring"), true);
    await this.keyring.sync();

    // Encrypt
    const plaintext = await this.resourceModel.serializePlaintextDto(resourceEntity.resourceTypeId, plaintextDto);
    resourceEntity.secrets = await this.encryptSecrets(plaintext, usersIds, privateKey);
  }

  /**
   * Update a resource using Passbolt API and add result to local storage
   *
   * @param {ResourceEntity} resourceEntity
   * @param {ResourceTypeEntity} resourceTypeEntity The resource type
   * @param {ResourceMetadataEntity} metadataDecrypted The metadata decrypted
   * @returns {Promise<ResourceEntity>}
   * @private
   */
  async update(resourceEntity, resourceTypeEntity, metadataDecrypted) {
    // Post data & wrap up
    await this.progressService.finishStep(i18n.t("Saving resource"), true);
    const data = resourceTypeEntity.isV5() ? resourceEntity.toDto({secrets: true}) : resourceEntity.toV4Dto({secrets: true});
    const resourceDto = await this.resourceService.update(resourceEntity.id, data, ResourceLocalStorage.DEFAULT_CONTAIN);
    const updatedResourceEntity = new ResourceEntity(resourceDto);
    // If resource v5, metadata will be returned encrypted, replace it with the original decrypted copy.
    if (!updatedResourceEntity.isMetadataDecrypted()) {
      updatedResourceEntity.metadata = metadataDecrypted;
    }
    await ResourceLocalStorage.updateResource(updatedResourceEntity);

    return updatedResourceEntity;
  }

  /**
   * Encrypt and sign plaintext data for the given users
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
        const userPublicArmoredKey = this.keyring.findPublic(userId).armoredKey;
        const userPublicKey = await OpenpgpAssertion.readKeyOrFail(userPublicArmoredKey);
        const data = await EncryptMessageService.encrypt(plaintextDto, userPublicKey, [privateKey]);
        secrets.push({user_id: userId, data: data});
        await this.progressService.finishStep(i18n.t("Encrypting Secret"), true);
      }
    }
    return new ResourceSecretsCollection(secrets);
  }

  /**
   * Calculate goals
   * @param {string|object} plaintextDto The secret to encrypt
   * @param {ResourceTypeEntity} resourceType The resource type
   * @param {number} usersLength The number of users
   * @returns {number}
   */
  calculateGoals(plaintextDto, resourceType, usersLength) {
    if (resourceType.isV5()) {
      // encrypt metadata + save + done or encrypt secret * users + encrypt metadata + keyring sync + save + done
      return plaintextDto === null ? 3 : usersLength + 4;
    } else if (resourceType.isV4()) {
      // save + done or encrypt secret * users + keyring sync + save + done
      return plaintextDto === null ? 2 : usersLength + 3;
    }
  }
}

export default ResourceUpdateService;
