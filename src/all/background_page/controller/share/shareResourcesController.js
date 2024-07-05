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
import ResourceModel from "../../model/resource/resourceModel";
import GetPassphraseService from "../../service/passphrase/getPassphraseService";
import GetDecryptedUserPrivateKeyService from "../../service/account/getDecryptedUserPrivateKeyService";
import i18n from "../../sdk/i18n";
import ProgressService from "../../service/progress/progressService";
import ShareModel from "../../model/share/shareModel";
import GpgkeyModel from "../../model/gpgKey/gpgkeyModel";

class ShareResourcesController {
  /**
   * ShareResourcesController constructor
   *
   * @param {Worker} worker
   * @param {string} requestId
   * @param {ApiClientOptions} apiClientOptions the api client options
   * @param {AccountEntity} account The account associated to the worker.
   */
  constructor(worker, requestId, apiClientOptions, account) {
    this.worker = worker;
    this.requestId = requestId;
    this.resourceModel = new ResourceModel(apiClientOptions, account);
    this.shareModel = new ShareModel(apiClientOptions);
    this.progressService = new ProgressService(this.worker);
    this.getPassphraseService = new GetPassphraseService(account);
    this.gpgkeyModel = new GpgkeyModel();
  }

  /**
   * Orchestrate dialogs during the share operation
   *
   * @param {array} resources
   * @param {array} changes
   * @return {Promise}
   */
  async main(resources, changes) {
    let privateKey;

    /*
     * Number of goals is (number of resources * 3) + 1 :
     * why 3: simulate call to the API + encrypting step + share call to the API
     * why +1: this function initialization step
     */
    const progressGoal = resources.length * 3 + 1;

    try {
      const passphrase = await this.getPassphraseService.getPassphrase(this.worker);
      privateKey = await GetDecryptedUserPrivateKeyService.getKey(passphrase);
    } catch (error) {
      console.error(error);
      throw error;
    }

    try {
      this.progressService.title = i18n.t("Share {{count}} password", {count: resources.length});
      this.progressService.start(progressGoal, i18n.t('Initialize'));
      const keysToSync = changes.map(change => change.aro_foreign_key);
      await this.progressService.finishStep(i18n.t('Synchronizing keys'), true);
      await this.gpgkeyModel.findGpgKeys(keysToSync);
      await this.shareModel.bulkShareResources(resources, changes, privateKey, async message => {
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
