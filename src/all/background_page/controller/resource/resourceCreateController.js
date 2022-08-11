/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) Passbolt SARL (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         2.9.0
 */
import {OpenpgpAssertion} from "../../utils/openpgp/openpgpAssertions";
import Keyring from "../../model/keyring";
import EncryptMessageService from "../../service/crypto/encryptMessageService";
import User from "../../model/user";
import ResourceModel from "../../model/resource/resourceModel";
import {PassphraseController as passphraseController} from "../passphrase/passphraseController";
import GetDecryptedUserPrivateKeyService from "../../service/account/getDecryptedUserPrivateKeyService";
import FolderModel from "../../model/folder/folderModel";
import Share from "../../model/share";
import {ProgressController as progressController} from "../progress/progressController";
import ResourceEntity from "../../model/entity/resource/resourceEntity";
import i18n from "../../sdk/i18n";
import ResourceSecretsCollection from "../../model/entity/secret/resource/resourceSecretsCollection";


class ResourceCreateController {
  /**
   * ResourceCreateController constructor
   *
   * @param {Worker} worker
   * @param {string} requestId
   * @param {ApiClientOptions} clientOptions
   */
  constructor(worker, requestId, clientOptions) {
    this.worker = worker;
    this.requestId = requestId;
    this.resourceModel = new ResourceModel(clientOptions);
    this.folderModel = new FolderModel(clientOptions);
    this.keyring = new Keyring();
    this.progress = 0;
    this.goals = 0;
  }

  /**
   * Create a resource.
   *
   * @param {object} resourceDto The resource data
   * @param {string|object} plaintextDto The secret to encrypt
   * @return {Promise<ResourceEntity>} resourceEntity
   */
  async main(resourceDto, plaintextDto) {
    let privateKey;

    /*
     * set default goals, we give arbitrarily "more" goals if a parent permission folder is set
     * as we don't know how many 'share' operations are needed yet
     */
    let resource = new ResourceEntity(resourceDto);
    this.goals = resource.folderParentId ? 10 : 2;

    // Get the passphrase if needed and decrypt secret key
    try {
      const passphrase = await passphraseController.get(this.worker);
      privateKey = await GetDecryptedUserPrivateKeyService.getKey(passphrase);
    } catch (error) {
      console.error(error);
      throw error;
    }

    try {
      await progressController.open(this.worker, i18n.t('Creating password'), this.goals, i18n.t('Initializing'));
      const plaintext = await this.resourceModel.serializePlaintextDto(resource.resourceTypeId, plaintextDto);

      // Encrypt and sign
      await progressController.update(this.worker, this.progress++, i18n.t('Encrypting secret'));
      const userId = User.getInstance().get().id;
      const userPublicArmoredKey = this.keyring.findPublic(userId).armoredKey;
      const userPublicKey = await OpenpgpAssertion.readKeyOrFail(userPublicArmoredKey);
      const secret = await EncryptMessageService.encrypt(plaintext, userPublicKey, [privateKey]);
      resource.secrets = new ResourceSecretsCollection([{data: secret}]);

      // Save
      await progressController.update(this.worker, this.progress++, i18n.t('Creating password'));
      resource = await this.resourceModel.create(resource);

      // Share if needed
      if (resource.folderParentId) {
        await this.handleCreateInFolder(resource, privateKey);
      }
    } catch (error) {
      console.error(error);
      await progressController.close(this.worker);
      throw error;
    }

    await progressController.update(this.worker, this.goals, i18n.t('Done!'));
    await progressController.close(this.worker);

    return resource;
  }

  /**
   * Handle post create operations if resource is created in folder
   * This includes sharing the resource to match the parent folder permissions
   *
   * @param {ResourceEntity} resourceEntity
   * @param {openpgp.PrivateKey} privateKey The user decrypted private key
   * @returns {Promise<void>}
   */
  async handleCreateInFolder(resourceEntity, privateKey) {
    // Calculate changes if any
    await progressController.update(this.worker, this.progress++, i18n.t('Calculate permissions'));
    const destinationFolder = await this.folderModel.findForShare(resourceEntity.folderParentId);
    const changes = await this.resourceModel.calculatePermissionsChangesForCreate(resourceEntity, destinationFolder);

    // Apply changes
    if (changes.length) {
      this.goals = (changes.length * 3) + 2 + this.progress; // closer to reality...
      await progressController.updateGoals(this.worker, this.goals);

      // Sync keyring
      await progressController.update(this.worker, this.progress++, i18n.t('Synchronizing keys'));
      await this.keyring.sync();

      // Share
      await progressController.update(this.worker, this.progress++, i18n.t('Start sharing'));
      const resourcesToShare = [resourceEntity.toDto({secrets: true})];
      await Share.bulkShareResources(resourcesToShare, changes.toDto(), privateKey, async message => {
        await progressController.update(this.worker, this.progress++, message);
      });
      await this.resourceModel.updateLocalStorage();
    }
  }
}

export default ResourceCreateController;
