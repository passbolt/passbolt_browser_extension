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
import i18n from "../../sdk/i18n";
import ProgressService from "../../service/progress/progressService";

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
    this.progressService = new ProgressService(this.worker);
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
      this.progressService.title = i18n.t("Share {{count}} password", {count: resources.length});
      this.progressService.start(progressGoal, i18n.t('Initialize'));
      await this.progressService.finishStep(i18n.t('Synchronizing keys'), true);
      await keyring.sync();
      await Share.bulkShareResources(resources, changes, privateKey, async message => {
        await this.progressService.finishStep(message);
      });
      await this.resourceModel.updateLocalStorage();
      const results = resources.map(resource => resource.id);
      await this.progressService.finishStep(i18n.t('Done!'), true);
      await this.progressService.close();
      return results;
    } catch (error) {
      console.error(error);
      await this.progressService.close();
      throw error;
    }
  }
}

export default ShareResourcesController;
