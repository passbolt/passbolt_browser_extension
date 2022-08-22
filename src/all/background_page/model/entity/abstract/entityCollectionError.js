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
 * @since         2.13.0
 */
class EntityCollectionError extends Error {
  /**
   * EntityCollectionError
   * Allow to flag an error in a collection
   *
   * @param {number} position
   * @param {string} rule
   * @param {string} [message] optional
   */
  constructor(position, rule, message) {
    message = message || 'Entity collection error.';
    super(message);
    if (typeof position !== 'number') {
      throw new TypeError('EntityCollectionError requires a valid position');
    }
    if (!rule || typeof rule !== 'string') {
      throw new TypeError('EntityCollectionError requires a valid rule');
    }
    if (!message || typeof message !== 'string') {
      throw new TypeError('EntityCollectionError requires a valid rule');
    }
    this.position = position;
    this.rule = rule;
  }
}

export default EntityCollectionError;
