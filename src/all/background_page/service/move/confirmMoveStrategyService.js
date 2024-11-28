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
 * @since         4.10.1
 */

class ConfirmMoveStrategyService {
  /**
   * @constructor
   * @param {Worker} worker The worker the sevice
   */
  constructor(worker) {
    this.worker = worker;
  }

  /**
   * Confirm with the user the move strategy
   * @param {string} folderId The folder id to move
   * @param {string} destinationFolderId The destination folder id
   * @return {Promise<boolean>}
   */
  async confirm(destinationFolderId, folderId) {
    const strategy = await this.worker.port.request('passbolt.folders.move-strategy.request', destinationFolderId, [folderId], [], []);
    return strategy.moveOption !== 'keep';
  }
}

export default ConfirmMoveStrategyService;
