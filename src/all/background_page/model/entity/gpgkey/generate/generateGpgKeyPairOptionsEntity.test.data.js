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
 * @since         3.12.0
 */

export const minimalDto = (data = {}) => {
  const defaultData = {
    name: "Ada Lovelace",
    email: "ada@passbolt.com",
    passphrase: "passphrase"
  };

  return Object.assign(defaultData, data);
};

export const defaultDto = (data = {}) => {
  const defaultData = {
    keySize: 4096,
    type: "rsa",
    date: (new Date()).getTime(),
  };

  return minimalDto(Object.assign(defaultData, data));
};
