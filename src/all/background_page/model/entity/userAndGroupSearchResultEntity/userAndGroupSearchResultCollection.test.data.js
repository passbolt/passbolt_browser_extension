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
 * @since         4.9.4
 */

import {defaultGroupSearchResultDto, defaultUserSearchResultDto} from "./userAndGroupSearchResultEntity.test.data";

/**
 * Build dtos.
 * @param {number} [count=10] The number of dtos.
 * @param {object} data The data to override the default dto.
 * @returns {object}
 */
export const defaultUserAndGroupSearchResultsDtos = (count = 10, data = {}) => {
  const dtos = [];
  for (let i = 0; i < count; i++) {
    if (i % 2 === 0) {
      const dto = defaultUserSearchResultDto(data);
      dtos.push(dto);
    } else {
      const dto2 = defaultGroupSearchResultDto(data);
      dtos.push(dto2);
    }
  }
  return dtos;
};
