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
const __ = require('../../sdk/l10n').get;
const {Keyring} = require('../../model/keyring');
const {Share} = require('../../model/share');
const {Crypto} = require('../../model/crypto');
const {User} = require('../../model/user');

const {FolderModel} = require('../../model/folder/folderModel');
const {ResourceEntity} = require('../../model/entity/resource/resourceEntity');
const {ResourceModel} = require('../../model/resource/resourceModel');
const {SecretsCollection}  = require("../../model/entity/secret/secretsCollection");

const passphraseController = require('../passphrase/passphraseController');
const progressController = require('../progress/progressController');

class ResourceCreateController {
  /**
   * ResourceCreateController constructor
   *
   * @param {Worker}worker
   * @param {string} requestId
   * @param {ApiClientOptions} clientOptions
   */
  constructor(worker, requestId, clientOptions) {
    this.worker = worker;
    this.requestId = requestId;
    this.resourceModel = new ResourceModel(clientOptions);
    this.folderModel = new FolderModel(clientOptions);
  }

  /**
   * Create a resource.
   *
   * @param {ResourceEntity} resource The resource data
   * @param {string} password The password to encrypt
   */
  async main(resource, password) {
    const crypto = new Crypto();
    const keyring = new Keyring();
    let privateKey;

    let goals = resource.folderParentId ? 10 : 2; // arbitrarily "more" if parent permission folder
    let progress = 0;

    // Get the passphrase if needed and decrypt secret key
    try {
      let passphrase = await passphraseController.get(this.worker);
      privateKey = await crypto.getAndDecryptPrivateKey(passphrase);
    } catch (error) {
      console.error(error);
      throw error;
    }

    try {
      await progressController.open(this.worker, __('Creating password'), goals, __('Initializing'));
      await progressController.update(this.worker, progress++, __('Encrypting secret'));

      // Encrypt and sign
      const secret = await crypto.encrypt(password, User.getInstance().get().id, privateKey);
      resource.secrets = new SecretsCollection([{data:secret}]);

      // Save
      await progressController.update(this.worker, progress++, __('Creating password'));
      resource = await this.resourceModel.create(resource);

      if (resource.folderParentId) {
        await progressController.update(this.worker, progress++, __('Calculate permissions'));
        // Calculate changes if any
        let destinationFolder = await this.folderModel.findForShare(resource.folderParentId);
        let changes = await this.resourceModel.calculatePermissionsChangesForCreate(resource, destinationFolder);

        // Apply changes
        if (changes.length) {
          goals = (changes.length * 3) + 2 + progress; // closer to reality...
          await progressController.updateGoals(this.worker, goals);

          // Sync keyring
          await progressController.update(this.worker, progress++, __('Synchronizing keys'));
          await keyring.sync();

          // Share
          await progressController.update(this.worker, progress++, __('Start sharing'));
          const resourcesToShare = [resource.toDto({secrets: true})];
          await Share.bulkShareResources(resourcesToShare, changes.toDto(), privateKey, async message => {
            await progressController.update(this.worker, progress++, message);
          });
        }
      }
    } catch (error) {
      console.error(error);
      await progressController.close(this.worker);
      throw error;
    }

    await progressController.update(this.worker, goals, __('Done!'));
    await progressController.close(this.worker);

    return resource;
  }
}

exports.ResourceCreateController = ResourceCreateController;
