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
 * @since         2.13.0
 */
import PermissionEntity from "./permissionEntity";
import EntityValidationError from "passbolt-styleguide/src/shared/models/entity/abstract/entityValidationError";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";

/**
 * getTestDto
 * @returns {object}
 */
function getTestDto() {
  return {
    'aro': PermissionEntity.ARO_USER,
    'aco': PermissionEntity.ACO_RESOURCE,
    'aro_foreign_key': '7f077753-0835-4054-92ee-556660ea04f1',
    'aco_foreign_key': '7f077753-0835-4054-92ee-556660ea04f2',
    'type': PermissionEntity.PERMISSION_OWNER,
  };
}

describe("Entity permission", () => {
  it("schema must validate", () => {
    EntitySchema.validateSchema(PermissionEntity.ENTITY_NAME, PermissionEntity.getSchema());
  });

  it("constructor works if valid minimal DTO is provided", () => {
    const aroForeignKey = '7f077753-0835-4054-92ee-556660ea04f1';
    const acoForeignKey = '466dc5ea-27ce-4281-8db1-8b130469b9b2';
    const dto = {
      'aro': PermissionEntity.ARO_USER,
      'aco': PermissionEntity.ACO_RESOURCE,
      'aro_foreign_key': aroForeignKey,
      'aco_foreign_key': acoForeignKey,
      'type': PermissionEntity.PERMISSION_OWNER,
    };

    // Entity props is equal to original dto
    const entity = new PermissionEntity(dto);
    expect(entity.toDto()).toEqual(dto);

    // optional id is not set
    expect(entity.id).toBe(null);
    expect(entity._hasProp('id')).toBe(false);

    // Other fields are set properly
    expect(entity.aro).toBe(PermissionEntity.ARO_USER);
    expect(entity.aco).toBe(PermissionEntity.ACO_RESOURCE);
    expect(entity.type).toBe(PermissionEntity.PERMISSION_OWNER);
    expect(entity.aroForeignKey).toBe(aroForeignKey);
    expect(entity.acoForeignKey).toBe(acoForeignKey);
    expect(entity._hasProp('acoForeignKey')).toBe(true);
  });

  it("constructor works if valid DTO is provided with optional and non supported fields", () => {
    const aroForeignKey = '7f077753-0835-4054-92ee-556660ea04f1';
    const acoForeignKey = '466dc5ea-27ce-4281-8db1-8b130469b9b2';
    const id = '466dc5ea-27ce-4281-8db1-8b130469b9b3';
    const dto = {
      'id': id,
      'aro': PermissionEntity.ARO_USER,
      'aco': PermissionEntity.ACO_RESOURCE,
      'aro_foreign_key': aroForeignKey,
      'aco_foreign_key': acoForeignKey,
      'type': PermissionEntity.PERMISSION_OWNER,
      'modified': '2022-04-23 17:34:00',
      '_custom': 'not needed'
    };
    const filtered = {
      'id': id,
      'aro': PermissionEntity.ARO_USER,
      'aco': PermissionEntity.ACO_RESOURCE,
      'aro_foreign_key': aroForeignKey,
      'aco_foreign_key': acoForeignKey,
      'type': PermissionEntity.PERMISSION_OWNER,
      'modified': '2022-04-23 17:34:00',
    };

    // Entity props is filtered
    const entity = new PermissionEntity(dto);
    expect(entity.toDto()).toEqual(filtered);

    expect(entity._hasProp('_custom')).toBe(false);
    expect(entity._hasProp('id')).toBe(true);
    expect(entity._hasProp('modified')).toBe(true);
    expect(entity.id).toBe(id);
  });

  it("constructor returns validation error if dto required fields are missing", () => {
    try {
      new PermissionEntity({
        'id': 'nope',
        'modified': 123
      });
      expect(false).toBe(true);
    } catch (error) {
      expect((error instanceof EntityValidationError)). toBe(true);
      expect(error.hasError('id')).toBe(true);
      expect(error.hasError('modified')).toBe(true);
      expect(error.hasError('aro')).toBe(true);
      expect(error.hasError('aco')).toBe(true);
      expect(error.hasError('aro_foreign_key')).toBe(true);
      expect(error.hasError('aco_foreign_key')).toBe(true);
      expect(error.hasError('type')).toBe(true);
    }
  });

  it("assertion checks work", () => {
    const uuid0 = '7f077753-0835-4054-92ee-556660ea04f0';
    const uuid1 = '7f077753-0835-4054-92ee-556660ea04f1';
    const uuid2 = '7f077753-0835-4054-92ee-556660ea04f2';
    const uuid3 = '7f077753-0835-4054-92ee-556660ea04f3';
    const uuid4 = '7f077753-0835-4054-92ee-556660ea04f4';
    const uuid5 = '7f077753-0835-4054-92ee-556660ea04f5';

    const dto1 = {
      'id': uuid0,
      'aro': PermissionEntity.ARO_USER,
      'aco': PermissionEntity.ACO_RESOURCE,
      'aro_foreign_key': uuid1,
      'aco_foreign_key': uuid2,
      'type': PermissionEntity.PERMISSION_OWNER,
    };
    const dto2 = {
      'id': uuid3,
      'aro': PermissionEntity.ARO_GROUP,
      'aco': PermissionEntity.ACO_FOLDER,
      'aro_foreign_key': uuid4,
      'aco_foreign_key': uuid5,
      'type': PermissionEntity.PERMISSION_UPDATE,
    };
    const same = new PermissionEntity(dto1);
    const samesame = new PermissionEntity(dto1);
    const butdifferent = new PermissionEntity(dto2);

    expect(PermissionEntity.isIdMatching(same, samesame)).toBe(true);
    expect(PermissionEntity.isIdMatching(samesame, butdifferent)).toBe(false);

    expect(PermissionEntity.isAroMatching(same, samesame)).toBe(true);
    expect(PermissionEntity.isAroMatching(samesame, butdifferent)).toBe(false);

    expect(PermissionEntity.isAcoMatching(same, samesame)).toBe(true);
    expect(PermissionEntity.isAcoMatching(samesame, butdifferent)).toBe(false);

    expect(PermissionEntity.isAcoAndAroMatching(same, samesame)).toBe(true);
    expect(PermissionEntity.isAcoAndAroMatching(samesame, butdifferent)).toBe(false);

    expect(PermissionEntity.isTypeMatching(same, samesame)).toBe(true);
    expect(PermissionEntity.isTypeMatching(samesame, butdifferent)).toBe(false);

    expect(PermissionEntity.isMatchingAroAcoType(same, samesame)).toBe(true);
    expect(PermissionEntity.isMatchingAroAcoType(samesame, butdifferent)).toBe(false);

    expect(PermissionEntity.getHighestPermissionType(same, samesame)).toBe(PermissionEntity.PERMISSION_OWNER);
    expect(PermissionEntity.getHighestPermissionType(same, butdifferent)).toBe(PermissionEntity.PERMISSION_OWNER);
    expect(PermissionEntity.getHighestPermissionType(butdifferent, samesame)).toBe(PermissionEntity.PERMISSION_OWNER);

    expect(PermissionEntity.getHighestPermission(same, samesame)).toEqual(same);
    expect(PermissionEntity.getHighestPermission(same, butdifferent)).toEqual(same);
    expect(PermissionEntity.getHighestPermission(butdifferent, samesame)).toEqual(samesame);
  });

  it("assert permission fails if not an entity", () => {
    try {
      PermissionEntity.assertIsPermission(null);
      expect(false).toBe(true);
    } catch (error) {
      expect(error instanceof TypeError).toBe(true);
    }
    try {
      PermissionEntity.assertIsPermission(getTestDto());
      expect(false).toBe(true);
    } catch (error) {
      expect(error instanceof TypeError).toBe(true);
    }
    PermissionEntity.assertIsPermission(new PermissionEntity(getTestDto()));
  });

  it("assert permission fails if not an entity", () => {
    const p = new PermissionEntity(getTestDto());
    const uuid0 = '7f077753-0835-4054-92ee-556660ea04f0';
    const p2 = p.copyForAnotherAco(PermissionEntity.ACO_FOLDER, uuid0);
    expect(p2.toDto()).toEqual({
      'aro': PermissionEntity.ARO_USER,
      'aro_foreign_key': '7f077753-0835-4054-92ee-556660ea04f1',
      'aco': PermissionEntity.ACO_FOLDER,
      'aco_foreign_key': '7f077753-0835-4054-92ee-556660ea04f0',
      'type': PermissionEntity.PERMISSION_OWNER,
    });
  });
});
