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
const passphraseController = require('../passphrase/passphraseController');
const progressController = require('../progress/progressController');

class ShareFoldersController {
  constructor(worker, requestId) {
    this.worker = worker;
    this.requestId = requestId;
  }

  /**
   * Orchestrate dialogs during the share operation
   *
   * @param {array} folders
   * @param {array} changes
   * @return {Promise}
   */
  async main(folders, changes) {

    console.log(folders);
    console.log(changes);
    let progress = 0;

    // Number of goals is (number of resources * 3) + 1 :
    // why 3: simulate call to the API + encrypting step + share call to the API
    // why +1: this function initialization step
    const progressGoal = folders.length * 3 + 1;

    try {
      let msg = `Sharing ${folders.length} folders`;
      if (folders.length === 1) {
        msg  = `Sharing one folder`;
      }
      await progressController.start(this.worker, msg, progressGoal, 'Initializing...');
      await progressController.update(this.worker, progress++, 'Almost done');

      progressController.complete(this.worker);
      return results;
    } catch(error) {
      console.error(error);
      progressController.complete(this.worker);
      throw error;
    }
  }
}

exports.ShareFoldersController = ShareFoldersController;
