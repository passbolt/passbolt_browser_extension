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
 * @since         4.8.0
 */

import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";
import GroupUpdateSecretsCollection from "./groupUpdateSecretsCollection";
import {minimalDto, readSecret} from "passbolt-styleguide/src/shared/models/entity/secret/secretEntity.test.data";
import SecretEntity from "passbolt-styleguide/src/shared/models/entity/secret/secretEntity";
import {v4 as uuid} from "uuid";
import {defaultResourcesSecretsDtos} from "./groupUpdateSecretsCollection.test.data";

describe("GroupUpdateSecretsCollection", () => {
  describe("::getSchema", () => {
    it("schema must validate", () => {
      EntitySchema.validateSchema(GroupUpdateSecretsCollection.name, GroupUpdateSecretsCollection.getSchema());
    });
  });

  describe("::constructor", () => {
    it("works with empty collection", () => {
      expect.assertions(1);

      expect(() => new GroupUpdateSecretsCollection([])).not.toThrow();
    });

    it("works if valid minimal DTOs is provided", () => {
      expect.assertions(4);

      const dto1 = minimalDto();
      const dto2 = minimalDto();
      const dto3 = minimalDto();
      const dtos = [dto1, dto2, dto3];

      const collection = new GroupUpdateSecretsCollection(dtos);

      expect(collection.items).toHaveLength(3);
      expect(collection.items[0]).toStrictEqual(new SecretEntity(dto1));
      expect(collection.items[1]).toStrictEqual(new SecretEntity(dto2));
      expect(collection.items[2]).toStrictEqual(new SecretEntity(dto3));
    });

    it("works if valid complete DTOs are provided", () => {
      const resource_id = uuid();
      const dto1 = readSecret({resource_id});
      const dto2 = readSecret({resource_id});
      const collection = new GroupUpdateSecretsCollection([dto1, dto2]);

      expect.assertions(3);
      expect(collection.items).toHaveLength(2);
      expect(collection.items[0]).toStrictEqual(new SecretEntity(dto1));
      expect(collection.items[1]).toStrictEqual(new SecretEntity(dto2));
    });

    it("should throw if the collection schema does not validate", () => {
      expect.assertions(1);

      expect(() => new GroupUpdateSecretsCollection({}))
        .toThrowEntityValidationError("items");
    });

    it("should throw if one of data item does not validate the collection entity schema", () => {
      expect.assertions(1);

      const dto1 = readSecret();
      const dto2 = readSecret({data: 42});

      expect(() => new GroupUpdateSecretsCollection([dto1, dto2]))
        .toThrowCollectionValidationError("1.data.type");
    });

    it("should ignore an entity that does not pass the validation", () => {
      expect.assertions(2);

      const dto1 = readSecret();
      const dto2 = readSecret({data: 42});
      const collection = new GroupUpdateSecretsCollection([dto1, dto2], {ignoreInvalidEntity: true});

      expect(collection).toHaveLength(1);
      expect(collection._items[0]).toStrictEqual(new SecretEntity(dto1));
    });

    it("should throw if one of data item does not validate the unique id build rule", () => {
      expect.assertions(1);

      const dto1 = readSecret();
      const dto2 = readSecret();
      const dto3 = readSecret({id: dto2.id});

      expect(() => new GroupUpdateSecretsCollection([dto1, dto2, dto3]))
        .toThrowCollectionValidationError("2.id.unique");
    });

    it("should throw if one of data item does not validate the unique resource id + user id build rule", () => {
      expect.assertions(1);

      const dto1 = readSecret();
      const dto2 = readSecret();
      const dto3 = readSecret({user_id: dto2.user_id, resource_id: dto2.resource_id});

      expect(() => new GroupUpdateSecretsCollection([dto1, dto2, dto3]))
        .toThrowCollectionValidationError("2.resource_id:user_id.unique");
    });
  });

  describe("::getResourceIdUserIdKey", () => {
    it("should return the expected key from a given secret", () => {
      expect.assertions(1);

      const entity = new SecretEntity(readSecret());
      expect(GroupUpdateSecretsCollection.getResourceIdUserIdKey(entity)).toStrictEqual(`${entity.resourceId}:${entity.userId}`);
    });
  });

  describe("GroupUpdateSecretsCollection:pushMany", () => {
    it("[performance] should ensure performance adding large dataset remains effective.", async() => {
      const groupUpdateSecretsCount = 10_000;
      const dtos = defaultResourcesSecretsDtos(groupUpdateSecretsCount);

      const start = performance.now();
      const collection = new GroupUpdateSecretsCollection(dtos);
      const time = performance.now() - start;
      expect(collection).toHaveLength(groupUpdateSecretsCount);
      expect(time).toBeLessThan(5_000);
    });
  });
});
