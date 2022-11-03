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

/*
 * Delay in ms to wait in between 2 progression steps before refreshing the UI.
 */
const STEP_DELAY_MS = 80;

class ProgressService {
  constructor(worker, title) {
    this.worker = worker;
    this._title = title;
    this._progress = 0;
    this.lastTimeCall = null;
    this.message = null;
    this.isClose = false;
    this._updateProgressBar = this._updateProgressBar.bind(this);
  }

  /**
   * Set a new title for the progress dialog.
   * The title is given to the UI only at ProgressService.start(), so, this method needs to be called before.
   * @param {string} title
   */
  set title(title) {
    this._title = title;
  }

  /**
   * Returns the current progression
   * @returns {number}
   */
  get progress() {
    return this._progress;
  }

  /**
   * Start the progression of a task by:
   *  - settings the target goal
   *  - opening a progress dialog
   * @param {int|null} goals The total progress goals
   * @param {string|null} message The initial message to display
   */
  start(goals, message) {
    this._progress = 0;
    this.isClose = false;
    this.worker.port.emit('passbolt.progress.open-progress-dialog', this._title, goals, message);
    this.lastTimeCall = new Date().getTime();
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
   * Updates the progress bar with the latest finished step.
   * @param {string|null} message (Optional) The message to display
   * @param {bool} forceMessageDisplay (Optional) Should the message display be forced. Default false.
   * @return {Promise<void>}
   */
  async finishStep(message, forceMessageDisplay = false) {
    this._progress++;
    this.message = message;
    await this._debounceAction(this._updateProgressBar, forceMessageDisplay);
  }

  /**
   * Ends the progression of a task by closing the dialog
   */
  async close() {
    return new Promise(resolve => {
      this.worker.port.emit('passbolt.progress.close-progress-dialog');
      this.isClose = true;
      setTimeout(resolve, 0);
    });
  }

  /**
   * Sends a message to the UI in order to update it.
   * @private
   */
  _updateProgressBar() {
    this.worker.port.emit('passbolt.progress.update', this.message, this._progress);
  }

  /**
   * Run the given callback if enough time has been spent before last call
   * @param {func} callback the callback to run if the delay is passed
   * @param {boolean} forceCallbackCall if true the callback is called regardless of the delay
   * @private
   */
  async _debounceAction(callback, forceCallbackCall = false) {
    const currentTime = new Date().getTime();
    const deltaTime = currentTime - this.lastTimeCall;
    if (!forceCallbackCall && deltaTime < STEP_DELAY_MS) {
      return;
    }

    this.lastTimeCall = currentTime;
    //@todo use chrome.alarms API instead.
    return new Promise(resolve => setTimeout(() => {
      if (!this.isClose) {
        callback();
      }
      resolve();
    }, 0));
  }
}

export default ProgressService;
