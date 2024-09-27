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
 * @since         4.9.3
 */
import PermissionTransferEntity from "./permissionTransferEntity";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";
import * as assertEntityProperty from "passbolt-styleguide/test/assert/assertEntityProperty";
import {defaultPermissionTransferDto} from "passbolt-styleguide/src/shared/models/entity/permission/permissionTransferEntity.test.data";

describe("Permission transfer entity", () => {
  describe("::getSchema", () => {
    it("schema must validate", () => {
      EntitySchema.validateSchema(PermissionTransferEntity.constructor.name, PermissionTransferEntity.getSchema());
    });

    it("validates id property", () => {
      assertEntityProperty.string(PermissionTransferEntity, "id");
      assertEntityProperty.uuid(PermissionTransferEntity, "id");
      assertEntityProperty.required(PermissionTransferEntity, "id");
    });

    it("validates aco_foreign_key property", () => {
      assertEntityProperty.string(PermissionTransferEntity, "aco_foreign_key");
      assertEntityProperty.uuid(PermissionTransferEntity, "aco_foreign_key");
      assertEntityProperty.required(PermissionTransferEntity, "aco_foreign_key");
    });
  });

  describe("::constructor", () => {
    it("works if valid minimal DTO is provided", () => {
      expect.assertions(4);

      const dto = defaultPermissionTransferDto();
      const entity = new PermissionTransferEntity(dto);

      expect(entity.toDto()).toEqual(dto);
      expect(entity.acoForeignKey).toEqual(dto.aco_foreign_key);
      expect(entity.id).toEqual(dto.id);
      expect(entity.toDto(PermissionTransferEntity.ALL_CONTAIN_OPTIONS)).toEqual(dto);
    });
  });
});
