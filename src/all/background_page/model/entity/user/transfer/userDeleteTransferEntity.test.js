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
import UserDeleteTransferEntity from "./userDeleteTransferEntity";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";
import * as assertEntityProperty from "passbolt-styleguide/test/assert/assertEntityProperty";
import {defaultUserDeleteTransferDto} from "passbolt-styleguide/src/shared/models/entity/user/userDeleteTransferEntity.test.data";
import EntityValidationError from "passbolt-styleguide/src/shared/models/entity/abstract/entityValidationError";
import CollectionValidationError from "passbolt-styleguide/src/shared/models/entity/abstract/collectionValidationError";

describe("User delete transfer entity", () => {
  describe("::getSchema", () => {
    it("schema must validate", () => {
      EntitySchema.validateSchema(UserDeleteTransferEntity.constructor.name, UserDeleteTransferEntity.getSchema());
    });
    it("validates owners property", () => {
      assertEntityProperty.array(UserDeleteTransferEntity, "owners");
      assertEntityProperty.notRequired(UserDeleteTransferEntity, "owners");
    });
    it("validates managers property", () => {
      assertEntityProperty.array(UserDeleteTransferEntity, "managers");
      assertEntityProperty.notRequired(UserDeleteTransferEntity, "managers");
    });
  });

  describe("::constructor", () => {
    it("constructor works if valid minimal DTO is provided (only owners)", () => {
      expect.assertions(5);

      const dto = defaultUserDeleteTransferDto();
      delete dto.managers;
      const userDeleteTransfer = new UserDeleteTransferEntity(dto);

      expect(userDeleteTransfer.toDto()).toEqual(dto);
      expect(userDeleteTransfer._owners).toBeDefined();
      expect(userDeleteTransfer._owners.length).toBe(1);
      expect(userDeleteTransfer._managers).toBeUndefined();
      expect(JSON.stringify(userDeleteTransfer._owners)).toEqual(JSON.stringify(dto.owners));
    });

    it("constructor works if valid minimal DTO is provided (only managers)", () => {
      expect.assertions(5);

      const dto = defaultUserDeleteTransferDto();
      delete dto.owners;
      const userDeleteTransfer = new UserDeleteTransferEntity(dto);

      expect(userDeleteTransfer.toDto()).toEqual(dto);
      expect(userDeleteTransfer._managers).toBeDefined();
      expect(userDeleteTransfer._managers.length).toBe(1);
      expect(userDeleteTransfer._owners).toBeUndefined();
      expect(JSON.stringify(userDeleteTransfer._managers)).toEqual(JSON.stringify(dto.managers));
    });

    it("constructor should fail", () => {
      expect.assertions(3);
      let t;
      t = () => { new UserDeleteTransferEntity({}); };
      expect(t).toThrow(EntityValidationError);
      t = () => { new UserDeleteTransferEntity({owners: []}); };
      expect(t).toThrow(CollectionValidationError);
      t = () => { new UserDeleteTransferEntity({managers: []}); };
      expect(t).toThrow(CollectionValidationError);
    });
  });
});
