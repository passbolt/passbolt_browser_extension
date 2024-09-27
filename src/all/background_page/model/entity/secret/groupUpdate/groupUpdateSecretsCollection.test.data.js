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
 * @since         4.9.3
 */

import {readSecret} from "passbolt-styleguide/src/shared/models/entity/secret/secretEntity.test.data";

/**
 * Build dtos.
 * @param {number} [count=10] The number of dtos.
 * @returns {object}
 */
export const defaultResourcesSecretsDtos = (count = 10) => {
  const dtos = [];
  const resourceId = crypto.randomUUID();
  for (let i = 0; i < count; i++) {
    const groupDto = readSecret({resource_id: resourceId});
    dtos.push(groupDto);
  }
  return dtos;
};

