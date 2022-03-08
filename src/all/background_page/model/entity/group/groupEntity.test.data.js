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
 * @since         3.6.0
 */
import {v4 as uuidv4} from "uuid";
import {defaultGroupsUser, createGroupUser} from "../groupUser/groupUsersEntity.test.data";

export const createGroup = (data = {}) => {
  const defaultData = {
    name: "Current group",
    groups_users: [
      createGroupUser({user_id: uuidv4(), group_id: uuidv4(), is_admin: true})
    ]
  };

  return Object.assign(defaultData, data);
};

export const defaultGroup = (data = {}) => {
  const groupId = data.id || uuidv4();
  const defaultData = createGroup({
    id: groupId,
    created_by: uuidv4(),
    modified_by: uuidv4(),
    created: "2022-01-13T13:19:04.661Z",
    modified: "2022-01-13T13:19:04.661Z",
    groups_users: [
      defaultGroupsUser({user_id: uuidv4(), group_id: groupId, is_admin: true})
    ]
  });

  return Object.assign(defaultData, data);
};
