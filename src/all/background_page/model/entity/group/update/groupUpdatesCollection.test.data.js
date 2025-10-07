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
 * @since         5.6.0
 */

import {v4 as uuidv4} from "uuid";
import {readSecret} from "passbolt-styleguide/src/shared/models/entity/secret/secretEntity.test.data";

export const groupNameUpdateOperationDto = (data = {}) => ({
  id: uuidv4(),
  name: "Group name [UPDATED]",
  ...data,
});

const defaultGroupUser = (data = {}) => ({
  user_id: uuidv4(),
  is_admin: false,
  ...data,
});

export const groupMemberRoleUpdateOperationDto = (data = {}) => groupNameUpdateOperationDto({
  ...data,
  groups_users: [defaultGroupUser({
    id: uuidv4(),
  })]
});

export const groupMemberRemovalOperationDto = (data = {}) => groupNameUpdateOperationDto({
  ...data,
  groups_users: [defaultGroupUser({
    id: uuidv4(),
    delete: true,
  })]
});

export const groupMemberAdditionWithoutSecretOperationDto = (data = {}) => groupNameUpdateOperationDto({
  ...data,
  groups_users: [defaultGroupUser({
    delete: true,
  })]
});

export const groupMemberAdditionOperationDto = (data = {}) => {
  const defaultData = groupMemberAdditionWithoutSecretOperationDto(data);
  const secrets = data.secrets || [readSecret({user_id: defaultData.groups_users[0].user_id, ...data})];
  return {
    ...defaultData,
    secrets,
  };
};

/**
 * Returns an example of a GroupUpdateEntity with operations in random order.
 * @returns {object}
 */
export const defaultGroupUpdateDto = () => {
  const memberToAdd = {
    user_id: uuidv4(),
    is_admin: false,
  };
  const managerToAdd = {
    user_id: uuidv4(),
    is_admin: true,
  };
  const memberToUpgradetoManager = {
    id: uuidv4(),
    user_id: uuidv4(),
    is_admin: true
  };
  const managerToDowngradetoMember = {
    id: uuidv4(),
    user_id: uuidv4(),
    is_admin: false,
  };
  const memberToRemove = {
    id: uuidv4(),
    user_id: uuidv4(),
    delete: true,
  };

  const secret1MemberToAdd = readSecret({
    user_id: memberToAdd.user_id,
  });
  const secret2MemberToAdd = readSecret({
    user_id: memberToAdd.user_id,
  });
  const secret1ManagerToAdd = readSecret({
    user_id: managerToAdd.user_id,
    resource_id: secret1MemberToAdd.resource_id,
  });

  return {
    id: uuidv4(),
    name: "Group to update",
    groups_users: [
      memberToRemove,
      managerToDowngradetoMember,
      managerToAdd,
      memberToAdd,
      memberToUpgradetoManager
    ],
    secrets: [
      secret1ManagerToAdd,
      secret1MemberToAdd,
      secret2MemberToAdd,
    ]
  };
};
