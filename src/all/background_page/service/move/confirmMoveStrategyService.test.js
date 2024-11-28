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

import MockPort from "passbolt-styleguide/src/react-extension/test/mock/MockPort";
import ConfirmMoveStrategyService from "./confirmMoveStrategyService";
import {v4 as uuidv4} from "uuid";

describe("ConfirmMoveStrategyService", () => {
  it("should return true if the user choose to change permissions", async() => {
    expect.assertions(5);

    const worker = {
      port: new MockPort(),
    };
    const expectedDestinationFolderId = uuidv4();
    const expectedFolderParentId = uuidv4();
    const service = new ConfirmMoveStrategyService(worker);

    worker.port.addRequestListener("passbolt.folders.move-strategy.request", async(destinationFolderId, folderParentIds, folders, resources) => {
      expect(destinationFolderId).toStrictEqual(expectedDestinationFolderId);
      expect(folderParentIds).toStrictEqual([expectedFolderParentId]);
      expect(folders).toStrictEqual([]);
      expect(resources).toStrictEqual([]);
      return {moveOption: "change"};
    });

    await expect(service.confirm(expectedDestinationFolderId, expectedFolderParentId)).resolves.toStrictEqual(true);
  });

  it("should return false if the user choose to change permissions", async() => {
    expect.assertions(5);

    const worker = {
      port: new MockPort(),
    };
    const expectedDestinationFolderId = uuidv4();
    const expectedFolderParentId = uuidv4();
    const service = new ConfirmMoveStrategyService(worker);

    worker.port.addRequestListener("passbolt.folders.move-strategy.request", async(destinationFolderId, folderParentIds, folders, resources) => {
      expect(destinationFolderId).toStrictEqual(expectedDestinationFolderId);
      expect(folderParentIds).toStrictEqual([expectedFolderParentId]);
      expect(folders).toStrictEqual([]);
      expect(resources).toStrictEqual([]);
      return {moveOption: "keep"};
    });

    await expect(service.confirm(expectedDestinationFolderId, expectedFolderParentId)).resolves.toStrictEqual(false);
  });
});
