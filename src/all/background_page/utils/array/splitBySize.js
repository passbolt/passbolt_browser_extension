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
 */

/**
 * Split an array in chunks
 * @param {array} arr The array to split
 * @param {int} size The size of the chunk
 * @returns {array<array>}
 */
const splitBySize = (arr, size) => arr.reduce((chunks, el, i) => {
  if (i % size) {
    chunks[chunks.length - 1].push(el);
  } else {
    chunks.push([el]);
  }
  return chunks;
}, []);

export default splitBySize;
