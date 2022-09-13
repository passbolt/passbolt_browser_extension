/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         3.7.0
 */

class PublicWebsiteSignInController {
  /**
   * PublicWebsiteSignInController constructor
   * @param {Worker} worker
   * @param {string} requestId uuid
   * @param {AccountEntity} account The account associated to the worker.
   */
  constructor(worker, requestId, account) {
    this.worker = worker;
    this.requestId = requestId;
    this.account = account;
  }

  /**
   * Controller executor.
   * @returns {Promise<void>}
   */
  async _exec() {
    try {
      await this.exec();
      this.worker.port.emit(this.requestId, 'SUCCESS');
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, 'ERROR', error);
    }
  }

  /**
   * Redirect to the passbolt domain url.
   */
  exec() {
    chrome.tabs.update(this.worker.tab.id, {url: this.account.domain});
  }
}

export default PublicWebsiteSignInController;
