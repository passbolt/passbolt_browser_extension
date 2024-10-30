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
 * @since         4.10.1
 */

import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";
import SecretsCollection from "./secretsCollection";
import {minimalDto, readSecret} from "passbolt-styleguide/src/shared/models/entity/secret/secretEntity.test.data";
import SecretEntity from "./secretEntity";

describe("SecretsCollection", () => {
  it("schema must validate", () => {
    EntitySchema.validateSchema(SecretsCollection.ENTITY_NAME, SecretsCollection.getSchema());
  });

  describe("::constructor", () => {
    it("works with empty data", () => {
      expect.assertions(1);
      const collection = new SecretsCollection([]);
      expect(collection).toHaveLength(0);
    });

    it("works if valid minimal DTO is provided", () => {
      expect.assertions(4);
      const dto1 = minimalDto();
      const dto2 = minimalDto();
      const dtos = [dto1, dto2];
      const collection = new SecretsCollection(dtos);
      expect(JSON.stringify(collection)).toEqual(JSON.stringify(dtos));
      expect(collection).toHaveLength(2);
      expect(collection.items[0].data).toEqual(dto1.data);
      expect(collection.items[1].data).toEqual(dto2.data);
    });

    it("works if valid complete DTOs are provided", () => {
      expect.assertions(3);
      const dto1 = readSecret();
      const dto2 = readSecret();
      const dtos = [dto1, dto2];
      const collection = new SecretsCollection(dtos);
      expect(collection).toHaveLength(2);
      expect(collection.items[0].id).toEqual(dto1.id);
      expect(collection.items[1].id).toEqual(dto2.id);
    });

    it("works if valid complete entities are provided", () => {
      expect.assertions(3);
      const entity1 = new SecretEntity(readSecret());
      const entity2 = new SecretEntity(readSecret());
      const dtos = [entity1, entity2];
      const collection = new SecretsCollection(dtos);
      expect(collection).toHaveLength(2);
      expect(collection.items[0].id).toEqual(entity1.id);
      expect(collection.items[1].id).toEqual(entity2.id);
    });

    it("should throw if the collection schema does not validate", () => {
      expect.assertions(1);
      expect(() => new SecretsCollection({}))
        .toThrowEntityValidationError("items");
    });

    it("should throw if one of data item does not validate the collection entity schema", () => {
      const dto1 = minimalDto();
      const dto2 = minimalDto({id: 42});

      expect.assertions(1);
      expect(() => new SecretsCollection([dto1, dto2]))
        .toThrowCollectionValidationError("1.id.type");
    });

    it("should throw if one of data item does not validate the unique id build rule", () => {
      const dto1 = readSecret();
      const dto2 = readSecret({id: dto1.id});

      expect.assertions(1);
      expect(() => new SecretsCollection([dto1, dto2]))
        .toThrowCollectionValidationError("1.id.unique");
    });

    it("should throw if one of data item does not validate the unique resource id & user id tuple build rule", () => {
      const dto1 = readSecret();
      const dto2 = readSecret({resource_id: dto1.resource_id, user_id: dto1.user_id});

      expect.assertions(1);
      expect(() => new SecretsCollection([dto1, dto2]))
        .toThrowCollectionValidationError("1.resource_id:user_id.unique");
    });

    it("should, with enabling the ignore invalid option, ignore items which do not validate their schema", () => {
      const dto1 = readSecret();
      const dto2 = readSecret({id: 42});

      expect.assertions(2);
      const collection = new SecretsCollection([dto1, dto2], {ignoreInvalidEntity: true});
      expect(collection.items).toHaveLength(1);
      expect(collection.items[0].id).toEqual(dto1.id);
    });

    it("should, with enabling the ignore invalid option, ignore items which do not validate the unique id build rule", () => {
      const dto1 = readSecret();
      const dto2 = readSecret({id: dto1.id});

      expect.assertions(2);
      const collection = new SecretsCollection([dto1, dto2], {ignoreInvalidEntity: true});
      expect(collection.items).toHaveLength(1);
      expect(collection.items[0].id).toEqual(dto1.id);
    });
  });

  describe(":pushMany", () => {
    it("[performance] should ensure performance adding large dataset remains effective.", async() => {
      const count = 10_000;
      const dtos = [];
      for (let i = 0; i < count; i++) {
        dtos.push(readSecret());
      }

      const start = performance.now();
      const collection = new SecretsCollection(dtos);
      const time = performance.now() - start;
      expect(collection).toHaveLength(count);
      expect(time).toBeLessThan(10_000);
    });
  });
});
