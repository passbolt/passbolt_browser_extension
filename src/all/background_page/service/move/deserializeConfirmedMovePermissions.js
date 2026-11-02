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

/**
 * Turn the permissions the operator confirmed into a Map of item id to PermissionsCollection.
 * An empty Map means nothing was confirmed, and the items move with the permissions they have.
 * @param {Object<string, Array<object>>|null|undefined} permissionsDtoByItemId Permission DTOs, keyed by item id.
 * @param {Array<string>} allowedItemIds The ids of the items actually being moved, so a tampered
 *   payload cannot reach an item outside the move.
 * @returns {Map<string, PermissionsCollection>}
 * @throws {Error} If an entry references an item id absent from `allowedItemIds`.
 */
export default function deserializeConfirmedMovePermissions(permissionsDtoByItemId, allowedItemIds) {
  const confirmedPermissionsByItemId = new Map();
  if (!permissionsDtoByItemId) {
    return confirmedPermissionsByItemId;
  }
  const allowedIds = new Set(allowedItemIds);
  for (const [itemId, permissionsDto] of Object.entries(permissionsDtoByItemId)) {
    if (!allowedIds.has(itemId)) {
      throw new Error("Could not move, the confirmed permissions reference an item that is not being moved.");
    }
    confirmedPermissionsByItemId.set(
      itemId,
      new PermissionsCollection(permissionsDto, { assertAtLeastOneOwner: false }),
    );
  }
  return confirmedPermissionsByItemId;
}
