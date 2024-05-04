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
 * @since         4.8.0
 */

import {defaultGroupDto} from "./groupEntity.test.data";

/**
 * Build groups dtos.
 * @param {number} [groupsCount=10] The number of groups.
 * @param {Object} [options]
 * @param {Object} [options.withModifier=false] Add modifier default dto.
 * @param {Object} [options.withCreator=false] Add creator default dto.
 * @param {Object} [options.withMyGroupUser=false] Add my group user default dto.
 * @param {Object} [options.withGroupsUsers=0] Add groups users default dto.
 * @returns {object}
 */
export const defaultGroupsDtos = (groupsCount = 10, options = {}) => {
  const dtos = [];
  for (let i = 0; i < groupsCount; i++) {
    const groupDto = defaultGroupDto({name: `Group ${i}`}, options);
    dtos.push(groupDto);
  }
  return dtos;
};

