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
import GetPassphraseService from "../../service/passphrase/getPassphraseService";
import ProgressService from "../../service/progress/progressService";
import {assertNonEmptyArray} from "../../utils/assertions";
import ShareResourceService from "../../service/share/shareResourceService";
import i18n from "../../sdk/i18n";

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
    this.progressService = new ProgressService(this.worker);
    this.shareResourceService = new ShareResourceService(apiClientOptions, account, this.progressService);
    this.getPassphraseService = new GetPassphraseService(account);
  }

  /**
   * Wrapper of exec function to run it with worker.
   *
   * @return {Promise<void>}
   */
  async _exec(resources, changes) {
    try {
      await this.exec(resources, changes);
      this.worker.port.emit(this.requestId, 'SUCCESS');
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, 'ERROR', error);
    }
  }

  /**
   * Orchestrate dialogs during the share operation
   *
   * @param {array} resources
   * @param {array} changes
   * @return {Promise}
   */
  async exec(resources, changes) {
    assertNonEmptyArray(resources, 'resources should be a non empty array');
    assertNonEmptyArray(changes, 'changes should be a non empty array');

    const passphrase = await this.getPassphraseService.getPassphrase(this.worker);

    /*
     * Number of goals is (number of resources * 3) + 1 :
     * why 3: simulate call to the API + encrypting step + share call to the API
     * why +1: this function initialization step
     */
    const progressGoal = resources.length * 3 + 1;

    this.progressService.title = i18n.t("Share {{count}} password", {count: resources.length});
    this.progressService.start(progressGoal, i18n.t('Initialize'));

    try {
      await this.shareResourceService.exec(resources, changes, passphrase);
      this.progressService.finishStep(i18n.t('Done!'), true);
    } finally {
      this.progressService.close();
    }
  }
}

export default ShareResourcesController;
