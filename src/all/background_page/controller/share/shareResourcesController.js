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
import Keyring from "../../model/keyring";
import ResourceModel from "../../model/resource/resourceModel";
import {PassphraseController as passphraseController} from "../passphrase/passphraseController";
import GetDecryptedUserPrivateKeyService from "../../service/account/getDecryptedUserPrivateKeyService";
import Share from "../../model/share";
import {ProgressController as progressController} from "../progress/progressController";
import i18n from "../../sdk/i18n";

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

    let progress = 0;
    let privateKey;

    /*
     * Number of goals is (number of resources * 3) + 1 :
     * why 3: simulate call to the API + encrypting step + share call to the API
     * why +1: this function initialization step
     */
    const progressGoal = resources.length * 3 + 1;

    try {
      const passphrase = await passphraseController.get(this.worker);
      privateKey = await GetDecryptedUserPrivateKeyService.getKey(passphrase);
    } catch (error) {
      console.error(error);
      throw error;
    }

    try {
      let msg = `Share ${resources.length} passwords`;
      if (resources.length === 1) {
        msg  = `Share one password`;
      }
      await progressController.open(this.worker, msg, progressGoal, i18n.t('Initialize'));
      await progressController.update(this.worker, progress++, i18n.t('Synchronizing keys'));
      await keyring.sync();
      await Share.bulkShareResources(resources, changes, privateKey, async message => {
        await progressController.update(this.worker, progress++, message);
      });
      await this.resourceModel.updateLocalStorage();
      const results = resources.map(resource => resource.id);
      await progressController.update(this.worker, progressGoal, i18n.t('Done!'));
      await progressController.close(this.worker);
      return results;
    } catch (error) {
      console.error(error);
      await progressController.close(this.worker);
      throw error;
    }
  }
}

export default ShareResourcesController;
