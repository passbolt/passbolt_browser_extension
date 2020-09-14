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
 * @since         2.8.0
 */
const __ = require('../../sdk/l10n').get;
const {Crypto} = require('../../model/crypto');
const {Keyring} = require('../../model/keyring');
const {Share} = require('../../model/share');
const {ResourceModel} = require('../../model/resource/resourceModel');
const passphraseController = require('../passphrase/passphraseController');
const progressController = require('../progress/progressController');

class ShareResourcesController {
  /**
   * MoveController constructor
   *
   * @param {Worker} worker
   * @param {string} requestId
   * @param {ApiClientOptions} clientOptions
   */
  constructor(worker, requestId, clientOptions) {
    this.worker = worker;
    this.requestId = requestId;
    this.clientOptions = clientOptions;
    this.resourceModel = new ResourceModel(clientOptions);
  }

  /**
   * Orchestrate dialogs during the share operation
   *
   * @param {array} resources
   * @param {array} changes
   * @return {Promise}
   */
  async main(resources, changes) {
    const keyring = new Keyring();
    const crypto = new Crypto(keyring);

    let progress = 0;
    let privateKey;

    // Number of goals is (number of resources * 3) + 1 :
    // why 3: simulate call to the API + encrypting step + share call to the API
    // why +1: this function initialization step
    const progressGoal = resources.length * 3 + 1;

    try {
      let passphrase = await passphraseController.get(this.worker);
      privateKey = await crypto.getAndDecryptPrivateKey(passphrase);
    } catch (error) {
      console.error(error);
      throw error;
    }

    try {
      let msg = `Share ${resources.length} passwords`;
      if (resources.length === 1) {
        msg  = `Share one password`;
      }
      await progressController.open(this.worker, msg, progressGoal, __('Initialize'));
      await progressController.update(this.worker, progress++, __('Synchronizing keys'));
      await keyring.sync();
      await Share.bulkShareResources(resources, changes, privateKey, async message => {
        await progressController.update(this.worker, progress++, message);
      });
      await this.resourceModel.updateLocalStorage();
      const results = resources.map(resource => resource.id);
      await progressController.update(this.worker, progressGoal, __('Done!'));
      await progressController.close(this.worker);
      return results;
    } catch(error) {
      console.error(error);
      await progressController.close(this.worker);
      throw error;
    }
  }
}

exports.ShareResourcesController = ShareResourcesController;
