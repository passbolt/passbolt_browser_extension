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
 * @since         2.13.0
 */
import FoldersCollection from "./foldersCollection";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";

describe("Folders collection entity", () => {
  it("schema must validate", () => {
    EntitySchema.validateSchema(FoldersCollection.ENTITY_NAME, FoldersCollection.getSchema());
  });

  it("constructor works if valid minimal DTO is provided", () => {
    const dto = [{
      "folder_parent_id": null,
      "name": "folder1"
    }, {
      "folder_parent_id": null,
      "name": "folder2"
    }];
    const entity = new FoldersCollection(dto);
    expect(entity.toDto()).toEqual(dto);
    expect(entity.items[0].name).toEqual('folder1');
    expect(entity.items[1].name).toEqual('folder2');
  });

  it("serialization return full object by default", () => {
    const dto = [
      {
        "id": "d9aaa38e-f80b-4823-b245-83e22a38f765",
        "name": "child",
        "created": "2020-05-06T18:54:49+00:00",
        "modified": "2020-05-06T18:54:49+00:00",
        "created_by": "d57c10f5-639d-5160-9c81-8a0c6c4ec856",
        "modified_by": "d57c10f5-639d-5160-9c81-8a0c6c4ec856",
        "permissions": [
          {
            "id": "1262b7d3-be18-4b5f-bc83-4c995235bb84",
            "aco": "Folder",
            "aco_foreign_key": "d9aaa38e-f80b-4823-b245-83e22a38f765",
            "aro": "User",
            "aro_foreign_key": "f848277c-5398-58f8-a82a-72397af2d450",
            "type": 1,
            "created": "2020-05-06T18:54:50+00:00",
            "modified": "2020-05-06T18:54:50+00:00",
            "group": null,
            "user": {
              "id": "f848277c-5398-58f8-a82a-72397af2d450",
              "role_id": "a58de6d3-f52c-5080-b79b-a601a647ac85",
              "username": "ada@passbolt.com",
              "active": true,
              "deleted": false,
              "created": "2020-03-02T11:14:33+00:00",
              "modified": "2020-04-02T11:14:33+00:00",
              "profile": {
                "id": "99522cc9-0acc-5ae2-b996-d03bded3c0a6",
                "user_id": "f848277c-5398-58f8-a82a-72397af2d450",
                "first_name": "Ada",
                "last_name": "Lovelace",
                "created": "2020-05-02T11:14:33+00:00",
                "modified": "2020-05-02T11:14:33+00:00",
                "avatar": {
                  "id": "5426cb53-d909-40eb-9202-38f2c1f94084",
                  "user_id": "f848277c-5398-58f8-a82a-72397af2d450",
                  "foreign_key": "99522cc9-0acc-5ae2-b996-d03bded3c0a6",
                  "model": "Avatar",
                  "filename": "ada.png",
                  "filesize": 170049,
                  "mime_type": "image\/png",
                  "extension": "png",
                  "hash": "97e36ab6528e26e3b9f988444ef490f125f49a39",
                  "path": "Avatar\/84\/a1\/21\/5426cb53d90940eb920238f2c1f94084\/5426cb53d90940eb920238f2c1f94084.png",
                  "adapter": "Local",
                  "created": "2020-05-02T11:14:35+00:00",
                  "modified": "2020-05-02T11:14:35+00:00",
                  "url": {
                    "medium": "img\/public\/Avatar\/84\/a1\/21\/5426cb53d90940eb920238f2c1f94084\/5426cb53d90940eb920238f2c1f94084.a99472d5.png",
                    "small": "img\/public\/Avatar\/84\/a1\/21\/5426cb53d90940eb920238f2c1f94084\/5426cb53d90940eb920238f2c1f94084.65a0ba70.png"
                  }
                }
              },
              "last_logged_in": ""
            }
          },
          {
            "id": "f073fd56-e5bd-4773-9ddb-da386de6ef51",
            "aco": "Folder",
            "aco_foreign_key": "d9aaa38e-f80b-4823-b245-83e22a38f765",
            "aro": "Group",
            "aro_foreign_key": "d57c10f5-639d-5160-9c81-8a0c6c4ec856",
            "type": 15,
            "created": "2020-05-06T18:54:49+00:00",
            "modified": "2020-05-06T18:54:49+00:00",
            "group": {
              "id": "516c2db6-0aed-52d8-854f-b3f3499995e7",
              "name": "Leadership team",
              "deleted": false,
              "created": "2016-01-29T13:39:25+00:00",
              "modified": "2016-01-29T13:39:25+00:00",
              "created_by": "d57c10f5-639d-5160-9c81-8a0c6c4ec856",
              "modified_by": "d57c10f5-639d-5160-9c81-8a0c6c4ec856"
            }
          }
        ],
        "permission": {
          "id": "f073fd56-e5bd-4773-9ddb-da386de6ef51",
          "aco": "Folder",
          "aco_foreign_key": "d9aaa38e-f80b-4823-b245-83e22a38f765",
          "aro": "User",
          "aro_foreign_key": "d57c10f5-639d-5160-9c81-8a0c6c4ec856",
          "type": 15,
          "created": "2020-05-06T18:54:49+00:00",
          "modified": "2020-05-06T18:54:49+00:00"
        },
        "folder_parent_id": "e2172205-139c-4e4b-a03a-933528123fff"
      }
    ];
    const folderCollection = new FoldersCollection(dto);
    const folders = JSON.parse(JSON.stringify(folderCollection));
    expect(folders[0].permissions[0].user.profile.first_name).toBe('Ada');
    expect(folders[0].permissions[0].user.profile.avatar.id).toBe('5426cb53-d909-40eb-9202-38f2c1f94084');
    expect(folders[0].permissions[1].group.name).toBe('Leadership team');
  });

  it("getAllChildren works", () => {
    /*
     *folder
     * - folder
     *folder0
     * - folder1
     * - folder2
     *    - folder3
     *      - folder4
     */
    const dto = [{
      "id": "e2172205-139c-4e4b-a03a-933528123fff",
      "folder_parent_id": null,
      "name": "folder"
    }, {
      "id": "e2172205-139c-4e4b-a03a-933528123ff1",
      "folder_parent_id": "e2172205-139c-4e4b-a03a-933528123fff",
      "name": "folder"
    }, {
      "id": "e2172205-139c-4e4b-a03a-933528123f00",
      "folder_parent_id": null,
      "name": "folder0"
    }, {
      "id": "e2172205-139c-4e4b-a03a-933528123f01",
      "folder_parent_id": "e2172205-139c-4e4b-a03a-933528123f00",
      "name": "folder1"
    }, {
      "id": "e2172205-139c-4e4b-a03a-933528123f02",
      "folder_parent_id": "e2172205-139c-4e4b-a03a-933528123f00",
      "name": "folder2"
    }, {
      "id": "e2172205-139c-4e4b-a03a-933528123f03",
      "folder_parent_id": "e2172205-139c-4e4b-a03a-933528123f02",
      "name": "folder3"
    }, {
      "id": "e2172205-139c-4e4b-a03a-933528123f04",
      "folder_parent_id": "e2172205-139c-4e4b-a03a-933528123f03",
      "name": "folder4"
    }];
    const collection = new FoldersCollection(dto);

    // check picking up last node works
    let result = collection.getAllChildren("e2172205-139c-4e4b-a03a-933528123f03");
    expect(result.length).toBe(1);
    expect(result.items.map(r => r.id)).toEqual([
      'e2172205-139c-4e4b-a03a-933528123f04'
    ]);

    // check picking up a branch works
    result = collection.getAllChildren("e2172205-139c-4e4b-a03a-933528123f00");
    expect(result.length).toBe(4);
    expect(result.items.map(r => r.id)).toEqual([
      'e2172205-139c-4e4b-a03a-933528123f01',
      'e2172205-139c-4e4b-a03a-933528123f02',
      'e2172205-139c-4e4b-a03a-933528123f03',
      'e2172205-139c-4e4b-a03a-933528123f04'
    ]);

    // check pick everything
    result = collection.getAllChildren(null);
    expect(result.length).toBe(7);

    // check pick empty collection
    result = collection.getAllChildren("e2172205-139c-4e4b-a03a-933528123f99");
    expect(result.length).toBe(0);

    // Test multi id select via static method call
    let outputCollection = new FoldersCollection([]);
    const parentIds = ['e2172205-139c-4e4b-a03a-933528123f03', 'e2172205-139c-4e4b-a03a-933528123f00'];
    parentIds.forEach(parentId => {
      outputCollection = FoldersCollection.getAllChildren(parentId, collection, outputCollection);
    });
    expect(outputCollection.length).toBe(4);
    expect(outputCollection.items.map(r => r.id)).toEqual([
      'e2172205-139c-4e4b-a03a-933528123f04',
      'e2172205-139c-4e4b-a03a-933528123f01',
      'e2172205-139c-4e4b-a03a-933528123f02',
      'e2172205-139c-4e4b-a03a-933528123f03'
    ]);
  });

  it("merge works", () => {
    const dto1 = [{
      "id": "e2172205-139c-4e4b-a03a-933528123fff",
      "folder_parent_id": null,
      "name": "folder1"
    }, {
      "id": "e2172205-139c-4e4b-a03a-933528123ff1",
      "folder_parent_id": "e2172205-139c-4e4b-a03a-933528123fff",
      "name": "folder2"
    }];
    const dto2 = [{
      "id": "e2172205-139c-4e4b-a03a-933528123f00",
      "folder_parent_id": null,
      "name": "folder3"
    }, {
      "id": "e2172205-139c-4e4b-a03a-933528123ff1",
      "folder_parent_id": "e2172205-139c-4e4b-a03a-933528123fff",
      "name": "folder2"
    }];
    const set1 = new FoldersCollection(dto1);
    const set2 = new FoldersCollection(dto2);
    set2.merge(set1);
    expect(set2.length).toBe(3);
  });

  it("getFolderPath works", () => {
    /*
     * folder001
     *    folder011
     *       folder 111
     *    folder012
     * folder002
     */
    const dto1 = [{
      "id": "e2172205-139c-4e4b-a03a-933528123001",
      "folder_parent_id": null,
      "name": "folder001"
    }, {
      "id": "e2172205-139c-4e4b-a03a-933528123011",
      "folder_parent_id": "e2172205-139c-4e4b-a03a-933528123001",
      "name": "folder011"
    }, {
      "id": "e2172205-139c-4e4b-a03a-933528123111",
      "folder_parent_id": "e2172205-139c-4e4b-a03a-933528123011",
      "name": "folder111"
    }, {
      "id": "e2172205-139c-4e4b-a03a-933528123012",
      "folder_parent_id": "e2172205-139c-4e4b-a03a-933528123001",
      "name": "folder012"
    }, {
      "id": "e2172205-139c-4e4b-a03a-933528123002",
      "folder_parent_id": null,
      "name": "folder002"
    }];
    const collection = new FoldersCollection(dto1);
    let path;

    path = collection.getFolderPath(null);
    expect(path).toEqual('/');

    path = collection.getFolderPath('e2172205-139c-4e4b-a03a-933528123001');
    expect(path).toEqual('/folder001');

    path = collection.getFolderPath('e2172205-139c-4e4b-a03a-933528123011');
    expect(path).toEqual('/folder001/folder011');

    path = collection.getFolderPath('e2172205-139c-4e4b-a03a-933528123111');
    expect(path).toEqual('/folder001/folder011/folder111');
  });
});
