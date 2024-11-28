/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         3.8.0
 */
import {defaultApiClientOptions} from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import MoveResourcesController from "./moveResourcesController";
import {pgpKeys} from "passbolt-styleguide/test/fixture/pgpKeys/keys";
import AccountEntity from "../../model/entity/account/accountEntity";
import {defaultAccountDto} from "../../model/entity/account/accountEntity.test.data";
import {v4 as uuidv4} from "uuid";
import MockPort from "passbolt-styleguide/src/react-extension/test/mock/MockPort";

describe("MoveResourcesController", () => {
  it("Should ask the user's passphrase and call the move service", async() => {
    expect.assertions(3);

    const worker = {port: new MockPort()};
    const account = new AccountEntity(defaultAccountDto());
    const expectedResourceIds = [uuidv4(), uuidv4(), uuidv4(), uuidv4()];
    const expectedDestinationFolderId = uuidv4();

    const controller = new MoveResourcesController(worker, null, defaultApiClientOptions(), account);
    const spyOnGetPassphrase = jest.spyOn(controller.getPassphraseService, "getPassphrase");
    const spyOnMoveResourceExec = jest.spyOn(controller.moveResourcesService, "moveAll");

    spyOnGetPassphrase.mockImplementation(async() => pgpKeys.ada.passphrase);
    spyOnMoveResourceExec.mockImplementation(async(resourceIds, destinationFolderId, passphrase) => {
      expect(resourceIds).toStrictEqual(expectedResourceIds);
      expect(destinationFolderId).toStrictEqual(expectedDestinationFolderId);
      expect(passphrase).toStrictEqual(pgpKeys.ada.passphrase);
    });

    await controller.exec(expectedResourceIds, expectedDestinationFolderId, pgpKeys.ada.passphrase);
  });

  it("Should assert the given resourcesIds is an array of UUIDs", async() => {
    expect.assertions(1);

    const account = new AccountEntity(defaultAccountDto());
    const wrongResourcesIds = uuidv4();

    const controller = new MoveResourcesController(null, null, defaultApiClientOptions(), account);
    await expect(() => controller.exec(wrongResourcesIds, "")).rejects.toThrowError("The resourceIds should be a valid array of UUID");
  });

  it("Should assert the given destination folder is a UUID", async() => {
    expect.assertions(1);

    const account = new AccountEntity(defaultAccountDto());
    const wrongResourcesIds = [uuidv4()];

    const controller = new MoveResourcesController(null, null, defaultApiClientOptions(), account);
    await expect(() => controller.exec(wrongResourcesIds, "")).rejects.toThrowError("The destinationFolderId should be a valid UUID");
  });
});
