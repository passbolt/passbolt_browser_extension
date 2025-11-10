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
 * @since         5.7.0
 */

import {defaultGroupsDtos} from "../../model/entity/group/groupsCollection.test.data";

/**
 * Helper function to generate mock group data for testing.
 * Creates an array of group DTOs (Data Transfer Objects) with optional configurations.
 */
export const setupMockData = (count = 10, options = {}) => defaultGroupsDtos(count, {
  withModifier: true,
  withCreator: true,
  withMyGroupUser: true,
  withGroupsUsers: 5,
  ...options
});
