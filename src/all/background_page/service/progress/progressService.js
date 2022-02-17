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
 * @since         3.6.0
 */

class ProgressService {
  constructor(worker, title) {
    this.worker = worker;
    this.title = title;
    this.progress = 0;
    this.delayDuration = 200;
  }

  /**
   * Set the delay duration used after every call for `start` and `finishStep`.
   * @param {int} delayDuration duration in ms
   */
  setDelayDuration(delayDuration) {
    this.delayDuration = delayDuration;
  }

  /**
   * Start the progression of a task by:
   *  - settings the targetted goal
   *  - opening a progress dialog
   * @param {int} goals
   * @param {string|null} message
   */
  async start(goals, message) {
    this.worker.port.emit('passbolt.progress.open-progress-dialog', this.title, goals, message);
    await this.delay();
  }

  /**
   * Changes the goal count of the current progression
   * @param {int} goals
   * @param {string|null} message
   */
  updateGoals(goals) {
    this.worker.port.emit('passbolt.progress.update-goals', goals);
  }

  /**
   * Updates the progression by `stepFinishedCount`.
   * @param {string|null} message
   */
  async finishStep(message) {
    this.worker.port.emit('passbolt.progress.update', message, ++this.progress);
    await this.delay();
  }

  /**
   * Ends the progression of a task by closing the dialog
   */
  close() {
    this.progress = 0;
    this.worker.port.emit('passbolt.progress.close-progress-dialog');
  }

  /**
   * Wait for the pre-defined amount of time.
   * (the following TODO is taken from the original file as is)
   *
   * TODO
   * Replace by response from progress worker
   */
  delay() {
    return new Promise(resolve => setTimeout(resolve, this.delayDuration));
  }
}

exports.ProgressService = ProgressService;
