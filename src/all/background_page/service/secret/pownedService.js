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
 * @since         3.9.0
 */

import ExternalServiceUnavailableError from "../../error/externalServiceUnavailableError";
import ExternalServiceError from '../../error/externalServiceError';
import jsSHA from "jssha";

class PownedPasswordService {
  /**
   * Check if password is present inside a dictionnary.
   * @param {string} password The password to check.
   * @returns {boolean}
   * @throw {Error} If the setup url cannot be parsed.
   * @throw {Error} If the domain is not valid.
   */
  static async checkIfPasswordIsPowned(password) {
    const prefixLength = 5;
    const apiUrl = 'https://api.pwnedpasswords.com/range/';
    if (typeof password !== 'string') {
      const err = new Error('Input password must be a string.');
      return Promise.reject(err);
    }

    const shaObj = new jsSHA('SHA-1', 'TEXT');
    shaObj.update(password);
    const hashedPassword = shaObj.getHash('HEX');
    const hashedPasswordPrefix = hashedPassword.substr(0, prefixLength);
    const hashedPasswordSuffix = hashedPassword.substr(prefixLength);
    const url = apiUrl + hashedPasswordPrefix;

    let response;
    try {
      response = await fetch(url);
    } catch (e) {
      throw new ExternalServiceUnavailableError("pwnedpasswords API service is not available");
    }

    if (response.status !== 200) {
      throw new ExternalServiceError(`Failed to request pwnedpasswords API: ${response.status}`);
    }
    const data = await response.text();

    return data
      .split('\n')
      .map(line => line.split(':'))
      .filter(filtered => filtered[0].toLowerCase() === hashedPasswordSuffix)
      .map(mapped => Number(mapped[1]))
      .shift() || 0;
  }
}

export default PownedPasswordService;
