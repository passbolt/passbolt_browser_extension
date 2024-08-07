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
 * @since         4.10.0
 */
import {v4 as uuidv4} from "uuid";

/**
 * Build minimal resource metadata dto.
 * @param {object} data The data to override the default dto.
 * @returns {object}
 */
export const minimalResourceMetadataDto = (data = {}) => {
  const metadataDto = {
    name: "Passbolt",
    ...data
  };
  return metadataDto;
};

/**
 * Build default resource metadata dto.
 * @param {object} data The data to override the default dto.
 * @returns {object}
 */
export const defaultResourceMetadataDto = (data = {}) => {
  const metadataDto = {
    resource_type_id: data?.resource_type_id || uuidv4(),
    name: "Passbolt",
    username: "admin@passbolt.com",
    uris: ["https://passbolt.com", "https://m.passbolt.com", "https://secure.passbolt.com"],
    description: "Description",
    ...data
  };
  return metadataDto;
};
