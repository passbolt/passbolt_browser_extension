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
import PermissionTransfersCollection from "./permissionTransfersCollection";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";
import {defaultPermissionTransferDto} from "passbolt-styleguide/src/shared/models/entity/permission/permissionTransferEntity.test.data";
import * as assertEntityProperty from "passbolt-styleguide/test/assert/assertEntityProperty";

describe("Permission transfer entity", () => {
  describe("::getSchema", () => {
    it("schema must validate", () => {
      EntitySchema.validateSchema(PermissionTransfersCollection.constructor.name, PermissionTransfersCollection.getSchema());
    });

    it("validates collection is an array", () => {
      assertEntityProperty.collection(PermissionTransfersCollection);
    });

    it("validates minItems property", () => {
      assertEntityProperty.collectionMinItems(PermissionTransfersCollection, 1);
    });
  });
  describe("::constructor", () => {
    it("works if valid minimal DTO is provided", () => {
      expect.assertions(3);

      const dtos = [defaultPermissionTransferDto()];
      console.log(dtos);
      const collection = new PermissionTransfersCollection(dtos);

      expect(collection.toDto()).toEqual(dtos);
      expect(collection.items[0].acoForeignKey).toEqual(dtos[0].aco_foreign_key);
      expect(collection.items[0].id).toEqual(dtos[0].id);
    });
  });
});
