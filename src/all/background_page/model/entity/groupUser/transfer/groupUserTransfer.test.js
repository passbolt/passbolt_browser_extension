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
 * @since         3.0.0
 */
import GroupUserTransferEntity from "./groupUserTransferEntity";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";
import EntityValidationError from "passbolt-styleguide/src/shared/models/entity/abstract/entityValidationError";

describe("GroupUser transfer entity", () => {
  it("schema must validate", () => {
    EntitySchema.validateSchema(GroupUserTransferEntity.ENTITY_NAME, GroupUserTransferEntity.getSchema());
  });

  it("constructor works if valid minimal DTO is provided", () => {
    const dto = {
      group_id: '8e3874ae-4b40-590b-968a-418f704b9d9a',
      id: '898ce1d0-601f-5194-976b-147a680dd472'
    };
    const userDeleteTransfer = new GroupUserTransferEntity(dto);
    expect(userDeleteTransfer.toDto()).toEqual(dto);
    expect(userDeleteTransfer.groupId).toEqual('8e3874ae-4b40-590b-968a-418f704b9d9a');
    expect(userDeleteTransfer.id).toEqual('898ce1d0-601f-5194-976b-147a680dd472');
  });

  it("constructor fails if dto is empty", () => {
    const dto = {};
    try {
      new GroupUserTransferEntity(dto);
      expect(true).toBe(false);
    } catch (error) {
      expect((error instanceof EntityValidationError)).toBe(true);
      expect(error.hasError('group_id')).toBe(true);
      expect(error.hasError('id')).toBe(true);
    }
  });

  it("constructor fails if dto is invalid", () => {
    const dto = {
      id: 'not uuid',
      group_id: 'not uuid',
    };
    try {
      new GroupUserTransferEntity(dto);
      expect(true).toBe(false);
    } catch (error) {
      expect((error instanceof EntityValidationError)).toBe(true);
      expect(error.hasError('group_id')).toBe(true);
      expect(error.hasError('id')).toBe(true);
    }
  });

  it("constructor fails if id is empty", () => {
    const dto = {
      group_id: '8e3874ae-4b40-590b-968a-418f704b9d9a',
    };
    try {
      new GroupUserTransferEntity(dto);
      expect(true).toBe(false);
    } catch (error) {
      expect((error instanceof EntityValidationError)).toBe(true);
      expect(error.hasError('id')).toBe(true);
    }
  });

  it("constructor fails if group_id is empty", () => {
    const dto = {
      id: '8e3874ae-4b40-590b-968a-418f704b9d9a',
    };
    try {
      new GroupUserTransferEntity(dto);
      expect(true).toBe(false);
    } catch (error) {
      expect((error instanceof EntityValidationError)).toBe(true);
      expect(error.hasError('group_id')).toBe(true);
    }
  });
});
