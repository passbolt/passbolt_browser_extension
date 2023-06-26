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

describe("ExternalFoldersCollection", () => {
  it("schema must validate", () => {
    EntitySchema.validateSchema(ExternalFoldersCollection.ENTITY_NAME, ExternalFoldersCollection.getSchema());
  });

  it("constructor works if valid minimal DTO is provided", () => {
    const dto = [{
      "folder_parent_id": null,
      "name": "folder1"
    }, {
      "folder_parent_id": null,
      "name": "folder2"
    }];
    const result = [{
      "folder_parent_id": null,
      "folder_parent_path": "",
      "name": "folder1"
    }, {
      "folder_parent_id": null,
      "folder_parent_path": "",
      "name": "folder2"
    }];
    const entity = new ExternalFoldersCollection(dto);
    expect(entity.toDto()).toEqual(result);
    expect(entity.items[0].name).toEqual("folder1");
    expect(entity.items[1].name).toEqual("folder2");
  });

  function buildExternalFolderDto(num, data) {
    return Object.assign({
      name: `Folder ${num}`,
      folder_parent_path: ``
    }, data);
  }

  it("createAndPushMissingPathFolders creates and pushes missing path folders into the collection", () => {
    const collection = new ExternalFoldersCollection([]);
    const rootFolder = new ExternalFolderEntity({"name": "Root /"});
    collection.push(rootFolder);
    collection.pushFromPath("///Root //Folder 1////Folder 2 // ");

    expect(collection.items).toHaveLength(3);
    const folder1 = buildExternalFolderDto(1, {folder_parent_path: "Root /"});
    expect(collection.toJSON()).toEqual(expect.arrayContaining([folder1]));
    const folder2 = buildExternalFolderDto('2 // ', {folder_parent_path: "Root //Folder 1"});
    expect(collection.toJSON()).toEqual(expect.arrayContaining([folder2]));
  });

  it("setFolderParentIdByPath set the folder_parent_id of the folders having a given path", () => {
    const collection = new ExternalFoldersCollection([]);
    collection.pushFromPath("Root/Folder 1/Folder 2");
    collection.pushFromPath("Root/Folder 1/Folder 3");
    collection.pushFromPath("Root/Folder 1/Folder 3/Folder 4");
    const folderParentId = "10801423-4151-42a4-99d1-86e66145a08c";
    collection.setFolderParentIdsByPath("Root/Folder 1", folderParentId);
    expect(collection.getByPath("Root").folderParentId).toBeNull();
    expect(collection.getByPath("Root/Folder 1").folderParentId).toBeNull();
    expect(collection.getByPath("Root/Folder 1/Folder 2").folderParentId).toEqual(folderParentId);
    expect(collection.getByPath("Root/Folder 1/Folder 3").folderParentId).toEqual(folderParentId);
    expect(collection.getByPath("Root/Folder 1/Folder 3/Folder 4").folderParentId).toBeNull();
  });

  it("changeRootPath change the root path of the folders of the collection", () => {
    const collection = new ExternalFoldersCollection([{"name": "Folder 1"}, {"name": "Folder 2"}]);
    const rootFolder = new ExternalFolderEntity({"name": "Root", "folder_parent_path": "New"});
    collection.changeRootPath(rootFolder);
    for (const externalFolderEntity of collection) {
      expect(externalFolderEntity.folderParentPath).toEqual("New/Root");
    }
  });

  it("should build a FoldersCollection while resolving escaped folder name", () => {
    const externalFolderEntityList = [new ExternalFolderEntity({name: "/ Ro / ot /"})];
    const foldersCollection = ExternalFoldersCollection.toFoldersCollection(externalFolderEntityList);

    const folderEntity = foldersCollection.items[0];
    expect(folderEntity.name).toBe("/Ro/ot/");
  });
});
