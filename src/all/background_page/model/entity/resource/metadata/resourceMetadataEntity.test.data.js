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
import {
  TEST_RESOURCE_TYPE_PASSWORD_AND_DESCRIPTION
} from "passbolt-styleguide/src/shared/models/entity/resourceType/resourceTypeEntity.test.data";

/**
 * Build minimal resource metadata dto.
 * @param {object} data The data to override the default dto.
 * @returns {object}
 */
export const minimalResourceMetadataDto = (data = {}) => {
  const metadataDto = {
    name: "Passbolt",
    resource_type_id: data?.resource_type_id || TEST_RESOURCE_TYPE_PASSWORD_AND_DESCRIPTION,
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
    resource_type_id: data?.resource_type_id || TEST_RESOURCE_TYPE_PASSWORD_AND_DESCRIPTION,
    name: "Passbolt",
    username: "admin@passbolt.com",
    uris: ["https://passbolt.com", "https://m.passbolt.com", "https://secure.passbolt.com"],
    description: "Description",
    ...data
  };
  return metadataDto;
};
