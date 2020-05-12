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
import Validator from "validator";
import {FolderLocalStorage} from '../../service/local_storage/folderLocalStorage';
import {ApiClientOptions} from "../../service/api/apiClient/apiClientOptions";
import {FolderModel} from "./folderModel";

// Mock storage
jest.mock('../../service/local_storage/folderLocalStorage');

// Reset the modules before each test.
beforeEach(() => {
  window.Validator = Validator;
  jest.resetModules();
});

describe("FolderModel",  () => {
  it("getAllByIds works", async () => {
    FolderLocalStorage.get.mockResolvedValue(getReturnValue());
    const apiClientOptions = (new ApiClientOptions()).setBaseUrl('https://www.passbolt.test');
    const folderModel = new FolderModel(apiClientOptions);
    let result = await folderModel.getAllByIds(['5f1da286-37ae-4f1c-aaf1-e0342a5d4dc1']);
    expect(result.length).toBe(1);
    let search = ['2529edc2-3c04-4d31-bc38-0a28ce4e372a','5f1da286-37ae-4f1c-aaf1-e0342a5d4dc1']
    result = await folderModel.getAllByIds(search, true);
    expect(result.length).toBe(3);
    result = await folderModel.getAllByIds(['5f1da286-37ae-4f1c-aaf1-e0342a5d4d00']);
    expect(result.length).toBe(0);
  });

});

function getReturnValue() {
  return new Promise((resolve) => {
    resolve([
      {
        "id": "5f1da286-37ae-4f1c-aaf1-e0342a5d4dc1",
        "name": "Folder 1",
        "created": "2020-05-11T15:08:18+00:00",
        "modified": "2020-05-11T15:08:18+00:00",
        "created_by": "d57c10f5-639d-5160-9c81-8a0c6c4ec856",
        "modified_by": "d57c10f5-639d-5160-9c81-8a0c6c4ec856",
        "permission": {
          "id": "0cca6471-bbd3-48eb-811b-379d74216aba",
          "aco": "Folder",
          "aco_foreign_key": "5f1da286-37ae-4f1c-aaf1-e0342a5d4dc1",
          "aro": "User",
          "aro_foreign_key": "d57c10f5-639d-5160-9c81-8a0c6c4ec856",
          "type": 15,
          "created": "2020-05-11T15:08:18+00:00",
          "modified": "2020-05-11T15:08:18+00:00"
        },
        "folder_parent_id": null
      },
      {
        "id": "870ae6ca-538d-45ff-91ae-1466de7b27ac",
        "name": "Folder 2",
        "created": "2020-05-11T15:05:49+00:00",
        "modified": "2020-05-11T15:05:49+00:00",
        "created_by": "d57c10f5-639d-5160-9c81-8a0c6c4ec856",
        "modified_by": "d57c10f5-639d-5160-9c81-8a0c6c4ec856",
        "permission": {
          "id": "a6d0e707-d1bb-4e5e-a0fb-e8f2a0adf12c",
          "aco": "Folder",
          "aco_foreign_key": "870ae6ca-538d-45ff-91ae-1466de7b27ac",
          "aro": "User",
          "aro_foreign_key": "d57c10f5-639d-5160-9c81-8a0c6c4ec856",
          "type": 15,
          "created": "2020-05-11T15:05:49+00:00",
          "modified": "2020-05-11T15:05:49+00:00"
        },
        "folder_parent_id": null
      },
      {
        "id": "130162ae-a4eb-46ac-80b2-2a187601109c",
        "name": "Folder 3",
        "created": "2020-05-11T15:05:23+00:00",
        "modified": "2020-05-11T15:05:23+00:00",
        "created_by": "d57c10f5-639d-5160-9c81-8a0c6c4ec856",
        "modified_by": "d57c10f5-639d-5160-9c81-8a0c6c4ec856",
        "permission": {
          "id": "079fbc10-3ed6-4dc5-a0cc-9addfa696546",
          "aco": "Folder",
          "aco_foreign_key": "130162ae-a4eb-46ac-80b2-2a187601109c",
          "aro": "User",
          "aro_foreign_key": "d57c10f5-639d-5160-9c81-8a0c6c4ec856",
          "type": 15,
          "created": "2020-05-11T15:05:24+00:00",
          "modified": "2020-05-11T15:05:24+00:00"
        },
        "folder_parent_id": "870ae6ca-538d-45ff-91ae-1466de7b27ac"
      },
      {
        "id": "af372e21-b93b-480d-bcda-4a772ae141ba",
        "name": "Folder 4",
        "created": "2020-05-10T13:48:33+00:00",
        "modified": "2020-05-11T15:05:35+00:00",
        "created_by": "d57c10f5-639d-5160-9c81-8a0c6c4ec856",
        "modified_by": "d57c10f5-639d-5160-9c81-8a0c6c4ec856",
        "permission": {
          "id": "5acbabe0-9d11-49ae-abf9-8426435150ea",
          "aco": "Folder",
          "aco_foreign_key": "af372e21-b93b-480d-bcda-4a772ae141ba",
          "aro": "User",
          "aro_foreign_key": "d57c10f5-639d-5160-9c81-8a0c6c4ec856",
          "type": 15,
          "created": "2020-05-10T13:48:33+00:00",
          "modified": "2020-05-10T13:48:33+00:00"
        },
        "folder_parent_id": "870ae6ca-538d-45ff-91ae-1466de7b27ac"
      },
      {
        "id": "cccb2dd3-c064-46da-ae03-9b77ac19107e",
        "name": "Folder 5",
        "created": "2020-05-11T15:06:11+00:00",
        "modified": "2020-05-11T15:06:11+00:00",
        "created_by": "d57c10f5-639d-5160-9c81-8a0c6c4ec856",
        "modified_by": "d57c10f5-639d-5160-9c81-8a0c6c4ec856",
        "permission": {
          "id": "78c945bf-a9f7-458c-8e29-9c3aac7f8857",
          "aco": "Folder",
          "aco_foreign_key": "cccb2dd3-c064-46da-ae03-9b77ac19107e",
          "aro": "User",
          "aro_foreign_key": "d57c10f5-639d-5160-9c81-8a0c6c4ec856",
          "type": 15,
          "created": "2020-05-11T15:06:11+00:00",
          "modified": "2020-05-11T15:06:11+00:00"
        },
        "folder_parent_id": "af372e21-b93b-480d-bcda-4a772ae141ba"
      },
      {
        "id": "2529edc2-3c04-4d31-bc38-0a28ce4e372a",
        "name": "Folder A",
        "created": "2020-05-10T16:21:38+00:00",
        "modified": "2020-05-11T15:06:37+00:00",
        "created_by": "d57c10f5-639d-5160-9c81-8a0c6c4ec856",
        "modified_by": "d57c10f5-639d-5160-9c81-8a0c6c4ec856",
        "permission": {
          "id": "8e6f62d6-9b10-444e-8fc0-9caf9ec6cd1e",
          "aco": "Folder",
          "aco_foreign_key": "2529edc2-3c04-4d31-bc38-0a28ce4e372a",
          "aro": "User",
          "aro_foreign_key": "d57c10f5-639d-5160-9c81-8a0c6c4ec856",
          "type": 15,
          "created": "2020-05-10T16:21:38+00:00",
          "modified": "2020-05-10T16:21:38+00:00"
        },
        "folder_parent_id": null
      },
      {
        "id": "34719980-89d3-4791-9c5a-63ff91967fd5",
        "name": "Folder B",
        "created": "2020-05-11T15:06:22+00:00",
        "modified": "2020-05-11T15:06:22+00:00",
        "created_by": "d57c10f5-639d-5160-9c81-8a0c6c4ec856",
        "modified_by": "d57c10f5-639d-5160-9c81-8a0c6c4ec856",
        "permission": {
          "id": "aa67a15b-b421-43b2-8ff8-d186345f73db",
          "aco": "Folder",
          "aco_foreign_key": "34719980-89d3-4791-9c5a-63ff91967fd5",
          "aro": "User",
          "aro_foreign_key": "d57c10f5-639d-5160-9c81-8a0c6c4ec856",
          "type": 15,
          "created": "2020-05-11T15:06:22+00:00",
          "modified": "2020-05-11T15:06:22+00:00"
        },
        "folder_parent_id": "2529edc2-3c04-4d31-bc38-0a28ce4e372a"
      }
    ])
  });
}
