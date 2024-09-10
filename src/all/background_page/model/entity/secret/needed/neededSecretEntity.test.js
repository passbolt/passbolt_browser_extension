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
import NeededSecretEntity from "./neededSecretEntity";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";
import * as assertEntityProperty from "passbolt-styleguide/test/assert/assertEntityProperty";
import {defaultNeededSecretDto} from "passbolt-styleguide/src/shared/models/entity/secret/neededSecretEntity.test.data";

describe("Needed secret entity", () => {
  describe("::getSchema", () => {
    it("schema must validate", () => {
      EntitySchema.validateSchema(NeededSecretEntity.constructor.name, NeededSecretEntity.getSchema());
    });
    it("validates user id property", () => {
      assertEntityProperty.string(NeededSecretEntity, "user_id");
      assertEntityProperty.uuid(NeededSecretEntity, "user_id");
      assertEntityProperty.required(NeededSecretEntity, "user_id");
    });

    it("validates created property", () => {
      assertEntityProperty.string(NeededSecretEntity, "resource_id");
      assertEntityProperty.uuid(NeededSecretEntity, "resource_id");
      assertEntityProperty.required(NeededSecretEntity, "resource_id");
    });
  });

  describe("::constructor", () => {
    it("constructor works if valid minimal DTO is provided", () => {
      expect.assertions(3);

      const dto = defaultNeededSecretDto();
      const neededSecretEntity = new NeededSecretEntity(dto);

      expect(neededSecretEntity.toDto()).toEqual(dto);
      expect(neededSecretEntity.userId).toEqual(dto.user_id);
      expect(neededSecretEntity.resourceId).toEqual(dto.resource_id);
    });
  });
});
