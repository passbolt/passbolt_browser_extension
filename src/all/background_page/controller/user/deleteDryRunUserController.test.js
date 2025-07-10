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
 * @since         5.4.0
 */

import {enableFetchMocks} from "jest-fetch-mock";
import {mockApiResponse, mockApiResponseError} from "../../../../../test/mocks/mockApiResponse";
import {defaultApiClientOptions} from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import RoleEntity from "passbolt-styleguide/src/shared/models/entity/role/roleEntity";
import AccountEntity from "../../model/entity/account/accountEntity";
import {defaultAccountDto} from "../../model/entity/account/accountEntity.test.data";
import {defaultSharedResourcesWithEncryptedMetadataDtos, defaultResourcesDtos} from "passbolt-styleguide/src/shared/models/entity/resource/resourcesCollection.test.data";
import {defaultDecryptedSharedMetadataKeysDtos} from "passbolt-styleguide/src/shared/models/entity/metadata/metadataKeysCollection.test.data";
import PassboltApiFetchError from "passbolt-styleguide/src/shared/lib/Error/PassboltApiFetchError";
import DeleteDryRunUserController from "./deleteDryRunUserController";
import {v4 as uuidv4} from "uuid";
import DeleteDryRunError from "../../error/deleteDryRunError";
import {pgpKeys} from 'passbolt-styleguide/test/fixture/pgpKeys/keys';
import MetadataKeysCollection from "passbolt-styleguide/src/shared/models/entity/metadata/metadataKeysCollection";

beforeEach(() => {
  enableFetchMocks();
});

describe("DeleteDryRunUserController", () => {
  describe("::exec", () => {
    const accountDto = defaultAccountDto();
    accountDto.role_name = RoleEntity.ROLE_ADMIN;
    const account = new AccountEntity(accountDto);

    it("Should delete dry run the user without transfer", async() => {
      expect.assertions(1);

      const userId = uuidv4();

      fetch.doMockOnceIf(new RegExp(`/users/${userId}/dry-run.json`), () => mockApiResponse({}));

      const controller = new DeleteDryRunUserController(null, null, defaultApiClientOptions(), account);
      jest.spyOn(controller.deleteUserService, "deleteDryRun");

      await controller.exec(userId);

      expect(controller.deleteUserService.deleteDryRun).toHaveBeenCalledWith(userId);
    });

    it("Should throw an error if the user has transfer and decrypt", async() => {
      expect.assertions(2);

      const userId = uuidv4();
      const metadataKeysDtos = defaultDecryptedSharedMetadataKeysDtos();
      const metadataKeys = new MetadataKeysCollection(metadataKeysDtos);
      const collectionDto = defaultSharedResourcesWithEncryptedMetadataDtos(10, {
        metadata_key_id: metadataKeysDtos[0].id
      });
      const body = {
        errors: {
          resources: {
            sole_owner: collectionDto
          }
        }
      };

      fetch.doMockOnceIf(new RegExp(`/users/${userId}/dry-run.json`), () => mockApiResponseError(400, "Need transfer", body));

      const controller = new DeleteDryRunUserController(null, null, defaultApiClientOptions(), account);
      jest.spyOn(controller.decryptMetadataService.getOrFindMetadataKeysService, "getOrFindAll").mockImplementation(() => metadataKeys);
      jest.spyOn(controller.getPassphraseService, "getPassphrase").mockImplementationOnce(() => pgpKeys.ada.passphrase);

      try {
        await controller.exec(userId);
      } catch (error) {
        expect(error).toBeInstanceOf(DeleteDryRunError);
        expect(error.errors.resources.sole_owner.items.every(resourceEntity => resourceEntity.isMetadataDecrypted())).toBeTruthy();
      }
    });

    it("Should throw an error if the user has transfer without decryption", async() => {
      expect.assertions(4);

      const userId = uuidv4();
      const collectionDto = defaultResourcesDtos();
      const body = {
        errors: {
          resources: {
            sole_owner: collectionDto
          }
        }
      };

      fetch.doMockOnceIf(new RegExp(`/users/${userId}/dry-run.json`), () => mockApiResponseError(400, "Need transfer", body));

      const controller = new DeleteDryRunUserController(null, null, defaultApiClientOptions(), account);
      jest.spyOn(controller.decryptMetadataService.getOrFindMetadataKeysService, "getOrFindAll");
      jest.spyOn(controller.getPassphraseService, "getPassphrase");

      try {
        await controller.exec(userId);
      } catch (error) {
        expect(error).toBeInstanceOf(DeleteDryRunError);
        expect(error.errors.resources.sole_owner.items.every(resourceEntity => resourceEntity.isMetadataDecrypted())).toBeTruthy();
        expect(controller.decryptMetadataService.getOrFindMetadataKeysService.getOrFindAll).not.toHaveBeenCalled();
        expect(controller.getPassphraseService.getPassphrase).not.toHaveBeenCalled();
      }
    });

    it("Should throw an error if something wrong happens on the API", async() => {
      expect.assertions(1);

      const userId = uuidv4();
      fetch.doMockOnceIf(new RegExp(`/users/${userId}/dry-run.json`), async() => mockApiResponseError(500, "Something went wrong"));

      const controller = new DeleteDryRunUserController(null, null, defaultApiClientOptions(), account);
      try {
        await controller.exec(userId);
      } catch (e) {
        expect(e).toBeInstanceOf(PassboltApiFetchError);
      }
    });
  });
});
