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
import ResourceSecretsCollection from "./resourceSecretsCollection";
import {minimalDto, readSecret} from "../secretEntity.test.data";
import SecretEntity from "../secretEntity";
import EntityCollectionError from "passbolt-styleguide/src/shared/models/entity/abstract/entityCollectionError";
import {defaultResourcesSecretsDtos} from "./resourceSecretsCollection.test.data";

describe("ResourceSecretsCollection", () => {
  it("schema must validate", () => {
    EntitySchema.validateSchema(ResourceSecretsCollection.ENTITY_NAME, ResourceSecretsCollection.getSchema());
  });

  describe("ResourceSecretsCollection::constructor", () => {
    it("works with empty collection", () => {
      new ResourceSecretsCollection([]);
    });

    it("works if valid minimal DTOs is provided", () => {
      const dto1 = minimalDto();
      const dto2 = minimalDto();
      const dto3 = minimalDto();
      const dtos = [dto1, dto2, dto3];
      const collection = new ResourceSecretsCollection(dtos);

      expect.assertions(7);
      expect(collection.items).toHaveLength(3);
      expect(collection.items[0]).toBeInstanceOf(SecretEntity);
      expect(collection.items[0]._props.data).toEqual(dto1.data);
      expect(collection.items[1]).toBeInstanceOf(SecretEntity);
      expect(collection.items[1]._props.data).toEqual(dto2.data);
      expect(collection.items[2]).toBeInstanceOf(SecretEntity);
      expect(collection.items[2]._props.data).toEqual(dto3.data);
    });

    it("works if minimal entities are provided", () => {
      const entity1 = new SecretEntity(minimalDto());
      const entity2 = new SecretEntity(minimalDto());
      const entities = [entity1, entity2];
      const collection = new ResourceSecretsCollection(entities);

      expect.assertions(5);
      expect(collection.items).toHaveLength(2);
      expect(collection.items[0]).toBeInstanceOf(SecretEntity);
      expect(collection.items[0]._props.data).toEqual(entity1.data);
      expect(collection.items[1]).toBeInstanceOf(SecretEntity);
      expect(collection.items[1]._props.data).toEqual(entity2.data);
    });

    it("works if valid complete DTOs are provided", () => {
      const resourceId = crypto.randomUUID();
      const dto1 = readSecret({resource_id: resourceId});
      const dto2 = readSecret({resource_id: resourceId});
      const dtos = [dto1, dto2];
      const collection = new ResourceSecretsCollection(dtos);

      expect.assertions(5);
      expect(collection.items).toHaveLength(2);
      expect(collection.items[0]).toBeInstanceOf(SecretEntity);
      expect(collection.items[0]._props.id).toEqual(dto1.id);
      expect(collection.items[1]).toBeInstanceOf(SecretEntity);
      expect(collection.items[1]._props.id).toEqual(dto2.id);
    });

    it("should throw if one of data item does not validate the collection entity schema", () => {
      const dto1 = readSecret();
      const dto2 = readSecret({data: 42});

      expect.assertions(2);
      // Prior to migrating to collection V2 the returned error does not precise the path of the error.
      expect(() => new ResourceSecretsCollection([dto1, dto2]))
        .not.toThrowCollectionValidationError("1.data.type");
      expect(() => new ResourceSecretsCollection([dto1, dto2]))
        .toThrowCollectionValidationError("data.type");
    });

    it("should throw if one of data item does not validate the unique id build rule", () => {
      const resourceId = crypto.randomUUID();
      const dto1 = readSecret({resource_id: resourceId});
      const dto2 = readSecret({resource_id: resourceId});
      const dto3 = readSecret({id: dto2.id, resource_id: resourceId});

      expect.assertions(2);
      // Prior to migrating to collection V2 the returned error does not precise the path of the error.
      expect(() => new ResourceSecretsCollection([dto1, dto2, dto3]))
        .not.toThrowCollectionValidationError("2.id.unique_id");
      expect(() => new ResourceSecretsCollection([dto1, dto2, dto3]))
        .toThrowError(new EntityCollectionError(1, ResourceSecretsCollection.RULE_UNIQUE_ID, `Secret id ${dto2.id} already exists.`));
    });

    it("should throw if one of data item does not validate the unique user id build rule", () => {
      const resourceId = crypto.randomUUID();
      const dto1 = readSecret({resource_id: resourceId});
      const dto2 = readSecret({resource_id: resourceId});
      const dto3 = readSecret({user_id: dto2.user_id, resource_id: resourceId});

      expect.assertions(2);
      // Prior to migrating to collection V2 the returned error does not precise the path of the error.
      expect(() => new ResourceSecretsCollection([dto1, dto2, dto3]))
        .not.toThrowCollectionValidationError("2.user_id.unique_user_id");
      expect(() => new ResourceSecretsCollection([dto1, dto2, dto3]))
        .toThrowError(new EntityCollectionError(1, ResourceSecretsCollection.RULE_UNIQUE_USER_ID, `Secret for user id ${dto2.user_id} already exists.`));
    });

    it("should throw if one of data item does not validate the same resource id build rule", () => {
      const resourceId = crypto.randomUUID();
      const dto1 = readSecret({resource_id: resourceId});
      const dto2 = readSecret({resource_id: resourceId});
      const dto3 = readSecret({resource_id: crypto.randomUUID()});

      expect.assertions(2);
      // Prior to migrating to collection V2 the returned error does not precise the path of the error.
      expect(() => new ResourceSecretsCollection([dto1, dto2, dto3]))
        .not.toThrowCollectionValidationError("2.resource_id.same_resource");
      expect(() => new ResourceSecretsCollection([dto1, dto2, dto3]))
        .toThrowError(new EntityCollectionError(1, ResourceSecretsCollection.RULE_SAME_RESOURCE, `The collection is already used for another resource with id ${dto1.resource_id}.`));
    });
  });

  describe("ResourceSecretsCollection:pushMany", () => {
    it("[performance] should ensure performance adding large dataset remains effective.", async() => {
      const count = 10_000;
      const dtos = defaultResourcesSecretsDtos(count);

      const start = performance.now();
      const collection = new ResourceSecretsCollection(dtos);
      const time = performance.now() - start;
      expect(collection).toHaveLength(count);
      // @todo After performance improvment this assertion should be less than 5s.
      expect(time).not.toBeLessThan(5_000);
    });
  });

  describe("ResourceSecretsCollection:toDto", () => {
    it("should transform the collection items in dto format", () => {
      const dtos = defaultResourcesSecretsDtos();
      const collection = new ResourceSecretsCollection(dtos);

      expect.assertions(2);
      expect(collection.toDto()).toEqual(dtos);
      expect(JSON.stringify(collection)).toEqual(JSON.stringify(dtos));
    });
  });
});
