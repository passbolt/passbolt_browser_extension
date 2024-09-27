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
import GroupUserTransfersCollection from "./groupUserTransfersCollection";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";
import {defaultUserTransferDto} from "passbolt-styleguide/src/shared/models/entity/group/groupTransfer.test.data";
import * as assertEntityProperty from "passbolt-styleguide/test/assert/assertEntityProperty";
import {defaultUserTransfersCollectionDto} from "passbolt-styleguide/src/shared/models/entity/group/groupUserTransfersCollection.test.data";

describe("GroupUser transfer entity", () => {
  describe("::getSchema", () => {
    it("schema must validate", () => {
      EntitySchema.validateSchema(GroupUserTransfersCollection.constructor.name, GroupUserTransfersCollection.getSchema());
    });

    it("validates collection is an array", () => {
      assertEntityProperty.collection(GroupUserTransfersCollection);
    });

    it("validates minItems property", () => {
      assertEntityProperty.collectionMinItems(GroupUserTransfersCollection, 1);
    });
  });
  describe("::constructor", () => {
    it("works if valid minimal DTO is provided", () => {
      expect.assertions(1);

      const dtos = [defaultUserTransferDto()];
      const collection = new GroupUserTransfersCollection(dtos);

      expect(collection.toDto()).toEqual(dtos);
    });
  });
  describe("GroupUserTransfersCollection:pushMany", () => {
    it("[performance] should ensure performance adding large dataset remains effective.", async() => {
      const groupUserTransfersCount = 10_000;
      const dtos = defaultUserTransfersCollectionDto(groupUserTransfersCount);

      const start = performance.now();
      const collection = new GroupUserTransfersCollection(dtos);
      const time = performance.now() - start;
      expect(collection).toHaveLength(groupUserTransfersCount);
      expect(time).toBeLessThan(5_000);
    });
  });
});
