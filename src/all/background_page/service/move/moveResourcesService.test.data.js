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
 * @since         5.16.0
 */
import PermissionsCollection from "passbolt-styleguide/src/shared/models/entity/permission/permissionsCollection";
import {
  ownerPermissionDto,
  readPermissionDto,
} from "passbolt-styleguide/src/shared/models/entity/permission/permissionEntity.test.data";
import { defaultResourceDto } from "passbolt-styleguide/src/shared/models/entity/resource/resourceEntity.test.data";

/**
 * Build the permission set a resource ends up with: the operator as owner, plus the given extras.
 * This is applied as it is, so it is exactly what the resource is left with.
 * @param {string} operatorId The operator's user id.
 * @param {string} resourceId The resource the target applies to.
 * @param {Array<{id: string, dto: Function}>} [extras=[]] The extra recipients, each optionally
 *   carrying its permission dto builder (defaults to a reader).
 * @returns {PermissionsCollection}
 */
export const buildTarget = (operatorId, resourceId, extras = []) =>
  new PermissionsCollection(
    [
      ownerPermissionDto({ aco_foreign_key: resourceId, aro_foreign_key: operatorId }),
      ...extras.map(({ id, dto = readPermissionDto }) => dto({ aco_foreign_key: resourceId, aro_foreign_key: id })),
    ],
    { assertAtLeastOneOwner: false },
  );

/**
 * Build a resource DTO the given operator owns outright, parented to the given folder.
 * @param {string} operatorId The operator's user id.
 * @param {string|null} [folderParentId=null] The parent folder id, or null for the root.
 * @returns {object}
 */
export const buildOwnedResourceDto = (operatorId, folderParentId = null) => {
  const perm = ownerPermissionDto({ aro_foreign_key: operatorId });
  return defaultResourceDto({
    id: perm.aco_foreign_key,
    folder_parent_id: folderParentId,
    permission: perm,
    permissions: [perm],
  });
};
