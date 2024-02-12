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
 * @since         4.6.0
 */

/**
 * The default TOTP DTO
 * @param {Object} data The data to override
 * @returns {Object}
 */
export const defaultTotpDto = (data = {}) => {
  const defaultData = {
    secret_key: "DAV3DS4ERAAF5QGH",
    period: 30,
    digits: 6,
    algorithm: "SHA1"
  };

  return Object.assign(defaultData, data);
};
