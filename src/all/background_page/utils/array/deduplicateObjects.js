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
 * @version       3.0.4
 */

/**
 * Deduplicate an array of objects.
 * Object which do not have the key property won't be deduplicated and will be return in the result.
 * If multiple occurrences of an object having the same key property are found, the first one will be returned.
 *
 * @param {array} arr The array to deduplicate the objects
 * @param {string} key The key to deduplicate the values for
 * @returns {array<array>}
 */
const deduplicateObjects = (arr, key) => {
  if (!(Array.isArray(arr))) {
    throw new TypeError('deduplicateObjects first parameter should be an array.');
  }
  if (typeof key !== 'string') {
    throw new TypeError('deduplicateObjects second parameter should be a string.');
  }

  // Extract the values to deduplicate in an hashtable.
  const valuesHash = arr
  // Do not add to the hash the object which doesn't have the property.
    .filter(row => Object.prototype.hasOwnProperty.call(row, key))
    .map(row => row[key]);

  /**
   * Deduplicate the values by flipping the hash table.
   * By instance: ["ID-1", "ID-2", "ID-1"] will become ["ID-1": 0, "ID-2": 1]
   */
  const deduplicatedValuesMap = valuesHash.reduce((aggregator, value, index) => {
    aggregator[value] = Object.prototype.hasOwnProperty.call(aggregator, value) ? aggregator[value] : index;
    return aggregator;
  }, {});

  // Deduplicate the array of objects based on the deduplicated values map.
  return arr.filter((row, index) => {
    // Deduplicate only objects which have the property of interest.
    if (Object.prototype.hasOwnProperty.call(row, key)) {
      return deduplicatedValuesMap[row[key]] === index;
    }
    return true;
  });
};

export default deduplicateObjects;
