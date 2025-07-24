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
 */
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";
import ExternalResourcesCollection from "./externalResourcesCollection";
import {
  buildDefineNumberOfExternalResourcesCollectionDto,
  defaultExternalResourceCollectionDto,
  externalResourceCollectionWithoutIdsDto
} from "./externalResourcesCollection.test.data";
import ResourcesCollection from "../resourcesCollection";
import ExternalResourceEntity from "./externalResourceEntity";
import {v4 as uuid} from "uuid";
import CollectionValidationError from "passbolt-styleguide/src/shared/models/entity/abstract/collectionValidationError";
import ExternalFoldersCollection from "../../folder/external/externalFoldersCollection";
import {defaultExternalFoldersCollectionDto} from "../../folder/external/externalFoldersCollection.test.data";
import {defaultResourceDto} from "passbolt-styleguide/src/shared/models/entity/resource/resourceEntity.test.data";
import {defaultResourcesSecretsDtos} from "../../secret/resource/resourceSecretsCollection.test.data";
import ExternalFolderEntity from "../../folder/external/externalFolderEntity";

//@MU TODO: fix this test
describe.skip("ExternalResourcesCollection", () => {
  describe("::getSchema", () => {
    it("schema must validate", () => {
      EntitySchema.validateSchema(ExternalResourcesCollection.name, ExternalResourcesCollection.getSchema());
    });
  });

  describe("::constructor", () => {
    it("constructor works if valid minimal DTO is provided", () => {
      const dto = defaultExternalResourceCollectionDto();

      expect.assertions(dto.length + 1);

      const entity = new ExternalResourcesCollection(dto);

      expect(entity.toDto()).toStrictEqual(dto);
      for (let i = 0; i < dto.length; i++) {
        expect(entity.items[i].toDto()).toStrictEqual(dto[i]);
      }
    });

    it("constructor fails if reusing same id", () => {
      expect.assertions(1);
      const id = uuid();
      const externalResourceCollectionDto = defaultExternalResourceCollectionDto({id: id});
      expect(() => new ExternalResourcesCollection(externalResourceCollectionDto)).toThrow(CollectionValidationError);
    });

    it("constructor succeed if external resources have no ids", () => {
      expect.assertions(1);
      const externalResourceCollectionDto = externalResourceCollectionWithoutIdsDto();
      expect(() => new ExternalResourcesCollection(externalResourceCollectionDto)).not.toThrow();
    });

    it("constructor succeed if mixing unique ids and null ids", () => {
      expect.assertions(1);
      const externalResourceCollectionWithIdsDto = defaultExternalResourceCollectionDto();
      const externalResourceCollectionWithNullIdsDto = externalResourceCollectionWithoutIdsDto();
      const externalResourceCollectionDto = [...externalResourceCollectionWithIdsDto, ...externalResourceCollectionWithNullIdsDto];
      expect(() => new ExternalResourcesCollection(externalResourceCollectionDto)).not.toThrow();
    });

    it("constructor ignores invalid entities: entities with same non null id", () => {
      expect.assertions(1);
      const externalResourceCollectionDto = defaultExternalResourceCollectionDto({
        id: uuid()
      });
      const collection = new ExternalResourcesCollection(externalResourceCollectionDto, {ignoreInvalidEntity: true});

      expect(collection).toHaveLength(1);
    });

    it("constructor ignores invalid entities: entities with same non null id and keeps the one with null ids", () => {
      expect.assertions(1);
      const externalResourceCollectionDto = defaultExternalResourceCollectionDto({
        id: uuid()
      });
      const unsetIdExternalResourceCollectionDto = externalResourceCollectionWithoutIdsDto();
      const collectionDto = [...externalResourceCollectionDto, ...unsetIdExternalResourceCollectionDto];
      const collection = new ExternalResourcesCollection(collectionDto, {ignoreInvalidEntity: true});

      expect(collection).toHaveLength(unsetIdExternalResourceCollectionDto.length + 1);
    });
  });

  describe("::setFolderParentIdByPath", () => {
    it("setFolderParentIdByPath set the folder_parent_id of the resources having a given path", () => {
      expect.assertions(4);

      const dto = defaultExternalResourceCollectionDto({name: "Password ", folder_parent_id: null, folder_parent_path: "Root/Folder 1"});
      dto[0].name += "1";
      dto[1].name += "2";
      dto[2].name += "3";
      dto[3].name += "4";

      dto[0].folder_parent_path = "Root";
      dto[3].folder_parent_path += "/Folder 2";

      const collection = new ExternalResourcesCollection(dto);
      const folderParentId = "10801423-4151-42a4-99d1-86e66145a08c";
      collection.setFolderParentIdsByPath("Root/Folder 1", folderParentId);
      expect(collection.getAll("name", "Password 1")[0].folderParentId).toBeNull();
      expect(collection.getAll("name", "Password 2")[0].folderParentId).toEqual(folderParentId);
      expect(collection.getAll("name", "Password 3")[0].folderParentId).toEqual(folderParentId);
      expect(collection.getAll("name", "Password 4")[0].folderParentId).toBeNull();
    });
  });

  describe("::changeRootPath", () => {
    it("changeRootPath change the root path of the resources of the collection", () => {
      const dto = defaultExternalResourceCollectionDto({name: "Password ", folder_parent_path: "Fodler 1"});

      expect.assertions(dto.length);

      dto[0].folder_parent_path = "";
      dto[3].folder_parent_path += "/Folder 2";

      dto[0].name += "1";
      dto[0].name += "2";
      dto[0].name += "3";
      dto[0].name += "4";

      const collection = new ExternalResourcesCollection(dto);
      const rootFolder = new ExternalFolderEntity({"name": "Root", "folder_parent_path": "New"});
      collection.changeRootPath(rootFolder);
      for (const externalResourceEntity of collection) {
        expect(externalResourceEntity.folderParentPath).toMatch(/^New\/Root/);
      }
    });
  });

  describe("::toResourceCollectionImportDto", () => {
    it("should create a resource entity collection", () => {
      const collectionDto = defaultExternalResourceCollectionDto();
      const externalResourceCollection = new ExternalResourcesCollection(collectionDto);
      const resourceEntityCollection = externalResourceCollection.toResourceCollectionImportDto();

      const expectedCollectionDto = collectionDto.map(dto => new ExternalResourceEntity(dto).toResourceEntityImportDto());

      expect(resourceEntityCollection).toStrictEqual(expectedCollectionDto);
    });

    it("should generate a DTO that could be used to instantiate a ResourceEntityCollection", () => {
      expect.assertions(1);
      const dto = defaultExternalResourceCollectionDto();
      const externalResourceCollection = new ExternalResourcesCollection(dto);

      const resourceEntityCollectionDto = externalResourceCollection.toResourceCollectionImportDto();
      expect(() => new ResourcesCollection(resourceEntityCollectionDto)).not.toThrow();
    });
  });

  describe("::getByFolderParentId", () => {
    it("should return nothing if the folderParentId is not set", () => {
      expect.assertions(1);

      const collection = new ExternalResourcesCollection(defaultExternalResourceCollectionDto());
      expect(collection.getByFolderParentId(null)).toStrictEqual([]);
    });

    it("should filters the collection based on the folder parent id", () => {
      expect.assertions(1);

      const dto = defaultExternalResourceCollectionDto();
      const collection = new ExternalResourcesCollection(dto);
      const expectedExternalResource = collection._items[0];
      const folderParentId = expectedExternalResource.folderParentId;

      expect(collection.getByFolderParentId(folderParentId)).toStrictEqual([expectedExternalResource]);
    });
  });

  describe("::removeByPath", () => {
    it("should remove the targetted elements based on their path", () => {
      expect.assertions(1);
      const dto = defaultExternalResourceCollectionDto();
      const collection = new ExternalResourcesCollection(dto);

      const collectionSize = collection.length;

      const pathForRemoval = "toBeRemoved";
      collection._items[0].folderParentPath = pathForRemoval;
      collection._items[2].folderParentPath = pathForRemoval;

      collection.removeByPath(pathForRemoval);

      expect(collection).toHaveLength(collectionSize - 2);
    });

    it("should not remove elements if nothing matches", () => {
      expect.assertions(1);
      const dto = defaultExternalResourceCollectionDto();
      const collection = new ExternalResourcesCollection(dto);

      const collectionSize = collection.length;
      collection.removeByPath("no-match");
      expect(collection).toHaveLength(collectionSize);
    });
  });

  describe("::constructFromResourcesCollection", () => {
    it("should build an ExternalResourcesCollection from a ResourcesCollection and an ExternalFoldersCollection", () => {
      const externalFoldersCollection = new ExternalFoldersCollection(defaultExternalFoldersCollectionDto());
      const parentFolder = externalFoldersCollection._items[0];
      const expectedFolderPath = `${parentFolder.folderParentPath}/${parentFolder.name}`;

      const secretsDto1 = defaultResourcesSecretsDtos();
      const resourceDto1 = defaultResourceDto({
        id: secretsDto1[0].resource_id,
        folder_parent_id: parentFolder.id,
        secrets: secretsDto1,
        description: "description",
      });

      const secretsDto2 = defaultResourcesSecretsDtos();
      const resourceDto2 = defaultResourceDto({
        id: secretsDto2[0].resource_id,
        folder_parent_id: parentFolder.id,
        secrets: secretsDto2,
        description: "description",
      });

      const resourcesCollectionDto = [resourceDto1, resourceDto2];
      const resourcesCollection = new ResourcesCollection(resourcesCollectionDto);
      const externalResourceCollection = ExternalResourcesCollection.constructFromResourcesCollection(resourcesCollection, externalFoldersCollection);

      expect(externalResourceCollection).toBeInstanceOf(ExternalResourcesCollection);
      expect(externalResourceCollection).toHaveLength(2);

      const externalResource1 = externalResourceCollection._items[0];
      const externalResource2 = externalResourceCollection._items[1];

      expect(externalResource1.id).toStrictEqual(resourceDto1.id);
      expect(externalResource1.name).toStrictEqual(resourceDto1.metadata.name);
      expect(externalResource1.username).toStrictEqual(resourceDto1.metadata.username);
      expect(externalResource1.uri).toStrictEqual(resourceDto1.metadata.uris[0]);
      expect(externalResource1.description).toStrictEqual(resourceDto1.metadata.description);
      expect(externalResource1.secrets.toDto()).toStrictEqual(resourceDto1.secrets);
      expect(externalResource1.secretClear).toStrictEqual("");
      expect(externalResource1.totp).toBeNull();
      expect(externalResource1.folderParentPath).toStrictEqual(expectedFolderPath);
      expect(externalResource1.expired).toStrictEqual(resourceDto1.expired);

      expect(externalResource2.id).toStrictEqual(resourceDto2.id);
      expect(externalResource2.name).toStrictEqual(resourceDto2.metadata.name);
      expect(externalResource2.username).toStrictEqual(resourceDto2.metadata.username);
      expect(externalResource2.uri).toStrictEqual(resourceDto2.metadata.uris[0]);
      expect(externalResource2.description).toStrictEqual(resourceDto2.metadata.description);
      expect(externalResource2.secrets.toDto()).toStrictEqual(resourceDto2.secrets);
      expect(externalResource2.secretClear).toStrictEqual("");
      expect(externalResource2.totp).toBeNull();
      expect(externalResource2.folderParentPath).toStrictEqual(expectedFolderPath);
      expect(externalResource2.expired).toStrictEqual(resourceDto2.expired);
    });

    it("should assert the resourcesCollection to be of the right type", () => {
      expect.assertions(1);
      const externalFoldersCollection = new ExternalFoldersCollection(defaultExternalFoldersCollectionDto());
      expect(() => ExternalResourcesCollection.constructFromResourcesCollection(null, externalFoldersCollection)).toThrow(TypeError);
    });

    it("should assert the externalFoldersCollection to be of the right type", () => {
      expect.assertions(1);
      const resourcesCollection = new ResourcesCollection([defaultResourceDto()]);
      expect(() => ExternalResourcesCollection.constructFromResourcesCollection(resourcesCollection, null)).toThrow(TypeError);
    });
  });

  describe("ExternalResourcesCollection:pushMany", () => {
    it.skip("[performance] should ensure performance adding large dataset remains effective.", async() => {
      const externalResourcesCount = 10_000;
      const dtos = buildDefineNumberOfExternalResourcesCollectionDto(externalResourcesCount);

      const start = performance.now();
      const collection = new ExternalResourcesCollection(dtos);
      const time = performance.now() - start;
      expect(collection).toHaveLength(externalResourcesCount);
      expect(time).toBeLessThan(5_000);
    });
  });
});
