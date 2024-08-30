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
import ExternalFoldersCollection from "./externalFoldersCollection";
import ExternalFolderEntity from "./externalFolderEntity";
import {defaultExternalFoldersCollectionDto} from "./externalFoldersCollection.test.data";
import {v4 as uuid} from "uuid";
import FolderEntity from "../folderEntity";
import FoldersCollection from "../foldersCollection";
import {defaultExternalFolderDto, minimalExternalFolderDto} from "./externalFolderEntity.test.data";
import {defaultFolderDto} from "passbolt-styleguide/src/shared/models/entity/folder/folderEntity.test.data";

describe("ExternalFoldersCollection", () => {
  describe("::getSchema", () => {
    it("schema must validate", () => {
      EntitySchema.validateSchema(ExternalFoldersCollection.name, ExternalFoldersCollection.getSchema());
    });
  });

  describe("::constructor", () => {
    it("constructor works if valid minimal DTO is provided", () => {
      const dto = defaultExternalFoldersCollectionDto();

      expect.assertions(dto.length + 1);

      const collection = new ExternalFoldersCollection(dto);
      expect(collection.toDto()).toEqual(dto);

      for (let i = 0; i < collection.length; i++) {
        expect(collection._items[i]).toStrictEqual(new ExternalFolderEntity(dto[i]));
      }
    });
  });

  describe("::pushFromPath", () => {
    it("should push ExternalFolderEntities based on a given path", () => {
      expect.assertions(7);

      const collection = new ExternalFoldersCollection([]);
      const foldersPath = "Root/Category/SubFolder";
      collection.pushFromPath(foldersPath);

      expect(collection).toHaveLength(3);
      expect(collection._items[0].folderParentPath).toStrictEqual("");
      expect(collection._items[0].name).toStrictEqual("Root");
      expect(collection._items[1].folderParentPath).toStrictEqual("Root");
      expect(collection._items[1].name).toStrictEqual("Category");
      expect(collection._items[2].folderParentPath).toStrictEqual("Root/Category");
      expect(collection._items[2].name).toStrictEqual("SubFolder");
    });

    it("should do nothing if given an empty path", () => {
      expect.assertions(1);
      const collection = new ExternalFoldersCollection([]);
      collection.pushFromPath("");

      expect(collection).toHaveLength(0);
    });

    it("should do nothing if path already exists ", () => {
      expect.assertions(4);
      const externalRootFolderDto = minimalExternalFolderDto({
        folder_parent_path: "",
        name: "Root",
      });
      const externalFolderDto = minimalExternalFolderDto({
        folder_parent_path: "Root",
        name: "Folder",
      });
      const collection = new ExternalFoldersCollection([externalRootFolderDto, externalFolderDto]);
      expect(collection).toHaveLength(2);
      expect(collection.toDto()).toStrictEqual([externalRootFolderDto, externalFolderDto]);

      collection.pushFromPath("Root/Folder");

      expect(collection).toHaveLength(2);
      expect(collection.toDto()).toStrictEqual([externalRootFolderDto, externalFolderDto]);
    });

    it("should not create the already existing folders", () => {
      expect.assertions(7);
      const externalFolderDto = defaultExternalFolderDto({
        folder_parent_path: "Root",
        name: "Folder",
      });
      const collection = new ExternalFoldersCollection([externalFolderDto]);

      collection.pushFromPath(`${externalFolderDto.folder_parent_path}/${externalFolderDto.name}/SubFolder`);

      expect(collection).toHaveLength(3);
      expect(collection._items[0].folderParentPath).toStrictEqual("Root");
      expect(collection._items[0].name).toStrictEqual("Folder");
      expect(collection._items[1].folderParentPath).toStrictEqual("");
      expect(collection._items[1].name).toStrictEqual("Root");
      expect(collection._items[2].folderParentPath).toStrictEqual(`${externalFolderDto.folder_parent_path}/${externalFolderDto.name}`);
      expect(collection._items[2].name).toStrictEqual("SubFolder");
    });

    it("should push ExternalFolderEntities while sanitizing the given path", () => {
      const collection = new ExternalFoldersCollection([]);
      collection.pushFromPath("///Root //Folder 1////Folder 2 // ");

      expect(collection).toHaveLength(3);
      expect(collection._items[0].folderParentPath).toStrictEqual("");
      expect(collection._items[0].name).toStrictEqual("Root /");
      expect(collection._items[1].folderParentPath).toStrictEqual("Root /");
      expect(collection._items[1].name).toStrictEqual("Folder 1");
      expect(collection._items[2].folderParentPath).toStrictEqual("Root //Folder 1");
      expect(collection._items[2].name).toStrictEqual("Folder 2 // ");
    });
  });

  describe("::setFolderParentIdsByPath", () => {
    it("set the folder_parent_id of the folders having a given path", () => {
      expect.assertions(5);

      const collection = new ExternalFoldersCollection([]);
      collection.pushFromPath("Root/Folder 1/Folder 2");
      collection.pushFromPath("Root/Folder 1/Folder 3");
      collection.pushFromPath("Root/Folder 1/Folder 3/Folder 4");

      const folderParentId = uuid();
      collection.setFolderParentIdsByPath("Root/Folder 1", folderParentId);

      expect(collection.getByPath("Root").folderParentId).toBeNull();
      expect(collection.getByPath("Root/Folder 1").folderParentId).toBeNull();
      expect(collection.getByPath("Root/Folder 1/Folder 2").folderParentId).toEqual(folderParentId);
      expect(collection.getByPath("Root/Folder 1/Folder 3").folderParentId).toEqual(folderParentId);
      expect(collection.getByPath("Root/Folder 1/Folder 3/Folder 4").folderParentId).toBeNull();
    });
  });

  describe("::changeRootPath", () => {
    it("changeRootPath change the root path of the folders of the collection", () => {
      const collectionDto = defaultExternalFoldersCollectionDto();
      expect.assertions(collectionDto.length);

      const existingParentFolderPath = collectionDto[0].folder_parent_path;

      const collection = new ExternalFoldersCollection(collectionDto);
      const rootFolder = new ExternalFolderEntity({"name": "Root", "folder_parent_path": "New"});
      collection.changeRootPath(rootFolder);

      for (const externalFolderEntity of collection) {
        expect(externalFolderEntity.folderParentPath).toStrictEqual(`New/Root/${existingParentFolderPath}`);
      }
    });
  });

  describe("::toFoldersCollection", () => {
    it("should build a FoldersCollection", () => {
      const externalFoldersCollectionDto = defaultExternalFoldersCollectionDto();
      expect.assertions(externalFoldersCollectionDto.length + 1);

      const externalFoldersCollection = new ExternalFoldersCollection(externalFoldersCollectionDto);
      const foldersCollection = ExternalFoldersCollection.toFoldersCollection(externalFoldersCollection._items);

      expect(foldersCollection).toBeInstanceOf(FoldersCollection);
      for (let i = 0; i < externalFoldersCollectionDto.length; i++) {
        expect(foldersCollection._items[i]).toStrictEqual(new FolderEntity(externalFoldersCollectionDto[i]));
      }
    });

    it("should build from a FoldersCollection from an empty array", () => {
      expect.assertions(1);
      const foldersCollection = ExternalFoldersCollection.toFoldersCollection([]);
      expect(foldersCollection).toHaveLength(0);
    });

    it("should build a FoldersCollection while resolving escaped folder name", () => {
      expect.assertions(1);
      const externalFolder = new ExternalFolderEntity(minimalExternalFolderDto({
        name: "/ Ro / ot /",
      }));
      const foldersCollection = ExternalFoldersCollection.toFoldersCollection([externalFolder]);
      expect(foldersCollection.items[0].name).toBe("/Ro/ot/");
    });
  });

  describe("::removeByPath", () => {
    it("should remove the targetted elements based on their path", () => {
      expect.assertions(1);
      const dto = defaultExternalFoldersCollectionDto();
      const collection = new ExternalFoldersCollection(dto);
      const collectionSize = collection.length;
      const pathForRemoval = new ExternalFolderEntity({name: "toBeRemoved"});

      collection._items[0].changeRootPath(pathForRemoval);
      collection._items[2].changeRootPath(pathForRemoval);

      collection.removeByPath(pathForRemoval.path);

      expect(collection).toHaveLength(collectionSize - 2);
    });

    it("should not remove elements if nothing matches", () => {
      expect.assertions(1);
      const dto = defaultExternalFoldersCollectionDto();
      const collection = new ExternalFoldersCollection(dto);

      const collectionSize = collection.length;
      collection.removeByPath("no-match");
      expect(collection).toHaveLength(collectionSize);
    });
  });

  describe("::getEscapedFolderParentPath", () => {
    it("should get the folder parent path of the given folder entity when no escaping is necessary", () => {
      expect.assertions(1);
      const rootFolderEntity = new FolderEntity(defaultFolderDto());
      const folderEntity = new FolderEntity(defaultFolderDto({
        folder_parent_id: rootFolderEntity.id,
      }));
      const foldersCollection = new FoldersCollection([rootFolderEntity.toDto(), folderEntity.toDto()]);

      const result = ExternalFoldersCollection.getEscapedFolderParentPath(foldersCollection, folderEntity);
      expect(result).toStrictEqual(`${rootFolderEntity.name}`);
    });

    it("should escape the folder parent path of the given folder entity", () => {
      expect.assertions(1);
      const folderEntity1 = new FolderEntity(defaultFolderDto({
        name: "/ Root /",
      }));
      const folderEntity2 = new FolderEntity(defaultFolderDto({
        folder_parent_id: folderEntity1.id,
        name: "/  / Folder",
      }));
      const foldersCollection = new FoldersCollection([folderEntity1.toDto(), folderEntity2.toDto()]);

      const result = ExternalFoldersCollection.getEscapedFolderParentPath(foldersCollection, folderEntity2);
      expect(result).toStrictEqual('/  Root  /');
    });
  });

  describe("::constructFromFoldersCollection", () => {
    it("should build an EntityFoldersCollection from a FoldersCollection", () => {
      expect.assertions(14);
      const rootDto = defaultFolderDto({
        name: "Root",
        folder_parent_id: null,
      });
      const folder1Dto = defaultFolderDto({
        folder_parent_id: rootDto.id,
        name: "Folder 1",
      });
      const folder2Dto = defaultFolderDto({
        folder_parent_id: rootDto.id,
        name: "Folder 2",
      });
      const foldersCollection = new FoldersCollection([rootDto, folder1Dto, folder2Dto]);
      const result = ExternalFoldersCollection.constructFromFoldersCollection(foldersCollection);

      expect(result).toBeInstanceOf(ExternalFoldersCollection);
      expect(result).toHaveLength(3);

      const root = result._items[0];
      expect(root.id).toStrictEqual(root.id);
      expect(root.name).toStrictEqual("Root");
      expect(root.folderParentPath).toStrictEqual("");
      expect(root.folderParentId).toBeNull();

      const folder1 = result._items[1];
      expect(folder1.id).toStrictEqual(folder1Dto.id);
      expect(folder1.name).toStrictEqual("Folder 1");
      expect(folder1.folderParentPath).toStrictEqual("Root");
      expect(folder1.folderParentId).toStrictEqual(root.id);

      const folder2 = result._items[2];
      expect(folder2.id).toStrictEqual(folder2Dto.id);
      expect(folder2.name).toStrictEqual("Folder 2");
      expect(folder2.folderParentPath).toStrictEqual("Root");
      expect(folder2.folderParentId).toStrictEqual(root.id);
    });

    it("should return an empty ExternalFoldersCollection if the FoldersCollection is empty", () => {
      expect.assertions(2);
      const foldersCollection = new FoldersCollection([]);
      const exeternalFoldersCollection = ExternalFoldersCollection.constructFromFoldersCollection(foldersCollection);
      expect(exeternalFoldersCollection).toBeInstanceOf(ExternalFoldersCollection);
      expect(exeternalFoldersCollection).toHaveLength(0);
    });

    it("should assert the given collection as a FoldersCollection", () => {
      expect.assertions(1);
      expect(() => ExternalFoldersCollection.constructFromFoldersCollection([])).toThrow(TypeError);
    });

    it("should build an EntityFoldersCollection from a FoldersCollection while escaping name and path", () => {
      expect.assertions(8);
      const rootDto = defaultFolderDto({
        name: "/ Root /",
        folder_parent_id: null,
      });
      const folder1Dto = defaultFolderDto({
        folder_parent_id: rootDto.id,
        name: "// Folder 1",
      });
      const folder2Dto = defaultFolderDto({
        folder_parent_id: rootDto.id,
        name: "Folder 2 //",
      });
      const foldersCollection = new FoldersCollection([rootDto, folder1Dto, folder2Dto]);
      const result = ExternalFoldersCollection.constructFromFoldersCollection(foldersCollection);

      expect(result).toBeInstanceOf(ExternalFoldersCollection);
      expect(result).toHaveLength(3);

      const root = result._items[0];
      expect(root.name).toStrictEqual("/  Root  /");
      expect(root.folderParentPath).toStrictEqual("");

      const folder1 = result._items[1];
      expect(folder1.name).toStrictEqual("/  /  Folder 1");
      expect(folder1.folderParentPath).toStrictEqual("/  Root  /");

      const folder2 = result._items[2];
      expect(folder2.name).toStrictEqual("Folder 2  /  /");
      expect(folder2.folderParentPath).toStrictEqual("/  Root  /");
    });
  });

  describe("::hasPath", () => {
    it("should return true if an ExternalFolderEntity has the given path", () => {
      const externalFoldersCollectionDto = defaultExternalFoldersCollectionDto();
      expect.assertions(externalFoldersCollectionDto.length);
      const collection = new ExternalFoldersCollection(externalFoldersCollectionDto);

      for (let i = 0; i < collection.length; i++) {
        const externalFolder = collection._items[i];
        expect(collection.hasPath(externalFolder.path)).toStrictEqual(true);
      }
    });

    it("should return false if no ExternalFolderEntity has the given path", () => {
      expect.assertions(1);

      const externalFoldersCollectionDto = defaultExternalFoldersCollectionDto();
      const collection = new ExternalFoldersCollection(externalFoldersCollectionDto);
      expect(collection.hasPath("Unknown")).toStrictEqual(false);
    });

    it("should return false if the given path matches an ExternalFolderEntity folder parent path but the collection does not have a corresponding entity", () => {
      expect.assertions(1);

      const externalFoldersCollectionDto = defaultExternalFoldersCollectionDto({
        folder_parent_path: "Root",
      });
      const collection = new ExternalFoldersCollection(externalFoldersCollectionDto);
      expect(collection.hasPath("Root")).toStrictEqual(false);
    });
  });

  describe("::getById", () => {
    it("should return an ExternalFolderEntity matching the given id", () => {
      const externalFoldersCollectionDto = defaultExternalFoldersCollectionDto();
      expect.assertions(externalFoldersCollectionDto.length * 2);
      const collection = new ExternalFoldersCollection(externalFoldersCollectionDto);

      for (let i = 0; i < collection.length; i++) {
        const externalFolder = collection._items[i];
        expect(externalFolder).toBeInstanceOf(ExternalFolderEntity);
        expect(externalFolder.id).toStrictEqual(externalFoldersCollectionDto[i].id);
      }
    });

    it("should return null if no external folder matches", () => {
      expect.assertions(1);
      const externalFoldersCollectionDto = defaultExternalFoldersCollectionDto();
      const collection = new ExternalFoldersCollection(externalFoldersCollectionDto);
      expect(collection.getById(uuid())).toBeNull();
    });

    it("should return null if the collection is empty", () => {
      expect.assertions(1);
      const collection = new ExternalFoldersCollection([]);
      expect(collection.getById(uuid())).toBeNull();
    });
  });

  describe("::getByDepth", () => {
    it("should return all ExternalFolderEntities that match the given depth", () => {
      const externalFoldersCollectionDto = defaultExternalFoldersCollectionDto();
      expect.assertions(8 + externalFoldersCollectionDto.length);

      const additionalExternalFolder = defaultExternalFolderDto({
        folder_parent_id: externalFoldersCollectionDto[0].id,
        folder_parent_path: `${externalFoldersCollectionDto[0].folder_parent_path}/${externalFoldersCollectionDto[0].name}`,
      });
      externalFoldersCollectionDto.push(additionalExternalFolder);

      const collection = new ExternalFoldersCollection(externalFoldersCollectionDto);
      const depth0 = collection.getByDepth(0);
      const depth1 = collection.getByDepth(1);
      const depth2 = collection.getByDepth(2);

      expect(depth0).toBeInstanceOf(Array);
      expect(depth1).toBeInstanceOf(Array);
      expect(depth2).toBeInstanceOf(Array);

      expect(depth0).toHaveLength(0);
      expect(depth1).toHaveLength(externalFoldersCollectionDto.length - 1);
      expect(depth2).toHaveLength(1);

      expect(depth1[0]).toBeInstanceOf(ExternalFolderEntity);
      for (let i = 0; i < depth1.length; i++) {
        expect(depth1[i]).toStrictEqual(collection._items[i]);
      }

      expect(depth2[0]).toStrictEqual(collection._items[collection.length - 1]);
    });

    it("should return an empty array if the collection is empty", () => {
      expect.assertions(1);
      const collection = new ExternalFoldersCollection([]);
      expect(collection.getByDepth(0)).toStrictEqual([]);
    });

    it("should return an empty array if the depth is too high", () => {
      expect.assertions(1);
      const collection = new ExternalFoldersCollection(defaultExternalFoldersCollectionDto());
      expect(collection.getByDepth(42)).toStrictEqual([]);
    });

    it("should return an empty array if the depth is low enough but no external folder is present in the collection", () => {
      expect.assertions(2);
      const externalFoldersCollectionDto = defaultExternalFoldersCollectionDto();
      const collection = new ExternalFoldersCollection(externalFoldersCollectionDto);
      expect(collection.getByDepth(0)).toHaveLength(0);
      expect(collection.getByDepth(1)).toHaveLength(externalFoldersCollectionDto.length);
    });
  });

  describe("::getByPath", () => {
    it("should return an ExternalFolderEntity if the path matches", () => {
      const externalFoldersCollectionDto = defaultExternalFoldersCollectionDto();
      expect.assertions(externalFoldersCollectionDto.length);
      const collection = new ExternalFoldersCollection(externalFoldersCollectionDto);

      for (let i = 0; i < collection.length; i++) {
        const externalFolder = collection._items[i];
        expect(collection.getByPath(externalFolder.path)).toStrictEqual(externalFolder);
      }
    });

    it("should return null if the path do not matches any ExternalFolderEntity", () => {
      expect.assertions(1);

      const externalFoldersCollectionDto = defaultExternalFoldersCollectionDto();
      const collection = new ExternalFoldersCollection(externalFoldersCollectionDto);
      expect(collection.getByPath("Unknown")).toBeNull();
    });

    it("should return null if the path matches an ExternalFolderEntity folder parent path but the collection does not have that corresponding entity", () => {
      expect.assertions(1);

      const externalFoldersCollectionDto = defaultExternalFoldersCollectionDto({
        folder_parent_path: "Root",
      });
      const collection = new ExternalFoldersCollection(externalFoldersCollectionDto);
      expect(collection.getByPath("Root")).toBeNull();
    });
  });

  describe("::getByFolderParentId", () => {
    it("should return an array of ExternalFolderEntity if the id is matching the folder parent", () => {
      const folderParentId = uuid();
      const externalFoldersCollectionDto = defaultExternalFoldersCollectionDto({
        folder_parent_id: folderParentId,
      });
      expect.assertions(3 + externalFoldersCollectionDto.length);
      const collection = new ExternalFoldersCollection(externalFoldersCollectionDto);

      const result = collection.getByFolderParentId(folderParentId);
      expect(result).toBeInstanceOf(Array);
      expect(result).toHaveLength(externalFoldersCollectionDto.length);
      expect(result[0]).toBeInstanceOf(ExternalFolderEntity);

      for (let i = 0; i < result.length; i++) {
        const externalFolder = result[i];
        expect(externalFolder.folderParentId).toStrictEqual(folderParentId);
      }
    });

    it("should return an empty array if there is no matching folder parent id", () => {
      expect.assertions(2);
      const collection = new ExternalFoldersCollection(defaultExternalFoldersCollectionDto());
      const result = collection.getByFolderParentId(uuid());

      expect(result).toBeInstanceOf(Array);
      expect(result).toHaveLength(0);
    });

    it("should return an empty array if there no id is given in as argument", () => {
      expect.assertions(1);
      const collection = new ExternalFoldersCollection(defaultExternalFoldersCollectionDto());
      const result = collection.getByFolderParentId(null);
      expect(result).toHaveLength(0);
    });
  });
});
