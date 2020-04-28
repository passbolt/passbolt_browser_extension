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
import {PermissionEntity} from "./permissionEntity";
import {EntityValidationError} from "../abstract/entityValidationError";
import {EntitySchema} from "../abstract/entitySchema";
import Validator from 'validator';

// Reset the modules before each test.
beforeEach(() => {
  window.Validator = Validator;
  jest.resetModules();
});

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
      'type': PermissionEntity.PERMISSION_ADMIN,
    };

    // Entity props is equal to original dto
    const entity = new PermissionEntity(dto);
    expect(entity.toApiData()).toEqual(dto);

    // optional id is not set
    expect(entity.id).toBe(null);
    expect(entity._hasProp('id')).toBe(false);

    // Other fields are set properly
    expect(entity.aro).toBe(PermissionEntity.ARO_USER);
    expect(entity.aco).toBe(PermissionEntity.ACO_RESOURCE);
    expect(entity.type).toBe(PermissionEntity.PERMISSION_ADMIN);
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
      'type': PermissionEntity.PERMISSION_ADMIN,
      'modified': '2022-04-23 17:34:00',
      '_custom': 'not needed'
    };
    const filtered = {
      'id': id,
      'aro': PermissionEntity.ARO_USER,
      'aco': PermissionEntity.ACO_RESOURCE,
      'aro_foreign_key': aroForeignKey,
      'aco_foreign_key': acoForeignKey,
      'type': PermissionEntity.PERMISSION_ADMIN,
      'modified': '2022-04-23 17:34:00',
    };

    // Entity props is filtered
    const entity = new PermissionEntity(dto);
    expect(entity.toApiData()).toEqual(filtered);

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
    } catch(error) {
      expect((error instanceof EntityValidationError)).toBe(true);
      expect(error.hasError('id')).toBe(true);
      expect(error.hasError('modified')).toBe(true);
      expect(error.hasError('aro')).toBe(true);
      expect(error.hasError('aco')).toBe(true);
      expect(error.hasError('aro_foreign_key')).toBe(true);
      expect(error.hasError('aco_foreign_key')).toBe(true);
      expect(error.hasError('type')).toBe(true);
    }
  });
});
