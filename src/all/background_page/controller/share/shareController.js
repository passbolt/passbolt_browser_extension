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
const {Keyring} = require('../../model/keyring');
const {Share} = require('../../model/share');
const passphraseController = require('../passphrase/passphraseController');
const progressController = require('../progress/progressController');

class ShareController {
  constructor(worker, requestId) {
    this.worker = worker;
    this.requestId = requestId;
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

    // Number of goals is (number of resources * 3) + 1 :
    // why 3: simulate call to the API + encrypting step + share call to the API
    // why +1: this function initialization step
    const progressGoal = resources.length * 3 + 1;

    try {
      const privateKeySecret = await passphraseController.get(this.worker);
      await progressController.start(this.worker, `Share ${resources.length} passwords`, progressGoal);
      await progressController.update(this.worker, progress++, 'Initialize');
      await keyring.sync();
      await Share.bulkShare(resources, changes, privateKeySecret, message => {
        progressController.update(this.worker, progress++, message);
      });
      const results = resources.map(resource => resource.id);
      progressController.complete(this.worker);
      return results;
    } catch(error) {
      console.error(error);
      progressController.complete(this.worker);
      throw error;
    }
  }
}

exports.ShareController = ShareController;
