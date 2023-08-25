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
import {pgpKeys} from "../../../../../test/fixtures/pgpKeys/keys";
import {users} from "passbolt-styleguide/src/shared/models/entity/user/userEntity.test.data";
import {readSecret} from "../../model/entity/secret/secretEntity.test.data";
import {ownerPermissionDto} from "passbolt-styleguide/src/shared/models/entity/permission/permissionEntity.test.data.js";
import {defaultResourceDto} from "passbolt-styleguide/src/shared/models/entity/resource/resourceEntity.test.data";
import EncryptMessageService from "../../service/crypto/encryptMessageService";
import {OpenpgpAssertion} from "../../utils/openpgp/openpgpAssertions";

async function buildReadSecret(userId, resourceId, decryptedPrivateKey, cleartextMessage) {
  return readSecret({
    user_id: userId,
    resource_id: resourceId,
    data: await EncryptMessageService.encrypt(cleartextMessage, decryptedPrivateKey),
  });
}

export const _3ResourcesSharedWith3UsersResourcesDto = async() => {
  const resource1Id = uuidv4();
  const resource2Id = uuidv4();
  const resource3Id = uuidv4();

  const userAda = users.ada;
  const userAdmin = users.admin;
  const userBetty = users.betty;

  const resource1PermissionOwner = ownerPermissionDto({
    aco_foreign_key: resource1Id,
    aro_foreign_key: userAda.id,
  });

  const resource2PermissionOwner = ownerPermissionDto({
    aco_foreign_key: resource2Id,
    aro_foreign_key: userAda.id,
  });

  const resource3PermissionOwner = ownerPermissionDto({
    aco_foreign_key: resource3Id,
    aro_foreign_key: userAda.id,
  });

  const resource1FullPermissionAda = ownerPermissionDto({
    aco_foreign_key: resource1Id,
    aro_foreign_key: userAda.id,
    user: userAda,
    group: null
  });

  const resource2FullPermissionAda = ownerPermissionDto({
    aco_foreign_key: resource2Id,
    aro_foreign_key: userAda.id,
    user: userAda,
    group: null
  });

  const resource3FullPermissionAda = ownerPermissionDto({
    aco_foreign_key: resource3Id,
    aro_foreign_key: userAda.id,
    user: userAda,
    group: null
  });

  const resource2FullPermissionAdmin = ownerPermissionDto({
    aco_foreign_key: resource2Id,
    aro_foreign_key: userAdmin.id,
    user: userAdmin,
    group: null
  });

  const resource3FullPermissionBetty = ownerPermissionDto({
    aco_foreign_key: resource3Id,
    aro_foreign_key: userBetty.id,
    user: userBetty,
    group: null
  });

  const adaPublicKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.public);
  const secret1 = await buildReadSecret(userAda.id, resource1Id, adaPublicKey, "secret1");
  const secret2 = await buildReadSecret(userAda.id, resource2Id, adaPublicKey, "secret2");
  const secret3 = await buildReadSecret(userAda.id, resource3Id, adaPublicKey, "secret3");

  const resource1 = defaultResourceDto({
    id: resource1Id,
    permission: resource1PermissionOwner,
    permissions: [resource1FullPermissionAda],
    secrets: [secret1]
  });

  const resource2 = defaultResourceDto({
    id: resource2Id,
    permission: resource2PermissionOwner,
    permissions: [resource2FullPermissionAda, resource2FullPermissionAdmin],
    secrets: [secret2]
  });

  const resource3 = defaultResourceDto({
    id: resource3Id,
    permission: resource3PermissionOwner,
    permissions: [resource3FullPermissionAda, resource3FullPermissionBetty],
    secrets: [secret3]
  });

  return [resource1, resource2, resource3];
};

export const createChangesDto = (data = {}) => {
  const defaultData = {
    aco: "Resource",
    aco_foreign_key: uuidv4(),
    aro: "User",
    aro_foreign_key: uuidv4(),
    is_new: true,
    type: 1
  };
  return Object.assign(defaultData, data);
};
