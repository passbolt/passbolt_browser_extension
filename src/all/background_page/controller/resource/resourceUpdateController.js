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
import Keyring from "../../model/keyring";
import EncryptMessageService from "../../service/crypto/encryptMessageService";
import ResourceModel from "../../model/resource/resourceModel";
import {PassphraseController as passphraseController} from "../passphrase/passphraseController";
import GetDecryptedUserPrivateKeyService from "../../service/account/getDecryptedUserPrivateKeyService";
import UserModel from "../../model/user/userModel";
import ResourceEntity from "../../model/entity/resource/resourceEntity";
import i18n from "../../sdk/i18n";
import ResourceSecretsCollection from "../../model/entity/secret/resource/resourceSecretsCollection";
import {OpenpgpAssertion} from "../../utils/openpgp/openpgpAssertions";
import ProgressService from "../../service/progress/progressService";

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
    this.progressService = new ProgressService(this.worker, i18n.t("Updating password"));
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
    this.progressService.start(1, i18n.t("Updating password"));
    const updatedResource = await this.resourceModel.update(resourceEntity);
    await this.progressService.finishStep(i18n.t("Done!"), true);
    await this.progressService.close();
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
      this.progressService.start(4, i18n.t("Updating password"));
      const usersIds = await this.userModel.findAllIdsForResourceUpdate(resourceEntity.id);
      const goals = usersIds.length + 3; // encrypt * users + keyring sync + save + done
      this.progressService.updateGoals(goals);

      // Sync keyring
      await this.progressService.finishStep(i18n.t("Synchronizing keyring"), true);
      await this.keyring.sync();

      // Encrypt
      const plaintext = await this.resourceModel.serializePlaintextDto(resourceEntity.resourceTypeId, plaintextDto);
      resourceEntity.secrets = await this.encryptSecrets(plaintext, usersIds, privateKey);

      // Post data & wrap up
      await this.progressService.finishStep(i18n.t("Saving resource"), true);
      const updatedResource = await this.resourceModel.update(resourceEntity);
      await this.progressService.finishStep(i18n.t("Done!"), true);
      await this.progressService.close();
      return updatedResource;
    } catch (error) {
      await this.progressService.close();
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
        const userPublicArmoredKey = this.keyring.findPublic(userId).armoredKey;
        const userPublicKey = await OpenpgpAssertion.readKeyOrFail(userPublicArmoredKey);
        const data = await EncryptMessageService.encrypt(plaintextDto, userPublicKey, [privateKey]);
        secrets.push({user_id: userId, data: data});
        await this.progressService.finishStep(i18n.t("Encrypting"), true);
      }
    }
    return new ResourceSecretsCollection(secrets);
  }
}

export default ResourceUpdateController;
