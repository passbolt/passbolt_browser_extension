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
import {users} from "passbolt-styleguide/src/shared/models/entity/user/userEntity.test.data";
import {defaultGroup} from "../../model/entity/group/groupEntity.test.data";
import {createGroupUser} from "../../model/entity/groupUser/groupUsersEntity.test.data";
import EncryptMessageService from "../../service/crypto/encryptMessageService";
import {pgpKeys} from "../../../../../test/fixtures/pgpKeys/keys";
import {defaultDyRunResponse} from "../../model/entity/group/update/groupUpdateDryRunResultEntity.test.data";
import {OpenpgpAssertion} from "../../utils/openpgp/openpgpAssertions";

export const updateGroupNameDto = (data = {}) => {
  const defaultData = defaultGroup({
    name: "group name updated",
  });

  return Object.assign(defaultData, data);
};

export const add2UsersToGroupDto = (data = {}) => {
  const groupId = data.id ? data.id : uuidv4();
  data.groups_users = data.groups_users || [];
  const groupsUsers = data.groups_users.concat([
    createGroupUser({id: users.admin.id, user_id: users.admin.id, group_id: groupId}),
    createGroupUser({id: users.betty.id, user_id: users.betty.id, group_id: groupId}),
  ]);

  return defaultGroup({
    id: groupId,
    groups_users: groupsUsers
  });
};

export const add2UsersToGroupDryRunResponse = async(data = {}) => {
  const resource1Id = uuidv4(); //both admin and betty doesn't have access
  const resource2Id = uuidv4(); //admin doesn't have access
  const resource3Id = uuidv4(); //betty doesn't have access

  const secretNeeded = [
    {Secret: {resource_id: resource1Id, user_id: users.admin.id}},
    {Secret: {resource_id: resource1Id, user_id: users.betty.id}},
    {Secret: {resource_id: resource2Id, user_id: users.betty.id}},
    {Secret: {resource_id: resource3Id, user_id: users.admin.id}}
  ];

  const adaPublicKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.public);
  const secrets = [
    {Secret: [{resource_id: resource1Id, data: await EncryptMessageService.encrypt("resource1-password", adaPublicKey)}]},
    {Secret: [{resource_id: resource2Id, data: await EncryptMessageService.encrypt("resource2-password", adaPublicKey)}]},
    {Secret: [{resource_id: resource3Id, data: await EncryptMessageService.encrypt("resource3-password", adaPublicKey)}]},
  ];

  const defaultData = Object.assign({
    SecretsNeeded: secretNeeded,
    Secrets: secrets
  }, data);

  return defaultDyRunResponse(defaultData);
};
