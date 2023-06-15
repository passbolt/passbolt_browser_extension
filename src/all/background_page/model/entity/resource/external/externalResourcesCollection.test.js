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
import ExternalFolderEntity from "../../folder/external/externalFolderEntity";

describe("ExternalResourcesCollection", () => {
  it("schema must validate", () => {
    EntitySchema.validateSchema(ExternalResourcesCollection.ENTITY_NAME, ExternalResourcesCollection.getSchema());
  });

  it("constructor works if valid minimal DTO is provided", () => {
    const dto = [{
      "name": "Password 1",
      "secret_clear": ""
    }, {
      "name": "Password 2",
      "secret_clear": ""
    }];
    const result = [{
      "name": "Password 1",
      "secret_clear": "",
      "folder_parent_path": "",
    }, {
      "name": "Password 2",
      "secret_clear": "",
      "folder_parent_path": "",
    }];
    const entity = new ExternalResourcesCollection(dto);
    expect(entity.toDto()).toEqual(result);
    expect(entity.items[0].name).toEqual("Password 1");
    expect(entity.items[1].name).toEqual("Password 2");
  });

  it("setFolderParentIdByPath set the folder_parent_id of the resources having a given path", () => {
    const dto = [{
      "name": "Password 1",
      "secret_clear": "",
      "folder_parent_path": "Root"
    }, {
      "name": "Password 2",
      "secret_clear": "",
      "folder_parent_path": "Root/Folder 1"
    }, {
      "name": "Password 3",
      "secret_clear": "",
      "folder_parent_path": "Root/Folder 1"
    }, {
      "name": "Password 4",
      "secret_clear": "",
      "folder_parent_path": "Root/Folder 1/Folder 2"
    }];
    const collection = new ExternalResourcesCollection(dto);
    const folderParentId = "10801423-4151-42a4-99d1-86e66145a08c";
    collection.setFolderParentIdsByPath("Root/Folder 1", folderParentId);
    expect(collection.getAll("name", "Password 1")[0].folderParentId).toBeNull();
    expect(collection.getAll("name", "Password 2")[0].folderParentId).toEqual(folderParentId);
    expect(collection.getAll("name", "Password 3")[0].folderParentId).toEqual(folderParentId);
    expect(collection.getAll("name", "Password 4")[0].folderParentId).toBeNull();
  });

  it("changeRootPath change the root path of the resources of the collection", () => {
    const dto = [{
      "name": "Password 1",
      "secret_clear": "",
      "folder_parent_path": ""
    }, {
      "name": "Password 2",
      "secret_clear": "",
      "folder_parent_path": "Folder 1"
    }, {
      "name": "Password 3",
      "secret_clear": "",
      "folder_parent_path": "Folder 1"
    }, {
      "name": "Password 4",
      "secret_clear": "",
      "folder_parent_path": "Folder 1/Folder 2"
    }];
    const collection = new ExternalResourcesCollection(dto);
    const rootFolder = new ExternalFolderEntity({"name": "Root", "folder_parent_path": "New"});
    collection.changeRootPath(rootFolder);
    for (const externalResourceEntity of collection) {
      expect(externalResourceEntity.folderParentPath).toMatch(/^New\/Root/);
    }
  });
});
