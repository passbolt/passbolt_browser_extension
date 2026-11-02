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
import { v4 as uuidv4 } from "uuid";
import deserializeConfirmedMovePermissions from "./deserializeConfirmedMovePermissions";
import PermissionsCollection from "passbolt-styleguide/src/shared/models/entity/permission/permissionsCollection";
import {
  ownerPermissionDto,
  readPermissionDto,
} from "passbolt-styleguide/src/shared/models/entity/permission/permissionEntity.test.data";

describe("deserializeConfirmedMovePermissions", () => {
  it("returns an empty Map when nothing was confirmed", () => {
    expect.assertions(2);
    expect(deserializeConfirmedMovePermissions(null, [])).toEqual(new Map());
    expect(deserializeConfirmedMovePermissions(undefined, [])).toEqual(new Map());
  });

  it("returns a Map of PermissionsCollection keyed by item id", () => {
    expect.assertions(4);
    const resourceAId = uuidv4();
    const resourceBId = uuidv4();
    const permissionsDtoByItemId = {
      [resourceAId]: [ownerPermissionDto({ aco_foreign_key: resourceAId })],
      [resourceBId]: [ownerPermissionDto({ aco_foreign_key: resourceBId })],
    };

    const result = deserializeConfirmedMovePermissions(permissionsDtoByItemId, [resourceAId, resourceBId]);

    expect(result).toBeInstanceOf(Map);
    expect(result.size).toBe(2);
    expect(result.get(resourceAId)).toBeInstanceOf(PermissionsCollection);
    expect(result.get(resourceBId)).toBeInstanceOf(PermissionsCollection);
  });

  it("builds the collections without asserting an owner (a no-owner target is validated later by the calculator)", () => {
    expect.assertions(1);
    const resourceId = uuidv4();
    // A lone read permission would throw at construction if assertAtLeastOneOwner were true.
    const permissionsDtoByItemId = { [resourceId]: [readPermissionDto({ aco_foreign_key: resourceId })] };

    expect(() => deserializeConfirmedMovePermissions(permissionsDtoByItemId, [resourceId])).not.toThrow();
  });

  it("keeps every entry when the confirmed item ids are all being moved", () => {
    expect.assertions(1);
    const resourceAId = uuidv4();
    const resourceBId = uuidv4();
    const permissionsDtoByItemId = {
      [resourceAId]: [ownerPermissionDto({ aco_foreign_key: resourceAId })],
      [resourceBId]: [ownerPermissionDto({ aco_foreign_key: resourceBId })],
    };

    const result = deserializeConfirmedMovePermissions(permissionsDtoByItemId, [resourceAId, resourceBId]);

    expect(result.size).toBe(2);
  });

  it("throws when a confirmed entry references an item that is not being moved", () => {
    expect.assertions(1);
    const movedResourceId = uuidv4();
    const foreignResourceId = uuidv4();
    const permissionsDtoByItemId = {
      [movedResourceId]: [ownerPermissionDto({ aco_foreign_key: movedResourceId })],
      [foreignResourceId]: [ownerPermissionDto({ aco_foreign_key: foreignResourceId })],
    };

    expect(() => deserializeConfirmedMovePermissions(permissionsDtoByItemId, [movedResourceId])).toThrow();
  });
});
