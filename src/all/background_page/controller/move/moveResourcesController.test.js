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
import { defaultApiClientOptions } from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import MoveResourcesController from "./moveResourcesController";
import { pgpKeys } from "passbolt-styleguide/test/fixture/pgpKeys/keys";
import AccountEntity from "../../model/entity/account/accountEntity";
import { defaultAccountDto } from "../../model/entity/account/accountEntity.test.data";
import { v4 as uuidv4 } from "uuid";
import MockPort from "passbolt-styleguide/src/react-extension/test/mock/MockPort";
import { anonymousSiteSettings } from "passbolt-styleguide/src/shared/models/entity/siteSettings/siteSettingsEntity.test.data";
import SiteSettingsEntity from "passbolt-styleguide/src/shared/models/entity/siteSettings/siteSettingsEntity";
import GetOrFindSiteSettingsService from "../../service/siteSettings/getOrFindSiteSettingsService";
import PermissionsCollection from "passbolt-styleguide/src/shared/models/entity/permission/permissionsCollection";

describe("MoveResourcesController", () => {
  beforeEach(() => {
    jest
      .spyOn(GetOrFindSiteSettingsService.prototype, "getOrFind")
      .mockImplementation(() => new SiteSettingsEntity(anonymousSiteSettings()));
  });
  it("Should ask the user's passphrase and call the move service", async () => {
    expect.assertions(4);

    const worker = { port: new MockPort() };
    const account = new AccountEntity(defaultAccountDto());
    const expectedResourceIds = [uuidv4(), uuidv4(), uuidv4(), uuidv4()];
    const expectedDestinationFolderId = uuidv4();

    const controller = new MoveResourcesController(worker, null, defaultApiClientOptions(), account);
    const spyOnGetPassphrase = jest.spyOn(controller.getPassphraseService, "getPassphrase");
    const spyOnMoveResourceExec = jest.spyOn(controller.moveResourcesService, "moveAll");

    spyOnGetPassphrase.mockImplementation(async () => pgpKeys.ada.passphrase);
    spyOnMoveResourceExec.mockImplementation(
      async (resourceIds, destinationFolderId, confirmedPermissions, passphrase) => {
        expect(resourceIds).toStrictEqual(expectedResourceIds);
        expect(destinationFolderId).toStrictEqual(expectedDestinationFolderId);
        expect(confirmedPermissions).toEqual(new Map());
        expect(passphrase).toStrictEqual(pgpKeys.ada.passphrase);
      },
    );

    await controller.exec(expectedResourceIds, expectedDestinationFolderId);
  });

  it("converts the per-resource permissions DTO map into a Map of PermissionsCollection passed to the move service", async () => {
    expect.assertions(4);

    const worker = { port: new MockPort() };
    const account = new AccountEntity(defaultAccountDto());
    const resourceId = uuidv4();
    const resourceIds = [resourceId, uuidv4()];
    const destinationFolderId = uuidv4();
    // Sent as an object keyed by item id, each carrying the permissions that resource ends up with.
    const permissionsDto = {
      [resourceId]: [
        { aro: "User", aro_foreign_key: uuidv4(), aco: "Resource", aco_foreign_key: resourceId, type: 15 },
      ],
    };

    const controller = new MoveResourcesController(worker, null, defaultApiClientOptions(), account);
    jest.spyOn(controller.getPassphraseService, "getPassphrase").mockImplementation(async () => pgpKeys.ada.passphrase);
    jest
      .spyOn(controller.verifyOrTrustMetadataKeyService, "verifyTrustedOrTrustNewMetadataKey")
      .mockImplementation(jest.fn);
    jest.spyOn(controller.moveResourcesService, "moveAll").mockImplementation(jest.fn);

    await controller.exec(resourceIds, destinationFolderId, permissionsDto);

    expect(controller.moveResourcesService.moveAll).toHaveBeenCalledWith(
      resourceIds,
      destinationFolderId,
      expect.any(Map),
      pgpKeys.ada.passphrase,
    );
    const confirmedPermissions = controller.moveResourcesService.moveAll.mock.calls[0][2];
    expect(confirmedPermissions.get(resourceId)).toBeInstanceOf(PermissionsCollection);
    expect(confirmedPermissions.get(resourceId).items).toHaveLength(1);
    expect(confirmedPermissions.get(resourceId).items[0].type).toBe(15);
  });

  it("Should assert the given resourcesIds is an array of UUIDs", async () => {
    expect.assertions(1);

    const account = new AccountEntity(defaultAccountDto());
    const wrongResourcesIds = uuidv4();

    const controller = new MoveResourcesController(null, null, defaultApiClientOptions(), account);
    await expect(() => controller.exec(wrongResourcesIds, "")).rejects.toThrow(
      "The resourceIds should be a valid array of UUID",
    );
  });

  it("Should assert the given destination folder is a UUID", async () => {
    expect.assertions(1);

    const account = new AccountEntity(defaultAccountDto());
    const wrongResourcesIds = [uuidv4()];

    const controller = new MoveResourcesController(null, null, defaultApiClientOptions(), account);
    await expect(() => controller.exec(wrongResourcesIds, "")).rejects.toThrow(
      "The destinationFolderId should be a valid UUID",
    );
  });

  it("returns the skipped resource ids reported by the move service", async () => {
    expect.assertions(1);

    const worker = { port: new MockPort() };
    const account = new AccountEntity(defaultAccountDto());
    const resourceIds = [uuidv4(), uuidv4()];
    const destinationFolderId = uuidv4();
    const skippedResourceIds = [resourceIds[0]];

    const controller = new MoveResourcesController(worker, null, defaultApiClientOptions(), account);
    jest.spyOn(controller.getPassphraseService, "getPassphrase").mockImplementation(async () => pgpKeys.ada.passphrase);
    jest
      .spyOn(controller.verifyOrTrustMetadataKeyService, "verifyTrustedOrTrustNewMetadataKey")
      .mockImplementation(jest.fn);
    jest.spyOn(controller.moveResourcesService, "moveAll").mockResolvedValue({ skippedResourceIds });

    const result = await controller.exec(resourceIds, destinationFolderId);

    expect(result).toStrictEqual({ skippedResourceIds });
  });
});
